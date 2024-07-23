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

export const DashboardBarChart = () => {
  const [barChartData, setBarChartData] = useState<
    Array<{ date: string; performance: number }>
  >([]);
  const [avgPerformance, setAvgPerformance] = useState<number>();
  const [overallMonthScore, setOverallMonthScore] = useState<number>();
  const [percentageMonthIncrease, setPercentageMonthIncrease] =
    useState<number>();

  const examplePrevMonthData = [
    {
      date: "2024-01-01",
      performance: 2000,
    },
    {
      date: "2024-01-02",
      performance: 2100,
    },
    {
      date: "2024-01-03",
      performance: 2200,
    },
    {
      date: "2024-01-04",
      performance: 1300,
    },
    {
      date: "2024-01-05",
      performance: 1400,
    },
    {
      date: "2024-01-06",
      performance: 2500,
    },
    {
      date: "2024-01-07",
      performance: 1600,
    },
    {
      date: "2024-01-08",
      performance: 200,
    },
    {
      date: "2024-01-09",
      performance: 400,
    },
    {
      date: "2024-01-10",
      performance: 600,
    },
    {
      date: "2024-01-10",
      performance: 800,
    },
  ];

  const exampleData = [
    {
      date: "2024-02-01",
      performance: 3000,
    },
    {
      date: "2024-02-02",
      performance: 3100,
    },
    {
      date: "2024-02-03",
      performance: 3200,
    },
    {
      date: "2024-02-04",
      performance: 2300,
    },
    {
      date: "2024-02-05",
      performance: 2400,
    },
    {
      date: "2024-02-06",
      performance: 3500,
    },
    {
      date: "2024-02-07",
      performance: 2600,
    },
    {
      date: "2024-02-08",
      performance: 300,
    },
    {
      date: "2024-02-09",
      performance: 500,
    },
    {
      date: "2024-02-10",
      performance: 700,
    },
    {
      date: "2024-02-10",
      performance: 900,
    },
  ];

  useEffect(() => {
    setBarChartData(() => {
      const currMonth  = getPerformanceSum(exampleData);
      const prevMonth = getPerformanceSum(examplePrevMonthData);
      getAvgPerformance(currMonth); //Need to pull data from database, use query to gett current month and previous month
      getOverallMonthScore(currMonth);
      getPercentageMonthIncrease(currMonth, prevMonth);

      return exampleData;
    });
  }, []);

  const getPerformanceSum = (data: { date: string; performance: number }[]) => {
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      sum += data[i].performance;
    }
    let length = data.length

    return {sum, length};
  }
 
 
  const getAvgPerformance = (currMonth: {sum: number, length: number}) => {
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
            performance: {
              label: "Performance: ",
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
              dataKey="performance"
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
                return new Date(value).toLocaleDateString("en-US");
              }}
            />
            <ChartTooltip
              defaultIndex={2}
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
