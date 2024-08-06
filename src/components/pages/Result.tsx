import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { isResultProps, ResultProps } from "./types";
import Chats from "../Chats";
import {
  cleanGeminiChat,
  ChatMessage as OriginalChatMessage,
} from "@/services/voice/TTS";
import { Interview } from "@/services/firebase/interviewService";
import { Bar, BarChart, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Label,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from "recharts";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

type ChatMessage = OriginalChatMessage & {
  score?: number;
  feedback?: string;
};

const chartConfig: ChartConfig = {
  Score: { label: "Score" },
  technicalScore: {
    label: "Technical",
    color: "green",
  },
  behavioralScore: {
    label: "Behavioral",
    color: "blue",
  },
  jobFitScore: {
    label: "Job Fit",
    color: "red",
  },
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

  const getConversation = (result: Interview) => {
    const conversation: ChatMessage[] = [];

    for (let i = 0; i < result.chat.length; i++) {
      const message = result.chat[i].content;
      if (result.chat[i].sender === "gemini") {
        conversation.push({
          sender: "gemini",
          content: cleanGeminiChat(message ?? "No Question"),
        });
      } else if (result.chat[i].sender === "user") {
        const feedbackIndex = Math.floor(i / 2);
        //console.log(feedbackIndex);
        conversation.push({
          sender: "user",
          content: message ?? "No Response",
          score: result.feedback[feedbackIndex].score.overallScore, // ???
          feedback: result.feedback[feedbackIndex].text,
        });
      }
    }

    return conversation;
  };

  const getScores = (result: Interview) => {
    if (!result || !result.overallScore) {
      return [];
    }
    console.log(resultsData?.result.overallScore);

    return [
      {
        type: "technicalScore",
        score: result.overallScore.technicalScore,
        fill: "green",
      },
      {
        type: "behavioralScore",
        score: result.overallScore.behavioralScore,
        fill: "blue",
      },
      {
        type: "jobFitScore",
        score: result.overallScore.jobFitScore,
        fill: "red",
      },
    ];
  };

  const getOverallScore = (result: Interview) => {
    if (!result || !result.overallScore) {
      return [];
    }
    console.log(resultsData?.result.overallScore);

    return [
      {
        type: "overallScore",
        score: result.overallScore.overallScore,
        fill: "orange",
      },
    ];
  };

  return (
    <div>
      {resultsData && (
        <div className="ml-5 mr-5 space-y-4">
          <div className="flex flex-row space-x-4">
            {/* overall score chart */}
            <Card className="w-[30%] h-[50%]">
              <CardHeader className="items-center pb-0">
                <CardTitle>Overall Score</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 pb-0">
                <ChartContainer
                  config={chartConfig}
                  className="mx-auto aspect-square max-h-[250px]"
                >
                  <RadialBarChart
                    data={
                      resultsData ? getOverallScore(resultsData.result) : []
                    }
                    startAngle={0}
                    endAngle={250}
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
                      dataKey="visitors"
                      background
                      cornerRadius={10}
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
                                  {getOverallScore(
                                    resultsData.result
                                  )[0].score.toLocaleString()}
                                </tspan>
                                <tspan
                                  x={viewBox.cx}
                                  y={(viewBox.cy || 0) + 24}
                                  className="fill-muted-foreground"
                                ></tspan>
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
            {/* score chart */}
            <Card className="w-[70%]">
              <CardHeader>
                <CardTitle>Score</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    Score: { label: "Score" },
                    technicalScore: {
                      label: "Technical",
                      color: "green",
                    },
                    behavioralScore: {
                      label: "Behavioral",
                      color: "blue",
                    },
                    jobFitScore: {
                      label: "Job Fit",
                      color: "red",
                    },
                  }}
                  className="h-[200px] w-full"
                >
                  <BarChart
                    accessibilityLayer
                    data={resultsData ? getScores(resultsData.result) : []}
                    layout="vertical"
                    margin={{
                      left: 0,
                    }}
                  >
                    <YAxis
                      dataKey="type"
                      type="category"
                      tickLine={false}
                      tickMargin={10}
                      axisLine={false}
                      tickFormatter={(value) => {
                        if (
                          chartConfig[value as keyof typeof chartConfig] ===
                          undefined
                        ) {
                          return " ";
                        }
                        return String(
                          chartConfig[value as keyof typeof chartConfig].label
                        ); // Provide a default string value
                      }}
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
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-y-auto max-h-96">
                <p>{resultsData.result.recommendation}</p>
              </div>
            </CardContent>
          </Card>
          <Collapsible>
            <CollapsibleTrigger>
              <h1>Click Here to see Chat history</h1>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <Chats chats={getConversation(resultsData.result)} results />
            </CollapsibleContent>
          </Collapsible>
        </div>
      )}
    </div>
  );
}
