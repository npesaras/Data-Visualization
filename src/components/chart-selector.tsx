import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { BarChart } from "./bar-chart";
import { LineChart } from "./line-chart";
import { AreaChart } from "./area-chart";

interface ChartSelectorProps {
  data: Record<string, string | number>[];
  categories: string[];
  index: string;
  colors: string[];
  title: string;
  description: string;
}

type ChartType = 'bar' | 'line' | 'area';

export function ChartSelector({ data, categories, index, colors, title, description }: ChartSelectorProps) {
  const [chartType, setChartType] = useState<ChartType>('bar');

  const renderChart = () => {
    // Handle empty data case
    if (!data || data.length === 0) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-muted-foreground">
            <p className="text-lg font-medium">No data available</p>
            <p className="text-sm">Add some records to see the chart</p>
          </div>
        </div>
      );
    }

    switch (chartType) {
      case 'bar':
        return <BarChart data={data} categories={categories} index={index} colors={colors} />;
      case 'line':
        return <LineChart data={data} categories={categories} index={index} colors={colors} />;
      case 'area':
        return <AreaChart data={data} categories={categories} index={index} colors={colors} />;
      default:
        return <BarChart data={data} categories={categories} index={index} colors={colors} />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant={chartType === 'bar' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setChartType('bar')}
            >
              Bar
            </Button>
            <Button
              variant={chartType === 'line' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setChartType('line')}
            >
              Line
            </Button>
            <Button
              variant={chartType === 'area' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setChartType('area')}
            >
              Area
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          {renderChart()}
        </div>
      </CardContent>
    </Card>
  );
}