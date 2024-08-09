import { Bar, BarChart, XAxis, YAxis } from "recharts"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Interview } from "@/services/firebase/interviewService"

interface Props {
  result: Interview
  className?: string
}

export function ScoreBarChart(props: Props) {
  const { result, className } = props;
  
  const chartData = [
    { type: "technical", score: result.overallScore.technicalScore, fill: "var(--color-technical)" },
    { type: "behavioral", score: result.overallScore.behavioralScore, fill: "var(--color-behavioral)" },
    // { type: "jobFit", score: result.overallScore.jobFitScore, fill: "var(--color-jobFit)" },
    { type: "jobFit", score: result.overallScore.jobFitScore, fill: "var(--color-jobFit)" },

  ]
  
  const chartConfig = {
    score: {
      label: "Score",
    },
    technical: {
      label: "Technical",
      color: "hsl(var(--chart-1))",
    },
    behavioral: {
      label: "Behavioral",
      color: "hsl(var(--chart-2))",
    },
    jobFit: {
      label: "Job Fit",
      color: "hsl(var(--chart-3))",
    },
  } satisfies ChartConfig
  
  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="items-center pb-0">
        <CardTitle>Score Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer config={chartConfig} className="h-[250px]">
          <BarChart
            accessibilityLayer
            data={chartData}
            layout="vertical"
            margin={{
              left: 16,
              right: 16,
              top: 16,
              bottom: 16,
            }}
          >
            <YAxis
              dataKey="type"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) =>
                chartConfig[value as keyof typeof chartConfig]?.label
              }
            />
            <XAxis dataKey="score" type="number" hide />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="score" layout="vertical" radius={5} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export default ScoreBarChart;