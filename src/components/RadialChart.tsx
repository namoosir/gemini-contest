import { useEffect, useState } from "react";
import {
  ChartConfig,
  ChartContainer,
} from "../components/ui/chart";
import { Label, PolarRadiusAxis, RadialBar, RadialBarChart } from "recharts";
import { getUserInterviewHistoryWithinWeek } from "@/services/firebase/interviewService";
import { db } from "@/FirebaseConfig";
import useAuthContext from "@/hooks/useAuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
interface Props {
  className?: string
  size: number,
}

export const RadialChart = (props: Props) => {
  const {
    className,
    size,
  } = props

  const [avgScore, setAvgScore] = useState<number>(0);

  const RADIAL_GRAPH_WIDTH = size
  const OUTER_RADIUS = RADIAL_GRAPH_WIDTH - 120
  const INNER_RADIUS = OUTER_RADIUS / 1.625;

  const { user } = useAuthContext();

  useEffect(() => {
    const init = async () => {
      const data = await getUserInterviewHistoryWithinWeek(db, user!);
      
      setAvgScore(() => {
        let avg = 0;
        let sum = 0;
        if (data) {
          sum = 0;

          data.forEach((s) => sum += s.overallScore.overallScore)

          const denom = data.length === 0 ? 1 : data.length;
          avg = Math.floor(sum / denom);
        }
        return avg;
      });
    };

    void init();
  }, []);

  const chartData = [{ averageScore: avgScore, improvability: 100 - avgScore }];

  const chartConfig = {
    averageScore: {
      label: "Average Score",
      color: "hsl(var(--primary))",
    },
    improvability: {
      label: "Improvability",
      color: "hsl(var(--primary-foreground))",
    },
  } satisfies ChartConfig;

  const totalScore = chartData[0].averageScore;

  const currDate = new Date()
  const weekStart = new Date(
    currDate.getFullYear(),
    currDate.getMonth() + 1,
    currDate.getDay() - 7
  ).toLocaleDateString();
  const weekEnd = currDate.toLocaleDateString();

  return (
    <Card className={`${className} flex flex-col col-span-4`}>
      <CardHeader className="items-center pb-0">
        <CardTitle>Weekly Average</CardTitle>
        <CardDescription>{weekStart} - {weekEnd}</CardDescription>
      </CardHeader>
      <CardContent
        id="Circle Graph"
        className="flex-1 pb-0 flex justify-center items-center"
      >
        <div style={{ width: RADIAL_GRAPH_WIDTH }}>
          <ChartContainer
            config={chartConfig}
            className="aspect-square"
          >
            <RadialBarChart
              data={chartData}
              endAngle={360}
              innerRadius={INNER_RADIUS}
              outerRadius={OUTER_RADIUS}
            >
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
              <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy ?? 0)}
                            className="fill-foreground text-4xl font-bold"
                          >
                            {totalScore.toLocaleString() + "%"}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy ?? 0) + 24}
                            className="fill-muted-foreground"
                          >
                            Overall Score
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

      </CardContent>
    </Card >
  );
};
