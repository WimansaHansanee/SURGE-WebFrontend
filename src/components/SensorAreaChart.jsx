import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

// Maps each data key to a display label and color. shadcn's ChartContainer
// turns these into CSS variables (--color-s1, --color-s2, ...) that the
// gradient <stop> and <Area stroke> below reference.
const chartConfig = {
  s1: { label: "Sensor 1", color: "hsl(191, 89%, 49%)" }, // Cyan
  s2: { label: "Sensor 2", color: "hsl(212, 97%, 57%)" }, // Sky Blue
  s3: { label: "Sensor 3", color: "hsl(244, 80%, 65%)" }, // Royal Blue
  s4: { label: "Sensor 4", color: "hsl(261, 72%, 61%)" }, // Indigo / Periwinkle
};

// data: array of { time, s1, s2, s3, s4 } — same shape your /api/history
// endpoint already returns.
export default function SensorAreaChart({ data }) {
  return (
    <ChartContainer config={chartConfig} className="h-[300px] w-full">
      <AreaChart data={data} margin={{ left: 12, right: 12 }}>
        <defs>
          {Object.keys(chartConfig).map((key) => (
            <linearGradient key={key} id={`fill-${key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={`var(--color-${key})`} stopOpacity={0.3} />
              <stop offset="95%" stopColor={`var(--color-${key})`} stopOpacity={0.1} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="time"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={24}
        />
        <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
        {Object.keys(chartConfig).map((key) => (
          <Area
            key={key}
            dataKey={key}
            type="natural"
            fill={`url(#fill-${key})`}
            stroke={`var(--color-${key})`}
            strokeWidth={2}
            isAnimationActive={false}
          />
        ))}
      </AreaChart>
    </ChartContainer>
  );
}
