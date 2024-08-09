import { useEffect, useState } from "react";
import { ChartConfig, ChartContainer } from "./ui/chart";
import { Label, PolarRadiusAxis, RadialBar, RadialBarChart } from "recharts";

interface Props {
  data: number;
}

export const PreviousResultsRadialChart: React.FC<Props> = ({ data }: Props) => {
  const [avgScore, setAvgScore] = useState<number>(0);
  const INNER_RADIUS = 17;
  const OUTER_RADIUS = INNER_RADIUS * 1.625;
  const RADIAL_GRAPH_WIDTH = OUTER_RADIUS + 20;

  useEffect(() => {
    setAvgScore(data);
  }, []);

  const chartData = [{ averageScore: avgScore, improvability: 100 - avgScore }];

  const chartConfig = {
    averageScore: {
      label: "Average Score",
      color: "hsl(var(--primary))",
    },
    improvability: {
      label: "Improvability",
      color: "hsl(var(--primary-foregrund))",
    },
  } satisfies ChartConfig;

  const totalScore = chartData[0].averageScore;

  return (
    <div
      id="Circle Graph"
      className="flex rounded-full border-solid border-2 overflow-hidden relative items-center"
      style={{ width: RADIAL_GRAPH_WIDTH }}
    >
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
          <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
            <Label
              content={({ viewBox }) => {
                if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                  return (
                    <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                      <tspan
                        x={viewBox.cx}
                        y={(viewBox.cy || 0) + 4}
                        className="fill-foreground text-xs"
                      >
                        {totalScore.toLocaleString()}
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
