import { BarChart as TremorBarChart } from "@tremor/react";

interface BarChartProps {
  data: any[];
  index: string;
  categories: string[];
  colors: string[];
}

export function BarChart({ data, index, categories, colors }: BarChartProps) {
  return (
    <TremorBarChart
      data={data}
      index={index}
      categories={categories}
      colors={colors}
      yAxisWidth={48}
      showAnimation={true}
    />
  );
}