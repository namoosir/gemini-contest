import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { isResultProps, ResultProps } from "./types";
import { Content } from "firebase/vertexai-preview";
import ResultChat from "../ResultChat";

export interface convoT { question: string, answer: string, score: number }

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
  const getConvo = ([_, ...history]: Content[]) => {
    // Ignore _ beause its the initial prompt

    const convo: convoT[] = []

    // Statring from 2 cuz thats when the actual Interview starts
    for (let i = 2; i < history.length / 2; i += 2) {
      const [question] = history[i].parts
      const [answer] = history[i + 1].parts
      convo.push({
        question: question.text ?? "No response",
        answer: answer.text ?? "No response",
        score: Math.round(Math.random() * 100)
      })
    }

    return convo
  }

  return (
    <div>
      <h1>Results Page</h1>
      {resultsData ? <ResultChat props={getConvo(resultsData.history)} /> : ""}
    </div>
  );
}
