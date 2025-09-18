import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { TrendingUp, TrendingDown, Users, Calendar } from "lucide-react";

interface StatsData {
  totalEmigrants: number;
  totalByStatus: {
    single: number;
    married: number;
    widower: number;
    separated: number;
    divorced: number;
    notReported: number;
  };
  yearlyData: Array<{
    year: number;
    total: number;
  }>;
}

interface StatsSummaryProps {
  data: StatsData;
}

export function StatsSummary({ data }: StatsSummaryProps) {
  const { totalEmigrants, totalByStatus, yearlyData } = data;
  
  // Calculate growth rate
  const currentYear = yearlyData[yearlyData.length - 1];
  const previousYear = yearlyData[yearlyData.length - 2];
  const growthRate = previousYear ? 
    ((currentYear.total - previousYear.total) / previousYear.total) * 100 : 0;
  
  // Find most common marital status
  const statusEntries = Object.entries(totalByStatus);
  const mostCommon = statusEntries.reduce((max, current) => 
    current[1] > max[1] ? current : max
  );
  
  // Calculate average emigrants per year
  const avgPerYear = yearlyData.length > 0 ? 
    Math.round(totalEmigrants / yearlyData.length) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="p-4">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Emigrants</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="p-0">
          <div className="text-2xl font-bold">{totalEmigrants.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            Across {yearlyData.length} years
          </p>
        </CardContent>
      </Card>

      <Card className="p-4">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
          <CardTitle className="text-sm font-medium text-muted-foreground">Growth Rate</CardTitle>
          {growthRate >= 0 ? (
            <TrendingUp className="h-4 w-4 text-green-600" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-600" />
          )}
        </CardHeader>
        <CardContent className="p-0">
          <div className={`text-2xl font-bold ${
            growthRate >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {growthRate >= 0 ? '+' : ''}{growthRate.toFixed(1)}%
          </div>
          <p className="text-xs text-muted-foreground">
            Year-over-year change
          </p>
        </CardContent>
      </Card>

      <Card className="p-4">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
          <CardTitle className="text-sm font-medium text-muted-foreground">Most Common Status</CardTitle>
          <Badge variant="secondary" className="text-xs">
            {((mostCommon[1] / totalEmigrants) * 100).toFixed(1)}%
          </Badge>
        </CardHeader>
        <CardContent className="p-0">
          <div className="text-xl font-bold capitalize">
            {mostCommon[0] === 'notReported' ? 'Not Reported' : mostCommon[0]}
          </div>
          <p className="text-xs text-muted-foreground">
            {mostCommon[1].toLocaleString()} emigrants
          </p>
        </CardContent>
      </Card>

      <Card className="p-4">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
          <CardTitle className="text-sm font-medium text-muted-foreground">Average Per Year</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="p-0">
          <div className="text-2xl font-bold">{avgPerYear.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            Emigrants annually
          </p>
        </CardContent>
      </Card>
    </div>
  );
}