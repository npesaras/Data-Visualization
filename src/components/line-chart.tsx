import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

interface LineChartProps {
  data: Record<string, string | number>[];
  index: string;
  categories: string[];
  colors: string[];
}

export function LineChart({ data, index, categories, colors }: LineChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%" minHeight={300}>
      <RechartsLineChart
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
          <Line
            key={category}
            type="monotone"
            dataKey={category}
            stroke={colors[idx % colors.length]}
            strokeWidth={2.5}
            dot={{ 
              r: 3, 
              fill: colors[idx % colors.length],
              strokeWidth: 0
            }}
            activeDot={{ 
              r: 5, 
              fill: colors[idx % colors.length],
              stroke: '#fff',
              strokeWidth: 2
            }}
            connectNulls={false}
          />
        ))}
      </RechartsLineChart>
    </ResponsiveContainer>
  );
}