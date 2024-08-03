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
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "./ui/chart";
import { useEffect, useState } from "react";
import useFirebaseContext from "@/hooks/useFirebaseContext";
import useAuthContext from "@/hooks/useAuthContext";
import {
  getUserInterviewHistory,
  Interview,
} from "@/services/firebase/interviewService";

export const DashboardBarChart = () => {
  const [barChartData, setBarChartData] = useState<Interview[]>([]);
  const [avgPerformance, setAvgPerformance] = useState<number>();
  const [overallMonthScore, setOverallMonthScore] = useState<number>();
  const [percentageMonthIncrease, setPercentageMonthIncrease] =
    useState<number>();
  const { user } = useAuthContext();
  const { db } = useFirebaseContext();

  useEffect(() => {
    const init = async () => {
      const currDate = new Date();
      const currMonth = new Date(
        currDate.getFullYear(),
        currDate.getMonth(),
        1
      ).toLocaleDateString();

      const nextMonth = new Date(
        currDate.getFullYear(),
        currDate.getMonth() + 1,
        1
      ).toLocaleDateString();

      const prevMonth = new Date(
        currDate.getFullYear(),
        currDate.getMonth() - 1,
        1
      ).toLocaleDateString();

      const currMonthData = await getUserInterviewHistory(
        db,
        user!,
        currMonth,
        nextMonth
      );

      const prevMonthData = await getUserInterviewHistory(
        db,
        user!,
        prevMonth,
        currMonth
      );

      const currMonthSum = getPerformanceSum(currMonthData);
      const prevMonthSum = getPerformanceSum(prevMonthData);
      getAvgPerformance(currMonthSum);
      getOverallMonthScore(currMonthSum);
      getPercentageMonthIncrease(currMonthSum, prevMonthSum);
      setBarChartData(currMonthData!);
    };

    init();
  }, []);

  const getPerformanceSum = (data: Interview[] | null) => {
    let sum = 0;
    let length = 0;
    if (data) {
      for (let i = 0; i < data.length; i++) {
        sum += data[i].score;
      }

      length = data.length;
    }

    return { sum, length };
  };

  const getAvgPerformance = (currMonth: { sum: number; length: number }) => {
    setAvgPerformance(Math.floor(currMonth.sum / currMonth.length));
  };

  const getOverallMonthScore = (currMonth: { sum: number; length: number }) => {
    setOverallMonthScore(currMonth.sum);
  };

  const getPercentageMonthIncrease = (
    currMonth: { sum: number; length: number },
    prevMonth: { sum: number; length: number }
  ) => {
    const currSum = currMonth.sum;
    const prevSum = prevMonth.sum;

    setPercentageMonthIncrease(
      ((currSum - prevSum) / ((currSum + prevSum) / 2)) * 100
    );
  };

  return (
    <Card className="mt-20">
      <CardHeader>
        <CardTitle className="mb-5">Performance Over Time</CardTitle>
        <CardDescription className="text-3xl text-white font-semibold">
          +{overallMonthScore}
        </CardDescription>
        <CardDescription>
          {percentageMonthIncrease !== undefined && percentageMonthIncrease > 0
            ? "+"
            : ""}
          {percentageMonthIncrease?.toFixed(2)}% from last month
        </CardDescription>
      </CardHeader>
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
              dataKey="dateCreated"
              tickLine={false}
              axisLine={false}
              tickMargin={4}
              tickFormatter={(value) => {
                return new Date(value).toLocaleDateString("en-US");
              }}
            />
            (
            <ChartTooltip
              content={
                <ChartTooltipContent
                  hideIndicator
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    });
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
      <CardFooter></CardFooter>
    </Card>
  );
};
