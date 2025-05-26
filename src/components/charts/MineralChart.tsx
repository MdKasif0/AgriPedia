'use client';

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import type { ProduceInfo } from '@/lib/produceData';
import { cn } from "@/lib/utils";

interface MineralChartProps {
  data: ProduceInfo['nutrition']['minerals'];
  className?: string;
}

const chartConfig = {
  value: {
    label: "Amount",
    // color: "hsl(var(--primary))", // Color will be set per bar
  },
} satisfies ChartConfig;

export default function MineralChart({ data, className }: MineralChartProps) {
  if (!data || data.length === 0) {
    return <p className="text-center text-muted-foreground py-4">No mineral data available to display chart.</p>;
  }
  
  const chartData = data.map(mineral => ({
    name: mineral.name,
    value: mineral.value,
    unit: mineral.unit,
    rdi: mineral.rdi,
    // fill: "hsl(var(--primary))", // Default fill color will be overridden
  }));

  const colorPalette = [
    "hsl(var(--chart-5))", // Start from different end of palette for variety
    "hsl(var(--chart-4))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-1))",
  ];

  chartData.forEach((item, index) => {
    // @ts-ignore an fill is not in the type but it is used by recharts
    item.fill = colorPalette[index % colorPalette.length];
  });

  return (
    <div className={cn("p-4 bg-card rounded-lg shadow overflow-hidden", className)}>
      <h4 className="text-lg font-semibold mb-4 text-primary text-center">Minerals per 100g</h4>
      <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="name" 
              tickLine={false} 
              axisLine={false} 
              stroke="hsl(var(--foreground))"
              fontSize={12}
              interval={0}
            />
            <YAxis 
              stroke="hsl(var(--foreground))"
              fontSize={12}
              tickFormatter={(value) => String(value)} // Display raw value, unit in tooltip
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent 
                labelFormatter={(label, payload) => {
                  if (payload && payload.length > 0 && payload[0].payload) {
                    const item = payload[0].payload;
                    let rdiText = item.rdi ? ` (${item.rdi} RDI)` : '';
                    return `${item.name}: ${item.value}${item.unit}${rdiText}`;
                  }
                  return label;
                }}
              />} 
            />
            <Bar dataKey="value" radius={4} />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}
