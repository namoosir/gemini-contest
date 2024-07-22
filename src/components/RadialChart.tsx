import { useEffect, useState } from "react";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../components/ui/chart";
import { Label, PolarRadiusAxis, RadialBar, RadialBarChart } from "recharts";

export const RadialChart = () => {
  const [avgScore, setAvgScore] = useState<number>(0);
  const INNER_RADIUS = 90;
  const OUTER_RADIUS = INNER_RADIUS * 1.625; //Properly Calculated
  const RADIAL_GRAPH_WIDTH = OUTER_RADIUS + 100;
  const START_LINE = (OUTER_RADIUS - INNER_RADIUS) / 1.35;

  useEffect(() => {
    setAvgScore(50); //Need to pull score from database over the week to calculate average score
  }, []);

  const chartData = [
    { month: "january", averageScore: avgScore, improvability: 100 - avgScore },
  ]; //REMOVE: SHADCN CODE

  const chartConfig = {
    averageScore: {
      label: "Average Score",
      color: "hsl(var(--primary))",
    },
    improvability: {
      label: "Improvability",
      color: "hsl(var(--primary-foregrund))",
    },
  } satisfies ChartConfig; //REMOVE: SHADCN CODE

  const totalScore = chartData[0].averageScore; //REMOVE: SHADCN CODE

  return (
    <div
      id="Circle Graph"
      className="flex rounded-full border-solid border-2 overflow-hidden relative items-center"
      style={{ width: RADIAL_GRAPH_WIDTH }}
    >
      <div
        className="bg-primary z-50 h-[5px] absolute"
        style={{ width: START_LINE }}
      ></div>
      <ChartContainer
        config={chartConfig}
        className="mx-auto aspect-square w-full bg-card"
      >
        <RadialBarChart
          data={chartData}
          endAngle={360}
          innerRadius={INNER_RADIUS}
          outerRadius={OUTER_RADIUS}
        >
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />
          <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
            <Label
              content={({ viewBox }) => {
                if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                  return (
                    <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                      <tspan
                        x={viewBox.cx}
                        y={(viewBox.cy || 0) - 16}
                        className="fill-foreground text-2xl font-bold"
                      >
                        {totalScore.toLocaleString() + "%"}
                      </tspan>
                      <tspan
                        x={viewBox.cx}
                        y={(viewBox.cy || 0) + 4}
                        className="fill-muted-foreground"
                      >
                        Average Weekly Score
                      </tspan>
                    </text>
                  );
                }
              }}
            />
          </PolarRadiusAxis>
          <RadialBar
            dataKey="improvability"
            fill="hsl(var(--primary-foreground))"
            stackId="a"
            cornerRadius={5}
            className="stroke-transparent stroke-2 origin-center rotate-180"
          />
          <RadialBar
            dataKey="averageScore"
            stackId="a"
            cornerRadius={5}
            fill="hsl(var(--primary))"
            className="stroke-transparent stroke-2 origin-center rotate-180"
          />
        </RadialBarChart>
      </ChartContainer>
    </div>
  );
};
