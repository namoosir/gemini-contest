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

  return (
    <div>
      <p>{resultsData?.result.overallScore.overallScore}</p>
      {resultsData && <Chats chats={getConversation(resultsData.result)} results />}
    </div>
  );
}
