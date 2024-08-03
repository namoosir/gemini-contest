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
import { ChatMessage } from "@/services/voice/TTS";

export const UserInfoCard = () => {
  const { user } = useAuthContext();
  const [interviewData, setInterviewData] = useState<Interview[] | null>([]);
  const [chatData, setChatData] = useState<ChatMessage[] | undefined>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);

  useEffect(() => {
    const init = async () => {
      const data = await getUserInterviewHistory(db, user!);
      setInterviewData(data);
    };

    init();
  }, []);

  function goResultsPage(index: number) {
    if (interviewData) {
      console.log("Test");
      setChatData(interviewData[index].chat);
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
      <Card className="ml-auto w-2/4 max-h-70">
        <CardHeader>
          <CardTitle>Hi, {user?.displayName}!</CardTitle>
          <CardDescription>
            Here is your recent interview feedback…
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            id="Multiple cards of feedback"
            className="overflow-y-auto max-h-32"
          >
            {interviewData?.map((previousInterviews, index) => (
              <Button
                key={index}
                className="flex w-full mb-1 h-14 p-0 overflow-hidden bg-primary-foreground hover:bg-secondary active:bg-primary" //MAYBE: (Switch Colouring) hover:bg-secondary active:bg-primary
                onClick={() => goResultsPage(index)}
              >
                <Card
                  id="innerCard"
                  className="bg-primary-foreground w-full items-center justify-center hover:bg-secondary active:bg-primary" //MAYBE: (Switch Colouring) hover:bg-secondary active:bg-primary
                >
                  <CardContent className="flex flex-row justify-between mt-5">
                    <span className="mt-4">Interview #{index + 1}</span>
                    <span className="mt-4 text-muted-foreground">
                      Date: {previousInterviews.dateCreated}
                    </span>
                    <span className="mt-[3.5px]">
                      <PreviousResultsRadialChart
                        data={previousInterviews.score}
                      />
                    </span>
                  </CardContent>
                </Card>
              </Button>
            ))}
            {!interviewData && (
              <p>You have no interview history to display...</p>
            )}
          </div>
        </CardContent>
        <CardFooter></CardFooter>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={closeDialog}>
        <DialogContent className="p-0 max-h-[80vh] min-w-[40vw] overflow-hidden">
          <div className="overflow-y-scroll max-h-[80vh] min-w-[40vw]">
            {interviewData![currentIndex!] && (
              <DialogHeader className="flex flex-row justify-between sticky top-[-1px] bg-background w-full p-6 pb-4">
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
                    data={interviewData![currentIndex!].score}
                  />
                </div>
              </DialogHeader>
            )}
            <div className="px-6 pb-6">
              {chatData && <Chats isFromDashboard={true} chats={chatData!} />}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
