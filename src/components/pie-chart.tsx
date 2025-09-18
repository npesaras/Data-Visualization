
import * as React from "react"
import { TrendingUp } from "lucide-react"
import { Pie, PieChart as RechartsChart, Cell, Legend } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
} from "@/components/ui/chart"

interface PieChartData {
  category: string
  count: number
  fill: string
}

interface PieChartProps {
  data: PieChartData[]
  title: string
  description: string
  dataKey: string
  nameKey: string
  config: ChartConfig
}

interface LabelProps {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  percent: number;
  category: string;
}

const COLORS = [
  '#3b82f6', // Blue
  '#10b981', // Green  
  '#f59e0b', // Yellow/Orange
  '#8b5cf6', // Purple
  '#ef4444', // Red
  '#6b7280', // Gray
  '#ec4899', // Pink
];

export function CustomPieChart({ data, title, description, dataKey, nameKey, config }: PieChartProps) {
  const totalCount = React.useMemo(() => {
    return data.reduce((acc, curr) => acc + curr.count, 0)
  }, [data])

  // Add colors to data if not present
  const coloredData = React.useMemo(() => {
    return data.map((item, index) => ({
      ...item,
      fill: item.fill || COLORS[index % COLORS.length]
    }))
  }, [data])

  // Custom label function to show percentage and name
  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: LabelProps) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize="12"
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={config}
          className="mx-auto aspect-square max-h-[350px]"
        >
          <RechartsChart>
            <ChartTooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  const percentage = ((data.count / totalCount) * 100).toFixed(1);
                  return (
                    <div className="bg-background border border-border rounded-lg shadow-lg p-3">
                      <div className="font-medium">{data.category}</div>
                      <div className="text-sm text-muted-foreground">
                        Count: <span className="font-medium text-foreground">{data.count.toLocaleString()}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Percentage: <span className="font-medium text-foreground">{percentage}%</span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Pie
              data={coloredData}
              dataKey={dataKey}
              nameKey={nameKey}
              cx="50%"
              cy="45%"
              labelLine={false}
              label={renderCustomLabel}
              outerRadius={80}
              innerRadius={40}
              paddingAngle={2}
            >
              {coloredData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Legend 
              wrapperStyle={{
                paddingTop: '20px',
                fontSize: '12px'
              }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(value: string, entry: any) => (
                <span style={{ color: entry.color || '#000' }}>
                  {value} ({((entry.payload?.count || 0)).toLocaleString()})
                </span>
              )}
            />
          </RechartsChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 leading-none font-medium">
          <TrendingUp className="h-4 w-4" />
          Data breakdown by category
        </div>
        <div className="text-muted-foreground leading-none">
          Showing distribution of {totalCount} total records
        </div>
      </CardFooter>
    </Card>
  )
}