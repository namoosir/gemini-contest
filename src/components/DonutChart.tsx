import { Pie, PieChart } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "./ui/chart";
import { TrendingUp } from "lucide-react";
import { Interview, Score } from "@/services/firebase/interviewService";
import { useEffect, useState } from "react";

interface DonutChartProps {
  className: string;
  currMonthData: Interview[];
}

export const DonutChart = ({
  className,
  currMonthData,
}: DonutChartProps): JSX.Element => {
  const [scores, setScores] = useState<Score>();

  useEffect(() => {
    console.log(currMonthData);
    let behaviourSum = 0;
    let jobFitSum = 0;
    let overallSum = 0;
    let technicalSum = 0;

    for (let i = 0; i < currMonthData.length; i++) {
      behaviourSum += currMonthData[i].overallScore.behavioralScore;
      jobFitSum += currMonthData[i].overallScore.jobFitScore;
      overallSum += currMonthData[i].overallScore.overallScore;
      technicalSum += currMonthData[i].overallScore.technicalScore;
    }

    setScores({
      behavioralScore: behaviourSum,
      jobFitScore: jobFitSum,
      overallScore: overallSum,
      technicalScore: technicalSum,
    });
  }, [currMonthData]);

  const chartData = [
    {
      category: "Behavioural",
      score: scores?.behavioralScore,
      fill: "var(--color-behavioural)",
    },
    {
      category: "Job Fit",
      score: scores?.jobFitScore,
      fill: "var(--color-jobFit)",
    },
    {
      category: "Overall",
      score: scores?.overallScore,
      fill: "var(--color-overall)",
    },
    {
      category: "Technical",
      score: scores?.technicalScore,
      fill: "var(--color-technical)",
    },
  ];
  const chartConfig = {
    score: {
      label: "Scores",
    },
    behavioural: {
      label: "Behavioural",
      color: "hsl(var(--chart-1))",
    },
    jobFit: {
      label: "JobFit",
      color: "hsl(var(--chart-2))",
    },
    overall: {
      label: "Overall",
      color: "hsl(var(--chart-3))",
    },
    technical: {
      label: "Technical",
      color: "hsl(var(--chart-4))",
    },
  } satisfies ChartConfig;
  return (
    <Card className={`${className} flex flex-col col-span-4`}>
      <CardHeader className="items-center pb-0">
        <CardTitle>Category Breakdown</CardTitle>
        {currMonthData[0] && (
          <CardDescription>
            Your current scores for{" "}
            {new Date(currMonthData[0]!.dateCreated!).toLocaleString(
              "default",
              { month: "long" }
            )}{" "}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[240px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="score"
              nameKey="category"
              innerRadius={60}
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Showing total visitors for the last 6 months
        </div>
      </CardFooter>
    </Card>
  );
};
