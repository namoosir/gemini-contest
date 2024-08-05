import useAuthContext from "@/hooks/useAuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { PreviousResultsRadialChart } from "./PreviousResultsRadialChart";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import {
  getUserInterviewHistory,
  Interview,
} from "@/services/firebase/interviewService";
import { db } from "@/FirebaseConfig";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import Chats from "./Chats";
import { ChatMessage as OriginalChatMessage, cleanGeminiChat } from "@/services/voice/TTS";

interface Props {
  className?: string
}

type ChatMessage = OriginalChatMessage & {
  score?: number;
  feedback?: string;
};

export const UserInfoCard = (props:Props) => {
  const { user } = useAuthContext();
  const [interviewData, setInterviewData] = useState<Interview[] | null>([]);
  const [chatData, setChatData] = useState<ChatMessage[] | undefined>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);

  const {
    className,
  } = props

  useEffect(() => {
    const init = async () => {
      const data = await getUserInterviewHistory(db, user!);
      setInterviewData(data);
    };

    init();
  }, []);

  const getConversation = (result: Interview) => {
    const conversation: ChatMessage[] = []

    for (let i = 0; i < result.chat.length; i++) {
      const message = result.chat[i].content
      if (result.chat[i].sender === 'gemini') {
        conversation.push({
          sender: 'gemini',
          content: cleanGeminiChat(message ?? 'No Question')
        })
      } else if(result.chat[i].sender === 'user')  {
        const feedbackIndex = Math.floor(i / 2)
        console.log(feedbackIndex)
        conversation.push({
          sender: 'user',
          content: message ?? 'No Response',
          score: result.feedback[feedbackIndex].score.overallScore,
          feedback: result.feedback[feedbackIndex].text
        })
      }
    }

    return conversation
  }

  function goResultsPage(index: number) {
    if (interviewData) {
      setChatData(getConversation(interviewData[index]));
    }
    setCurrentIndex(index);
    setIsModalOpen(true);
  }

  const closeDialog = () => {
    setIsModalOpen(false);
    setChatData(undefined);
  };

  return (
    <>
      <Card className={`max-h-70 ${className}`}>
        <CardHeader>
          <CardTitle>Recent interviews</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            id="Multiple cards of feedback"
            className="overflow-y-auto max-h-32"
          >
            {interviewData?.map((previousInterviews, index) => (
              <div
                key={index}
                className="flex w-full p-4 overflow-hidden bg-muted rounded-lg cursor-pointer hover:bg-secondary"
                onClick={() => goResultsPage(index)}
              >
                <div
                  className="w-full items-center justify-center"
                >
                  <div className="flex flex-row justify-between items-center">
                    <span>Interview #{index + 1}</span>
                    <span className="text-muted-foreground">
                      Date: {previousInterviews.dateCreated}
                    </span>
                    <span>
                      <PreviousResultsRadialChart
                        data={previousInterviews.overallScore.overallScore}
                      />
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {!interviewData && (
              <p>You have no interview history to display...</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={closeDialog}>
        <DialogContent className="p-0 max-h-[80vh] min-w-[40vw] overflow-hidden">
          <div className="overflow-y-scroll max-h-[80vh] min-w-[40vw]">
            {interviewData![currentIndex!] && (
              <DialogHeader className="flex flex-row justify-between sticky top-[-1px] bg-background w-full p-6 pb-4 z-[100]">
                <div>
                  <DialogTitle>Interview #{currentIndex! + 1}</DialogTitle>
                  <DialogDescription className="whitespace-pre-wrap" asChild>
                    <span>
                      Here is your previous interview from{" "}
                      {interviewData![currentIndex!].dateCreated?.toString()}.
                    </span>
                  </DialogDescription>
                </div>
                <div className="mr-10 absolute top-2 right-0">
                  <PreviousResultsRadialChart
                    data={interviewData![currentIndex!].overallScore.overallScore}
                  />
                </div>
              </DialogHeader>
            )}
            <div className="px-6 pb-6">
              {chatData && <Chats chats={chatData} />}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
