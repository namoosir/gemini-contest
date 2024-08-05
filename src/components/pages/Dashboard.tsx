import { DashboardBarChart } from "../DashboardBarChart";
import { UserInfoCard } from "../UserInfoCard";
import { RadialChart } from "../RadialChart";
import WelcomeCard from "../WelcomeCard";

import { useCallback, useEffect, useState } from "react";
import { ChatMessage } from "@/services/voice/TTS";
import { getUserInterviewHistory, Interview } from "@/services/firebase/interviewService";
import { db } from "@/FirebaseConfig";
import useAuthContext from "@/hooks/useAuthContext";
import { useNavigate } from "react-router-dom";


function Dashboard() {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState<Interview[]>([]);

  useEffect(() => {
    const init = async () => {
      if (!user) {
        navigate('/404')
        return
      }
      setInterviews(await getUserInterviewHistory(db, user) || []);
    };

    init();
  }, []);

  const getInterviewMetrics = useCallback((): {
    numberOfInterviews: number
    averageScore: number
    timeSpent: number
  } => {
    const initialData = {
      numberOfInterviews: 0,
      averageScore: 0,
      timeSpent: 0,
    }

    const data = interviews.reduce((accumulator, currentValue) => {
      accumulator.numberOfInterviews += 1;
      accumulator.averageScore += currentValue.overallScore.overallScore;
      accumulator.timeSpent += currentValue.duration;

      return accumulator
    },
      initialData,
    )

    data.averageScore /= data.numberOfInterviews

    return data;
  }, [interviews])


  return (
    <div className="grid grid-cols-4 gap-8 py-12">
      <div className="flex flex-row gap-8 col-span-4">
        <WelcomeCard {...getInterviewMetrics()} userName={user!.displayName!} />
        <div>
          <RadialChart />
        </div>
      </div>

      <DashboardBarChart className="col-span-2" />
      <UserInfoCard className="col-span-2" />
    </div>
  );
}

export default Dashboard;
