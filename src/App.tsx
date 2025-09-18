import { useEffect, useState } from "react";
import { addEmigrant, getEmigrants, updateEmigrant, deleteEmigrant, type Emigrant } from './services/emigrantServices';
import { testConnection } from './lib/appwrite';
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Card } from "./components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./components/ui/table";
import { BarChart } from "./components/bar-chart";

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
  const [connectionStatus, setConnectionStatus] = useState<string>("");

  // Test Appwrite connection on load
  useEffect(() => {
    testAppwriteConnection();
  }, []);

  const testAppwriteConnection = async () => {
    try {
      const result = await testConnection();
      setConnectionStatus(`Connection: ${result.status} - ${result.message}`);
      console.log('Appwrite connection test:', result);
    } catch (error) {
      setConnectionStatus('Connection: Error - Unable to connect');
      console.error('Connection test failed:', error);
    }
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

  // Prepare data for shadcn chart
  const chartData = emigrants.map(e => ({
    name: e.year.toString(),
    Single: e.single,
    Married: e.married,
    Widower: e.widower,
    Separated: e.separated,
    Divorced: e.divorced,
    "Not Reported": e.notReported,
  }));

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Filipino Emigrants Data</h1>
      <p className="text-sm text-gray-600 mb-8">{connectionStatus}</p>

      <Card className="p-6 mb-8">
        <div className="grid grid-cols-4 gap-4">
          {Object.keys(form).map(key => (
            <Input
              key={key}
              name={key}
              placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
              value={form[key as keyof FormData]}
              onChange={handleChange}
              type="number"
              disabled={loading}
            />
          ))}
          <div className="col-span-4 flex gap-2">
            <Button onClick={handleAdd} className="flex-1" disabled={loading}>
              {loading ? "Adding..." : "Add Record"}
            </Button>
            <Button onClick={clearForm} variant="outline" disabled={loading}>
              Clear
            </Button>
          </div>
        </div>
      </Card>

      <Card className="mb-8">
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
                <TableCell>{e.year}</TableCell>
                <TableCell>{e.single}</TableCell>
                <TableCell>{e.married}</TableCell>
                <TableCell>{e.widower}</TableCell>
                <TableCell>{e.separated}</TableCell>
                <TableCell>{e.divorced}</TableCell>
                <TableCell>{e.notReported}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleUpdate(e.$id)}
                      disabled={loading}
                    >
                      Update
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => handleDelete(e.$id)}
                      disabled={loading}
                    >
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Emigrants by Category</h2>
        <div className="h-[400px]">
          <BarChart
            data={chartData}
            categories={["Single", "Married", "Widower", "Separated", "Divorced", "Not Reported"]}
            index="name"
            colors={["blue", "green", "yellow", "purple", "pink", "gray"]}
          />
        </div>
      </Card>
    </div>
  );
}

export default App;