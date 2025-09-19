import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

interface BarChartProps {
  data: Record<string, string | number>[];
  index: string;
  categories: string[];
  colors: string[];
}

export function BarChart({ data, index, categories, colors }: BarChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%" minHeight={300}>
      <RechartsBarChart
        data={data}
        margin={{
          top: 20,
          right: 30,
          left: 40,
          bottom: 20,
        }}
      >
        <CartesianGrid 
          strokeDasharray="3 3" 
          stroke="hsl(var(--muted-foreground))" 
          opacity={0.3}
        />
        <XAxis 
          dataKey={index} 
          tick={{ 
            fontSize: 12, 
            fill: 'hsl(var(--muted-foreground))' 
          }}
          axisLine={{ stroke: 'hsl(var(--border))' }}
          tickLine={{ stroke: 'hsl(var(--border))' }}
        />
        <YAxis 
          tick={{ 
            fontSize: 12, 
            fill: 'hsl(var(--muted-foreground))' 
          }}
          axisLine={{ stroke: 'hsl(var(--border))' }}
          tickLine={{ stroke: 'hsl(var(--border))' }}
          tickFormatter={(value) => value.toLocaleString()}
        />
        <Tooltip 
          contentStyle={{
            backgroundColor: 'hsl(var(--background))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
            fontSize: '13px',
            boxShadow: '0 4px 12px hsl(var(--muted-foreground) / 0.15)'
          }}
          formatter={(value: number, name: string) => [
            value.toLocaleString(),
            name
          ]}
          labelFormatter={(label) => `Year: ${label}`}
        />
        <Legend 
          wrapperStyle={{ 
            fontSize: '12px',
            paddingTop: '20px'
          }}
        />
        {categories.map((category, idx) => (
          <Bar
            key={category}
            dataKey={category}
            fill={colors[idx % colors.length]}
            radius={[2, 2, 0, 0]}
          />
        ))}
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}