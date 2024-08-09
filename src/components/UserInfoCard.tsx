import useAuthContext from "@/hooks/useAuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { PreviousResultsRadialChart } from "./PreviousResultsRadialChart";
import { useEffect, useState } from "react";
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
import {
  ChatMessage as OriginalChatMessage,
  cleanGeminiChat,
} from "@/services/voice/TTS";

interface Props {
  className?: string;
}

type ChatMessage = OriginalChatMessage & {
  score?: number;
  feedback?: string;
};

export const UserInfoCard = (props: Props) => {
  const { user } = useAuthContext();
  const [interviewData, setInterviewData] = useState<Interview[] | null>([]);
  const [chatData, setChatData] = useState<ChatMessage[] | undefined>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);

  const { className } = props;

  useEffect(() => {
    const init = async () => {
      const data = await getUserInterviewHistory(db, user!);
      setInterviewData(data);
    };

    void init();
  }, []);

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
        console.log(feedbackIndex);
        conversation.push({
          sender: "user",
          content: message ?? "No Response",
          score: result.feedback[feedbackIndex].score.overallScore,
          feedback: result.feedback[feedbackIndex].text,
        });
      }
    }

    return conversation;
  };

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
            className="overflow-y-auto max-h-70 flex flex-col gap-2"
          >
            {interviewData?.map((previousInterviews, index) => (
              <div
                key={index}
                className="flex items-center justify-center rounded-lg ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2 cursor-pointer"
                onClick={() => goResultsPage(index)}
              >
                <div className="w-full items-center justify-center">
                  <div className="flex flex-row justify-between items-center">
                    <span>Interview #{index + 1}</span>
                    <span className="text-muted-foreground text-sm">
                      Date: {previousInterviews.dateCreated}
                    </span>
                    <span>
                      <PreviousResultsRadialChart
                        data={previousInterviews.overallScore.overallScore ?? 0}
                      />
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {interviewData?.length === 0 && (
              <p className="text-sm text-muted-foreground">
                You have no interview history to display
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={closeDialog}>
        <DialogContent className="p-0 max-h-[80vh] min-w-[40vw] overflow-hidden">
          <div className="overflow-y-scroll max-h-[80vh] min-w-[40vw]">
            {interviewData![currentIndex!] && (
              <DialogHeader className="flex flex-row justify-between sticky top-[-1px] bg-background mx-6 py-4 z-[100]">
                <div>
                  <DialogTitle>Interview #{currentIndex! + 1}</DialogTitle>
                  <DialogDescription className="whitespace-pre-wrap" asChild>
                    <span>
                      Here is your previous interview from{" "}
                      {interviewData![currentIndex!].dateCreated?.toString()}.
                    </span>
                  </DialogDescription>
                </div>
                <div className="ml-auto">
                  <PreviousResultsRadialChart
                    data={
                      interviewData![currentIndex!].overallScore.overallScore ?? 0
                    }
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
