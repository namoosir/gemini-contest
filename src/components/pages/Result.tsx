import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { isResultProps, ResultProps } from "./types";
import Chats from "../Chats";
import { cleanGeminiChat, ChatMessage as OriginalChatMessage } from "@/services/voice/TTS";
import { Interview } from "@/services/firebase/interviewService";

type ChatMessage = OriginalChatMessage & {
  score?: number;
  feedback?: string;
};

export default function Result() {
  const [resultsData, setResultsData] = useState<ResultProps | undefined>();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (isResultProps(location.state)) {
      setResultsData(location.state);
    } else {
      navigate("/404");
    }
  }, [location, navigate]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getConversation = (result: Interview) => {
    // Ignore _ beause its the initial prompt

    const conversation: ChatMessage[] = []

    for (let i = 2; i < result.chat.length; i++) {
      const [message] = result.chat[i].content
      if (result.chat[i].sender === 'gemini') {
        conversation.push({
          sender: 'gemini',
          content: cleanGeminiChat(message ?? 'No Question')
        })
      } else if(result.chat[i].sender === 'user')  {
        conversation.push({
          sender: 'user',
          content: message ?? 'No Response',
          score: result.feedback[i - 2].score.overallScore, // ???
          feedback: result.feedback[i - 2].text
        })
      }
    }

    return conversation
  }

  return (
    <>
      {resultsData?.result.overallScore}
      {resultsData && <Chats chats={getConversation(resultsData.result)} results />}
    </>
  );
}
