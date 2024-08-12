import { Pie, PieChart } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "./ui/chart";
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
    let behaviourSum = 0;
    let jobFitSum = 0;
    let technicalSum = 0;

    for (const currMonth of currMonthData) {
      behaviourSum += currMonth.overallScore.behavioralScore;
      jobFitSum += currMonth.overallScore.jobFitScore;
      technicalSum += currMonth.overallScore.technicalScore;
    }

    setScores({
      behavioralScore: behaviourSum,
      jobFitScore: jobFitSum,
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
      score: scores?.jobFitScore ?? 0,
      fill: "var(--color-jobFit)",
    },
    {
      category: "Technical",
      score: scores?.technicalScore ?? 0,
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
            {new Date(currMonthData[0].dateCreated!).toLocaleString("default", {
              month: "long",
            })}{" "}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        {scores?.behavioralScore !== 0 &&
        scores?.technicalScore !== 0 &&
        scores?.jobFitScore !== 0 ? (
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[296px]"
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
                innerRadius={80}
              />
            </PieChart>
          </ChartContainer>
        ) : (
          <div className="h-[322px] flex flex-col justify-center items-center text-muted-foreground">
            No Data Available
          </div>
        )}
      </CardContent>
    </Card>
  );
};
