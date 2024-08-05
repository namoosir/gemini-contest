import { useLayoutEffect, useRef } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import { useWindowScroll } from "@uidotdev/usehooks";
import { ChatMessage as OriginalChatMessage } from "@/services/voice/TTS";
import { PreviousResultsRadialChart } from "./PreviousResultsRadialChart";

type ChatMessage = OriginalChatMessage & {
  score?: number;
  feedback?: string;
};

interface Props {
  chats: ChatMessage[];
  results?: boolean;
  scroll?: boolean;
}

const Chats: React.FC<Props> = (props: Props) => {
  const { chats } = props;
  const scroller = useWindowScroll();
  const scrollTo = scroller[1];
  const textContainerRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    if (!props.scroll) return;
    if (!textContainerRef.current) return;

    scrollTo({
      left: 0,
      top: textContainerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [chats, scrollTo]);

  const renderChats = () => {
    return chats.map((chat, index) => {
      if (!chat.content) return;

      if (chat.sender === "user") {
        return (
          <div className="flex flex-col gap-4" key={index}>
            <Card
              className={`max-w-[75%] bg-primary text-primary-foreground ml-auto ${props.results ? 'opacity-50' : ''}`}
            >
              <CardContent className="p-4">{chat.content}</CardContent>
            </Card>
            {chat.score && chat.feedback &&
              <div className="max-w-[75%] flex flex-row gap-4 ml-auto items-center">
                <Card className="flex flex-row">
                  <CardContent className="p-4">
                    { chat.feedback }
                  </CardContent>
                  <CardFooter className="flex justify-center p-0 pr-4">
                    <PreviousResultsRadialChart data={Number(chat.score.toFixed(0))} />
                  </CardFooter>
                </Card>
              </div>
            }
          </div>
        );
      } else {
        return (
          <Card
            key={index}
            className={`max-w-[75%] bg-muted ${props.results ? 'opacity-50' : ''}`}
          >
            <CardContent className="p-4">{chat.content}</CardContent>
          </Card>
        );
      }
    });
  };

  return (
    <div ref={textContainerRef} className="h-full my-4 space-y-4">
      {renderChats()}
    </div>
  );
};

export default Chats;
