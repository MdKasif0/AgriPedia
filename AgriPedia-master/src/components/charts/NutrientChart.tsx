
'use client';

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import type { ProduceInfo } from '@/lib/produceData';
import { cn } from "@/lib/utils";

interface NutrientChartProps {
  data: ProduceInfo['nutrition']['macronutrients'];
  className?: string;
}

const chartConfig = {
  value: {
    label: "Amount",
  },
} satisfies ChartConfig;

export default function NutrientChart({ data, className }: NutrientChartProps) {
  if (!data || data.length === 0) {
    return <p className="text-muted-foreground">No macronutrient data available to display chart.</p>;
  }
  
  const chartData = data.map(nutrient => ({
    name: nutrient.name,
    value: nutrient.value,
    unit: nutrient.unit,
  }));

  const colorPalette = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
  ];

  chartData.forEach((item, index) => {
    // @ts-ignore an fill is not in the type but it is used by recharts
    item.fill = colorPalette[index % colorPalette.length];
  });


  return (
    <div className={cn("p-2 sm:p-4 bg-card rounded-lg shadow overflow-hidden", className)}>
      <h4 className="text-md sm:text-lg font-semibold mb-2 sm:mb-4 text-primary text-center">Macronutrients per 100g</h4>
      <ChartContainer config={chartConfig} className="h-[250px] sm:h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 0, left: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="name" 
              tickLine={false} 
              axisLine={false} 
              stroke="hsl(var(--foreground))"
              fontSize={10}
            />
            <YAxis 
              stroke="hsl(var(--foreground))"
              fontSize={10}
              tickFormatter={(value) => `${value}g`} 
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent 
                labelFormatter={(label, payload) => {
                  if (payload && payload.length > 0 && payload[0].payload) {
                    return `${payload[0].payload.name}: ${payload[0].payload.value}${payload[0].payload.unit}`;
                  }
                  return label;
                }}
              />} 
            />
            <Bar dataKey="value" radius={4} maxBarSize={50} />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}
