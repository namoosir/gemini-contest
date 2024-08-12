import { formatTime } from "@/utils";
import {
  ChartConfig,
  ChartContainer,
} from "../components/ui/chart";
import { Label, PolarGrid, PolarRadiusAxis, RadialBar, RadialBarChart } from "recharts";

interface Props {
  seconds: number,
  total: number,
}

export const TimerChart = (props: Props) => {
  const {
    seconds,
    total,
  } = props

  const chartData = [{ seconds: seconds }];

  const chartConfig: ChartConfig = {
    seconds: {
      label: "Time",
      color: "hsl(var(--primary))",
    },
  } satisfies ChartConfig;

  return (
    <div className={'w-16 h-16'}>
      <ChartContainer
        config={chartConfig}
        className="mx-auto aspect-square"
      >
        <RadialBarChart
          data={chartData}
          startAngle={90}
          endAngle={90 - (chartData[0].seconds / total) * 360}
          innerRadius={30}
          outerRadius={40}
        >
          <PolarGrid
            gridType="circle"
            radialLines={false}
            stroke="none"
            className="first:fill-muted last:fill-background"
            polarRadius={[86, 74]}
          />
          <RadialBar
            dataKey="seconds"
            background
            cornerRadius={10}
            fill="hsl(var(--primary))"
          />
          <PolarRadiusAxis
            tick={false}
            tickLine={false}
            axisLine={false}
          >
            <Label
              content={({ viewBox }) => {
                if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                  return (
                    <text
                      x={viewBox.cx}
                      y={viewBox.cy}
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      <tspan
                        x={viewBox.cx}
                        y={viewBox.cy}
                        className="fill-foreground text-md font-bold"
                      >
                        {formatTime(seconds)}
                      </tspan>
                    </text>
                  );
                }
              }}
            />
          </PolarRadiusAxis>
        </RadialBarChart>
      </ChartContainer>
    </div>
  );
};

export default TimerChart