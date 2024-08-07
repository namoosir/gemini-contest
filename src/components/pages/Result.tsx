import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { isResultProps, ResultProps } from "./types";
import Chats from "../Chats";
import {
  cleanGeminiChat,
  ChatMessage as OriginalChatMessage,
} from "@/services/voice/TTS";
import { Interview } from "@/services/firebase/interviewService";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
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
import ScoreBarChart from "../ScoreBarChart";

type ChatMessage = OriginalChatMessage & {
  score?: number;
  feedback?: string;
};

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
          sender: 'user',
          content: message ?? 'No Response',
          score: result.feedback[feedbackIndex].score.overallScore,
          feedback: result.feedback[feedbackIndex].text
        })
      }
    }

    return conversation;
  };

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
                  endAngle={chartData[0].overallScore / 100 * 360}
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
                                {chartData?.[0]?.overallScore.toLocaleString()}
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

          <ScoreBarChart className="col-span-8 h-fit" result={resultsData.result} />

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
          
          <Collapsible className="col-span-12">
            <CollapsibleTrigger>
              <h1>Click Here to see Chat history</h1>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <Chats chats={getConversation(resultsData.result)} results />
            </CollapsibleContent>
          </Collapsible>
        </>
      )}
    </div>
  );
}
