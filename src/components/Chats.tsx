import { useLayoutEffect, useRef } from "react";
import { Card, CardContent } from "./ui/card";
import { useWindowScroll } from "@uidotdev/usehooks";

export interface ChatMessage {
  sender: "user" | "gemini";
  content: string;
}

interface Props {
  chats: ChatMessage[];
}

const Chats: React.FC<Props> = (props: Props) => {
  const { chats } = props;
  const scroller = useWindowScroll();
  const scrollTo = scroller[1];
  const textContainerRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    if (!textContainerRef.current) return;

    scrollTo({
      left: 0,
      top: textContainerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [chats, scrollTo]);

  const renderChats = () => {
    return chats.map((chat, index) => {
      if (!chat.content) return
      
      if (chat.sender === "user") {
        return (
          <Card
            key={index}
            className="w-max max-w-[75%] bg-primary text-primary-foreground ml-auto"
          >
            <CardContent className="p-4">{chat.content}</CardContent>
          </Card>
        );
      } else {
        return (
          <Card key={index} className="w-max max-w-[75%] bg-muted">
            <CardContent className="p-4">{chat.content}</CardContent>
          </Card>
        );
      }
    });
  };

  return (
    <div ref={textContainerRef} className="space-y-4 h-max">
      {renderChats()}
    </div>
  );
};

export default Chats;
