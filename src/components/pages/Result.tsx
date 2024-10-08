import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { isResultProps, ResultProps } from "./types";
import Chats from "../Chats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer } from "@/components/ui/chart";
import {
  Label,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from "recharts";

import ScoreBarChart from "../ScoreBarChart";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "../ui/dialog";
import { DialogHeader, DialogTrigger } from "../ui/dialog";
import { PreviousResultsRadialChart } from "../PreviousResultsRadialChart";
import { Button } from "../ui/button";
import { getConversation } from "@/utils";


const chartConfig: ChartConfig = {
  overallScore: {
    label: "Overall",
    color: "hsl(var(--chart-4))",
  },
} satisfies ChartConfig;

export default function Result() {
  const [resultsData, setResultsData] = useState<ResultProps>();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (isResultProps(location.state)) {
      setResultsData(location.state);
    } else {
      navigate("/404");
    }
  }, [location, navigate]);

  const chartData = [
    {
      overallScore: resultsData?.result.overallScore.overallScore,
    },
  ];

  return (
    <div className="grid grid-cols-12 gap-8 py-12">
      {resultsData && (
        <>
          <Card className="col-span-4 h-fit">
            <CardHeader className="items-center pb-0">
              <CardTitle>Overall Score</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
              <ChartContainer
                config={chartConfig}
                className="mx-auto aspect-square max-h-[250px]"
              >
                <RadialBarChart
                  data={chartData}
                  startAngle={0}
                  endAngle={(chartData[0].overallScore! / 100) * 360}
                  innerRadius={80}
                  outerRadius={110}
                >
                  <PolarGrid
                    gridType="circle"
                    radialLines={false}
                    stroke="none"
                    className="first:fill-muted last:fill-background"
                    polarRadius={[86, 74]}
                  />
                  <RadialBar
                    dataKey="overallScore"
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
                                className="fill-foreground text-4xl font-bold"
                              >
                                {chartData?.[0]?.overallScore!.toLocaleString()}
                              </tspan>
                            </text>
                          );
                        }
                      }}
                    />
                  </PolarRadiusAxis>
                </RadialBarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <ScoreBarChart
            className="col-span-8 h-fit"
            result={resultsData.result}
          />

          <Card className="col-span-12">
            <CardHeader>
              <CardTitle>Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-y-auto max-h-96">
                <p>{resultsData.result.recommendation}</p>
              </div>
            </CardContent>
          </Card>

          <Dialog>
            <DialogTrigger asChild>
              <Button className="col-span-12">View Detailed Chat Logs</Button>
            </DialogTrigger>
            <DialogContent className="p-0 max-h-[80vh] min-w-[40vw] overflow-hidden">
              <div className="overflow-y-scroll max-h-[80vh] min-w-[40vw]">
                <DialogHeader className="flex flex-row justify-between sticky top-[-1px] bg-background mx-6 py-4 z-[100]">
                  <div>
                    <DialogTitle>Chat History</DialogTitle>
                    <DialogDescription className="whitespace-pre-wrap" asChild>
                    </DialogDescription>
                  </div>
                  <div className="ml-auto">
                    <PreviousResultsRadialChart
                      data={resultsData?.result.overallScore.overallScore ?? 0}
                    />
                  </div>
                </DialogHeader>
                <div className="px-6 pb-6">
                  {getConversation(resultsData.result) && (
                    <Chats chats={getConversation(resultsData.result)} />
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}
