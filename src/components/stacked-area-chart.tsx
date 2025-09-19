import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

interface StackedAreaChartProps {
  data: Record<string, string | number>[];
  index: string;
  categories: string[];
  colors: string[];
}

export function StackedAreaChart({ data, index, categories, colors }: StackedAreaChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%" minHeight={400}>
      <RechartsAreaChart
        data={data}
        margin={{
          top: 20,
          right: 30,
          left: 50,
          bottom: 30,
        }}
      >
        <defs>
          {categories.map((category, idx) => (
            <linearGradient 
              key={`stack-gradient-${category}`} 
              id={`stack-gradient-${category}`} 
              x1="0" 
              y1="0" 
              x2="0" 
              y2="1"
            >
              <stop 
                offset="5%" 
                stopColor={colors[idx % colors.length]} 
                stopOpacity={0.9}
              />
              <stop 
                offset="95%" 
                stopColor={colors[idx % colors.length]} 
                stopOpacity={0.7}
              />
            </linearGradient>
          ))}
        </defs>
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
          <Area
            key={category}
            type="monotone"
            dataKey={category}
            stackId="1"
            stroke={colors[idx % colors.length]}
            fill={`url(#stack-gradient-${category})`}
            strokeWidth={1}
          />
        ))}
      </RechartsAreaChart>
    </ResponsiveContainer>
  );
}