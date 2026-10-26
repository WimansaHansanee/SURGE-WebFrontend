import React, { useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartConfig = {
  s1: { label: "Sensor 1", color: "hsl(191, 89%, 49%)" },
  s2: { label: "Sensor 2", color: "hsl(212, 97%, 57%)" },
  s3: { label: "Sensor 3", color: "hsl(244, 80%, 65%)" },
  s4: { label: "Sensor 4", color: "hsl(261, 72%, 61%)" },
};



export default function SensorAreaChart({ data, sensorHeight = 200 }) {
  const [showWaterLevel, setShowWaterLevel] = useState(true);

  // Transform the data based on the selected view mode
  const processedData = data.map((point) => ({
    ...point,
    s1: showWaterLevel ? sensorHeight - point.s1 : point.s1,
    s2: showWaterLevel ? sensorHeight - point.s2 : point.s2,
    s3: showWaterLevel ? sensorHeight - point.s3 : point.s3,
    s4: showWaterLevel ? sensorHeight - point.s4 : point.s4,
  }));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <button
          onClick={() => setShowWaterLevel(!showWaterLevel)}
          className="text-xs font-medium px-3 py-1.5 rounded-md border border-[#274850] text-[#8fb4ba] hover:bg-[#08161a] transition-colors"
        >
          Viewing: {showWaterLevel ? "Actual Water Level" : "Clearance Distance"}
        </button>
      </div>
      
      <ChartContainer config={chartConfig} className="h-75 w-full">
        <AreaChart data={processedData} margin={{ left: 12, right: 12 }}>
          <defs>
            {Object.keys(chartConfig).map((key) => (
              <linearGradient key={key} id={`fill-${key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={`var(--color-${key})`} stopOpacity={0.3} />
                <stop offset="95%" stopColor={`var(--color-${key})`} stopOpacity={0.1} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid vertical={false} stroke="#1e3a40" />
          <XAxis
            dataKey="time"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            minTickGap={24}
            stroke="#6f939a"
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
    </div>
  );
}