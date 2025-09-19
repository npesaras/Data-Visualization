import { useEffect, useState, useCallback, useRef } from "react";
import { addEmigrant, getEmigrants, updateEmigrant, deleteEmigrant, type Emigrant } from './services/emigrantServices';
import { testConnection, testBasicConnection } from './lib/appwrite';
import { importCSVToAppwrite, validateCSVFile, downloadSampleCSV, type ImportResult } from './services/importCSV';
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import { Badge } from "./components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./components/ui/table";
import { BarChart } from "./components/bar-chart";
import { CustomPieChart } from "./components/pie-chart";
import { AreaChart } from "./components/area-chart";
import { StackedAreaChart } from "./components/stacked-area-chart";
import { StatsSummary } from "./components/stats-summary";
import { ChartSelector } from "./components/chart-selector";

interface FormData {
  year: string;
  single: string;
  married: string;
  widower: string;
  separated: string;
  divorced: string;
  notReported: string;
}

function App() {
  const [emigrants, setEmigrants] = useState<Emigrant[]>([]);
  const [form, setForm] = useState<FormData>({
    year: "",
    single: "",
    married: "",
    widower: "",
    separated: "",
    divorced: "",
    notReported: ""
  });
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<string>("Checking connection...");
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [lastConnectionCheck, setLastConnectionCheck] = useState<Date>(new Date());
  
  // CSV Import states
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvImporting, setCsvImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  
  // Connection monitoring ref to store interval ID
  const connectionIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Improved connection test function
  const testAppwriteConnection = useCallback(async (showLogs = true) => {
    try {
      if (showLogs) console.log('Testing Appwrite connection...');
      
      // First try the main connection test
      const result = await testConnection();
      
      if (result.status === 'success') {
        setConnectionStatus(`Connected - ${result.message}`);
        setIsConnected(true);
        if (showLogs) console.log('✅ Appwrite connection successful:', result);
        return true;
      } else {
        // If main test fails, try basic connection
        if (showLogs) console.log('Primary test failed, trying basic connection...');
        const basicResult = await testBasicConnection();
        
        if (basicResult.status === 'success' || basicResult.status === 'warning') {
          setConnectionStatus(`Connected - ${basicResult.message}`);
          setIsConnected(true);
          if (showLogs) console.log('✅ Basic connection successful:', basicResult);
          return true;
        } else {
          setConnectionStatus(`Error - ${basicResult.message}`);
          setIsConnected(false);
          if (showLogs) console.error('❌ All connection tests failed:', basicResult);
          return false;
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setConnectionStatus(`Error - ${errorMessage}`);
      setIsConnected(false);
      if (showLogs) console.error('❌ Connection test exception:', error);
      return false;
    } finally {
      setLastConnectionCheck(new Date());
    }
  }, []);

  // Start continuous connection monitoring
  const startConnectionMonitoring = useCallback(() => {
    // Clear any existing interval
    if (connectionIntervalRef.current) {
      clearInterval(connectionIntervalRef.current);
    }

    // Initial connection test
    testAppwriteConnection(true);

    // Set up periodic connection checks (every 30 seconds)
    connectionIntervalRef.current = setInterval(() => {
      testAppwriteConnection(false); // Silent checks after initial
    }, 30000); // 30 seconds

    console.log('🔄 Connection monitoring started (checks every 30 seconds)');
  }, [testAppwriteConnection]);

  // Stop connection monitoring
  const stopConnectionMonitoring = useCallback(() => {
    if (connectionIntervalRef.current) {
      clearInterval(connectionIntervalRef.current);
      connectionIntervalRef.current = null;
      console.log('⏹️ Connection monitoring stopped');
    }
  }, []);

  // Manual connection refresh
  const refreshConnection = useCallback(async () => {
    setConnectionStatus("Refreshing connection...");
    await testAppwriteConnection(true);
  }, [testAppwriteConnection]);

  // CSV Import handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCsvFile(file);
      setImportResult(null);
    }
  };

  const handleImportCSV = async () => {
    if (!csvFile) {
      alert('Please select a CSV file first');
      return;
    }

    try {
      setCsvImporting(true);
      setImportResult(null);
      
      console.log('Starting CSV import for file:', csvFile.name);
      
      // Validate file first
      const validation = await validateCSVFile(csvFile);
      if (!validation.isValid) {
        setImportResult({
          success: false,
          message: `Invalid CSV file: ${validation.errors.join(', ')}`,
          importedCount: 0,
          skippedCount: 0,
          errors: validation.errors
        });
        return;
      }

      // Import the CSV
      const result = await importCSVToAppwrite(csvFile);
      setImportResult(result);
      
      if (result.success) {
        // Refresh the emigrants list
        await fetchData();
        // Clear the form and file input
        clearForm();
        setCsvFile(null);
        // Reset file input
        const fileInput = document.getElementById('csv-file-input') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      }
      
    } catch (error) {
      console.error('CSV import error:', error);
      setImportResult({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        importedCount: 0,
        skippedCount: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      });
    } finally {
      setCsvImporting(false);
    }
  };

  const handleDownloadSample = () => {
    downloadSampleCSV();
  };

  // Test Appwrite connection on load and start monitoring
  useEffect(() => {
    startConnectionMonitoring();
    fetchData();
    // Add sample data immediately for demo purposes
    addSampleData();

    // Cleanup on unmount
    return () => {
      stopConnectionMonitoring();
    };
  }, [startConnectionMonitoring, stopConnectionMonitoring]);

  // Remove the second useEffect that was causing timing issues

  const addSampleData = () => {
    // Sample data for demonstration purposes
    const sampleData = [
      { year: 2020, single: 15000, married: 25000, widower: 2000, separated: 1500, divorced: 3000, notReported: 1000 },
      { year: 2021, single: 16500, married: 27000, widower: 2200, separated: 1600, divorced: 3200, notReported: 1100 },
      { year: 2022, single: 17200, married: 26800, widower: 2100, separated: 1700, divorced: 3300, notReported: 1200 },
      { year: 2023, single: 18000, married: 28500, widower: 2300, separated: 1800, divorced: 3500, notReported: 1300 }
    ];
    
    setEmigrants(sampleData.map((data, index) => ({
      ...data,
      $id: `sample-${index}`,
      $createdAt: new Date().toISOString(),
      $updatedAt: new Date().toISOString(),
      $permissions: [],
      $databaseId: 'sample',
      $collectionId: 'sample',
      $sequence: index
    })));
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('Fetching emigrants data...');
      const data = await getEmigrants();
      console.log('Fetched emigrants:', data);
      setEmigrants(data);
    } catch (error) {
      console.error("Error fetching data:", error);
      alert(`Error fetching data: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const clearForm = () => {
    setForm({
      year: "",
      single: "",
      married: "",
      widower: "",
      separated: "",
      divorced: "",
      notReported: ""
    });
  };


  const handleAdd = async () => {
    if (!form.year) {
      alert("Please enter a year");
      return;
    }

    try {
      setLoading(true);
      console.log('Adding emigrant with data:', {
        year: Number(form.year) || 0,
        single: Number(form.single) || 0,
        married: Number(form.married) || 0,
        widower: Number(form.widower) || 0,
        separated: Number(form.separated) || 0,
        divorced: Number(form.divorced) || 0,
        notReported: Number(form.notReported) || 0
      });
      
      const result = await addEmigrant({
        year: Number(form.year) || 0,
        single: Number(form.single) || 0,
        married: Number(form.married) || 0,
        widower: Number(form.widower) || 0,
        separated: Number(form.separated) || 0,
        divorced: Number(form.divorced) || 0,
        notReported: Number(form.notReported) || 0
      });
      
      console.log('Successfully added emigrant:', result);
      clearForm(); // Use the new clearForm function
      await fetchData();
      alert('Record added successfully!');
    } catch (error) {
      console.error("Error adding emigrant:", error);
      alert(`Error adding record: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteEmigrant(id);
      fetchData();
    } catch (error) {
      console.error("Error deleting emigrant:", error);
    }
  };

  const handleUpdate = async (id: string) => {
    const newYear = prompt("Enter new year:");
    if (newYear) {
      try {
        await updateEmigrant(id, { year: Number(newYear) });
        fetchData();
      } catch (error) {
        console.error("Error updating emigrant:", error);
      }
    }
  };

  // Prepare data for charts
  const chartData = emigrants.map(e => ({
    year: e.year.toString(),
    Single: e.single,
    Married: e.married,
    Widower: e.widower,
    Separated: e.separated,
    Divorced: e.divorced,
    "Not Reported": e.notReported,
    Total: e.single + e.married + e.widower + e.separated + e.divorced + e.notReported,
  }));

  // Prepare yearly totals data
  const yearlyTotalsData = emigrants.map(e => ({
    year: e.year.toString(),
    "Total Emigrants": e.single + e.married + e.widower + e.separated + e.divorced + e.notReported,
  }));

  // Calculate summary statistics
  const totalEmigrants = emigrants.reduce((total, e) => 
    total + e.single + e.married + e.widower + e.separated + e.divorced + e.notReported, 0
  );
  
  const totalByStatus = emigrants.reduce((acc, e) => ({
    single: acc.single + e.single,
    married: acc.married + e.married,
    widower: acc.widower + e.widower,
    separated: acc.separated + e.separated,
    divorced: acc.divorced + e.divorced,
    notReported: acc.notReported + e.notReported,
  }), { single: 0, married: 0, widower: 0, separated: 0, divorced: 0, notReported: 0 });

  // Prepare pie chart data for marital status breakdown
  const pieChartData = [
    { category: "Single", count: totalByStatus.single, fill: "#3b82f6" },
    { category: "Married", count: totalByStatus.married, fill: "#10b981" },
    { category: "Widower", count: totalByStatus.widower, fill: "#f59e0b" },
    { category: "Separated", count: totalByStatus.separated, fill: "#8b5cf6" },
    { category: "Divorced", count: totalByStatus.divorced, fill: "#ef4444" },
    { category: "Not Reported", count: totalByStatus.notReported, fill: "#6b7280" },
  ].filter(item => item.count > 0); // Only show categories with data

  const pieChartConfig = {
    count: {
      label: "Count",
    },
    single: {
      label: "Single",
      color: "var(--chart-1)",
    },
    married: {
      label: "Married",
      color: "var(--chart-2)",
    },
    widower: {
      label: "Widower",
      color: "var(--chart-3)",
    },
    separated: {
      label: "Separated",
      color: "var(--chart-4)",
    },
    divorced: {
      label: "Divorced",
      color: "var(--chart-5)",
    },
    "not-reported": {
      label: "Not Reported",
      color: "var(--chart-6)",
    },
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Filipino Emigrants Data</h1>
          <p className="text-muted-foreground mt-1">Manage and visualize emigrant statistics</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Badge 
              variant={isConnected ? 'default' : 'destructive'}
              className="relative"
            >
              <span className={`inline-block w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
              {connectionStatus}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshConnection}
              disabled={loading}
              title="Refresh connection status"
              className="px-3"
            >
              🔄
            </Button>
          </div>
          <div className="text-xs text-muted-foreground hidden sm:block">
            Last check: {lastConnectionCheck.toLocaleTimeString()}
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add New Emigrant Record</CardTitle>
          <CardDescription>
            Enter emigrant data by marital status for a specific year
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.keys(form).map(key => (
              <div key={key} className="space-y-2">
                <Label htmlFor={key} className="text-sm font-medium">
                  {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                </Label>
                <Input
                  id={key}
                  name={key}
                  placeholder={`Enter ${key}`}
                  value={form[key as keyof FormData]}
                  onChange={handleChange}
                  type="number"
                  disabled={loading}
                  className="w-full"
                />
              </div>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <Button onClick={handleAdd} className="flex-1 min-w-0" disabled={loading}>
              {loading ? "Adding..." : "Add Record"}
            </Button>
            <Button onClick={clearForm} variant="outline" className="sm:w-auto" disabled={loading}>
              Clear Form
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* CSV Import Card */}
      <Card>
        <CardHeader>
          <CardTitle>Import from CSV</CardTitle>
          <CardDescription>
            Upload a CSV file with emigrant data. The file should have columns: year, single, married, widower, separated, divorced, notReported
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="csv-file-input" className="text-sm font-medium">
                  Select CSV File
                </Label>
                <Input
                  id="csv-file-input"
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  disabled={csvImporting || loading}
                  className="mt-1"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:items-end">
                <Button
                  onClick={handleImportCSV}
                  disabled={!csvFile || csvImporting || loading}
                  className="sm:w-auto"
                >
                  {csvImporting ? "Importing..." : "Import CSV"}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDownloadSample}
                  disabled={csvImporting || loading}
                  className="sm:w-auto"
                >
                  Download Sample
                </Button>
              </div>
            </div>

            {/* Import Result Display */}
            {importResult && (
              <div className={`p-4 rounded-lg border ${
                importResult.success 
                  ? 'bg-green-50 border-green-200 text-green-800' 
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}>
                <div className="flex items-start gap-2">
                  <span className="text-lg">
                    {importResult.success ? '✅' : '❌'}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium">{importResult.message}</p>
                    {importResult.importedCount > 0 && (
                      <p className="text-sm mt-1">
                        Successfully imported {importResult.importedCount} records
                        {importResult.skippedCount > 0 && `, skipped ${importResult.skippedCount} rows`}
                      </p>
                    )}
                    {importResult.errors.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm font-medium">Errors:</p>
                        <ul className="text-xs mt-1 list-disc list-inside max-h-32 overflow-y-auto">
                          {importResult.errors.slice(0, 10).map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                          {importResult.errors.length > 10 && (
                            <li>... and {importResult.errors.length - 10} more errors</li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {csvFile && (
              <div className="text-sm text-muted-foreground">
                Selected file: <span className="font-medium">{csvFile.name}</span> 
                ({(csvFile.size / 1024).toFixed(1)} KB)
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Emigrant Records</CardTitle>
          <CardDescription>
            View and manage all emigrant data records
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Year</TableHead>
                <TableHead>Single</TableHead>
                <TableHead>Married</TableHead>
                <TableHead>Widower</TableHead>
                <TableHead>Separated</TableHead>
                <TableHead>Divorced</TableHead>
                <TableHead>Not Reported</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {emigrants.map(e => (
                <TableRow key={e.$id}>
                  <TableCell className="font-medium">{e.year}</TableCell>
                  <TableCell>{e.single}</TableCell>
                  <TableCell>{e.married}</TableCell>
                  <TableCell>{e.widower}</TableCell>
                  <TableCell>{e.separated}</TableCell>
                  <TableCell>{e.divorced}</TableCell>
                  <TableCell>{e.notReported}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleUpdate(e.$id)}
                        disabled={loading}
                        className="min-w-0"
                      >
                        Update
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => handleDelete(e.$id)}
                        disabled={loading}
                        className="min-w-0"
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      <StatsSummary 
        data={{
          totalEmigrants,
          totalByStatus,
          yearlyData: yearlyTotalsData.map(item => ({
            year: parseInt(item.year),
            total: item["Total Emigrants"]
          }))
        }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Emigrants by Year</CardTitle>
            <CardDescription>
              Total number of emigrants per year across all marital statuses
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[400px] w-full">
              <BarChart
                data={yearlyTotalsData}
                categories={["Total Emigrants"]}
                index="year"
                colors={["#3b82f6"]}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Emigrants by Marital Status</CardTitle>
            <CardDescription>
              Breakdown of emigrants by marital status across all recorded years
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[400px] w-full">
              <BarChart
                data={chartData}
                categories={["Single", "Married", "Widower", "Separated", "Divorced", "Not Reported"]}
                index="year"
                colors={["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#6b7280"]} 
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Marital Status Distribution</CardTitle>
            <CardDescription>
              Overall distribution of emigrants by marital status
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[400px] w-full flex items-center justify-center">
              {pieChartData.length > 0 ? (
                <CustomPieChart
                  data={pieChartData}
                  title=""
                  description=""
                  dataKey="count"
                  nameKey="category"
                  config={pieChartConfig}
                />
              ) : (
                <div className="text-center text-muted-foreground">
                  <p className="text-lg font-medium">No data available</p>
                  <p className="text-sm">Add some emigrant records to see the distribution</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartSelector
          data={chartData}
          categories={["Single", "Married", "Widower", "Separated", "Divorced", "Not Reported"]}
          index="year"
          colors={["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#6b7280"]}
          title="Interactive Emigration Analysis"
          description="Switch between different chart types to analyze emigrant trends"
        />

        <Card>
          <CardHeader>
            <CardTitle>Cumulative Emigration (Area Chart)</CardTitle>
            <CardDescription>
              Area visualization showing emigration patterns by marital status
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[400px] w-full">
              <AreaChart
                data={chartData}
                categories={["Single", "Married", "Widower", "Separated", "Divorced", "Not Reported"]}
                index="year"
                colors={["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#6b7280"]}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stacked Chart Section */}
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Stacked Emigration Analysis</CardTitle>
            <CardDescription>
              Comprehensive view showing the composition of emigrants by marital status over time
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[500px] w-full">
              <StackedAreaChart
                data={chartData}
                categories={["Single", "Married", "Widower", "Separated", "Divorced", "Not Reported"]}
                index="year"
                colors={["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#6b7280"]}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default App;