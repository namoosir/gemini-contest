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
import { useNavigate } from "react-router-dom";

export const UserInfoCard = () => {
  const { user } = useAuthContext();
  const [previousInterviews, setPreviousInterviews] = useState<number[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInterviewData = async () => {
      // Fetching previous interview score data from the database and set it to following variable
      let previousInterviewScores = [60, 50, 70, 40, 30, 20, 0, 10, 90, 100];
      setPreviousInterviews(previousInterviewScores);
    };

    fetchInterviewData();
  }, []);

  function goResultsPage(index: number) {
    console.log(index);
    // navigate("/resultsPage+send the index over so u pull up the right results");
  }

  return (
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
          {previousInterviews.map((previousInterviews, index) => (
            <Button
              className="flex w-full mb-1 h-14 p-0 overflow-hidden bg-primary-foreground hover:bg-secondary active:bg-primary" //MAYBE: (Switch Colouring) hover:bg-secondary active:bg-primary
              onClick={() => goResultsPage(index)}
            >
              <Card
                key={index}
                id="innerCard"
                className="bg-primary-foreground w-full items-center justify-center hover:bg-secondary active:bg-primary" //MAYBE: (Switch Colouring) hover:bg-secondary active:bg-primary
              >
                <CardContent className="flex flex-row justify-between mt-5">
                  <span className="mt-4">Interview #{index + 1}</span>
                  <span className="mt-[3.5px]">
                    <PreviousResultsRadialChart data={previousInterviews} />
                  </span>
                </CardContent>
              </Card>
            </Button>
          ))}
        </div>
      </CardContent>
      <CardFooter></CardFooter>
    </Card>
  );
};
