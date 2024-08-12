import {
  Bar,
  BarChart,
  Label,
  Rectangle,
  ReferenceLine,
  XAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "./ui/chart";
import { useEffect, useState } from "react";
import { Interview } from "@/services/firebase/interviewService";

interface Props {
  currMonthData: Interview[];
  prevMonthData: Interview[];
  className?: string;
}

export const DashboardBarChart = (props: Props) => {
  const { className, currMonthData, prevMonthData } = props;

  const [barChartData, setBarChartData] = useState<
    { score: number; date: string }[]
  >([]);
  const [avgPerformance, setAvgPerformance] = useState<number>();
  const [overallMonthScore, setOverallMonthScore] = useState<number>();
  const [percentageMonthIncrease, setPercentageMonthIncrease] =
    useState<number>(0);

  const getAvgPerformance = (currMonth: { sum: number; length: number }) => {
    setAvgPerformance(
      Math.floor(
        currMonth.sum / (currMonth.length === 0 ? 1 : currMonth.length)
      )
    );
  };

  const getOverallMonthScore = (currMonth: { sum: number; length: number }) => {
    setOverallMonthScore(currMonth.sum);
  };

  useEffect(() => {
    const init = () => {
      const currMonthSum = getPerformanceSum(currMonthData);
      const prevMonthSum = getPerformanceSum(prevMonthData);
      getAvgPerformance(currMonthSum);
      getOverallMonthScore(currMonthSum);
      getPercentageMonthIncrease(currMonthSum, prevMonthSum);
      setBarChartData(
        currMonthData.map((d) => {
          return {
            score: d.overallScore.overallScore ?? 0,
            date: new Date(d.dateCreated!).toString(),
          };
        })
      );
    };

    void init();
  }, [currMonthData, prevMonthData]);

  const getPerformanceSum = (data: Interview[] | null) => {
    let sum = 0;
    let length = 0;
    if (data) {
      data.forEach((d) => (sum += d.overallScore.overallScore ?? 0));

      length = data.length;
    }

    return { sum, length };
  };

  const getPercentageMonthIncrease = (
    currMonth: { sum: number; length: number },
    prevMonth: { sum: number; length: number }
  ) => {
    const currSum = currMonth.sum;
    const prevSum = prevMonth.sum;

    setPercentageMonthIncrease(
      (currSum - prevSum) / ((currSum + prevSum) / 2) === 0
        ? 0
        : ((currSum - prevSum) / ((currSum + prevSum) / 2)) * 100
    );
  };

  return (
    <Card className={`${className}`}>
      <CardHeader>
        <CardTitle className="mb-4">Performance Over Time</CardTitle>
        <CardDescription className="flex flex-col">
          <span className="text-3xl text-white font-semibold">
            +{overallMonthScore}
          </span>

          <span className="text-primary">
            {percentageMonthIncrease !== undefined &&
            percentageMonthIncrease > 0
              ? "+"
              : ""}
            {isNaN(percentageMonthIncrease)
              ? 0
              : percentageMonthIncrease?.toFixed(2)}
            % from last month
          </span>
        </CardDescription>
      </CardHeader>
      git add .{" "}
      {currMonthData.length !== 0 ? (
        <CardContent>
          <ChartContainer
            config={{
              score: {
                label: "Score: ",
                color: "hsl(var(--primary-foreground))",
              },
            }}
          >
            <BarChart
              accessibilityLayer
              margin={{
                left: -4,
                right: -4,
              }}
              data={barChartData}
            >
              <Bar
                dataKey="score"
                fill="hsl(var(--primary))"
                radius={5}
                fillOpacity={0.6}
                activeBar={<Rectangle fillOpacity={0.8} />}
              />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={4}
                tickFormatter={(value) => {
                  return new Date(value as string).toLocaleDateString("en-US");
                }}
              />
              (
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    hideIndicator
                    labelFormatter={(value) => {
                      return new Date(value as string).toLocaleDateString(
                        "en-US",
                        {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        }
                      );
                    }}
                  />
                }
                cursor={false}
              />
              )
              <ReferenceLine
                y={avgPerformance}
                stroke="hsl(var(--muted-foreground))"
                strokeDasharray="3 3"
                strokeWidth={1}
              >
                <Label
                  position="insideBottomLeft"
                  value="Average Performance"
                  offset={10}
                  fill="hsl(var(--foreground))"
                />
                <Label
                  position="insideTopLeft"
                  value={avgPerformance}
                  className="text-lg"
                  fill="hsl(var(--foreground))"
                  offset={10}
                  startOffset={100}
                />
              </ReferenceLine>
            </BarChart>
          </ChartContainer>
        </CardContent>
      ) : (
        <div className="h-[410px] flex flex-col justify-center items-center text-muted-foreground">
          No Data Available
        </div>
      )}
    </Card>
  );
};
