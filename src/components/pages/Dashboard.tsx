import { DashboardBarChart } from "../DashboardBarChart";
import { UserInfoCard } from "../UserInfoCard";
import { RadialChart } from "../RadialChart";
import WelcomeCard from "../WelcomeCard";

import { useCallback, useEffect, useState } from "react";
import {
  getUserInterviewHistory,
  Interview,
} from "@/services/firebase/interviewService";
import useAuthContext from "@/hooks/useAuthContext";
import { useNavigate } from "react-router-dom";
import useFirebaseContext from "@/hooks/useFirebaseContext";
import { DonutChart } from "../DonutChart";

function Dashboard() {
  const { user } = useAuthContext();
  const { db } = useFirebaseContext();
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [currMonthData, setCurrMonthData] = useState<Interview[]>([]);
  const [prevMonthData, setPrevMonthData] = useState<Interview[]>([]);

  useEffect(() => {
    const init = async () => {
      if (!user) {
        navigate("/404");
        return;
      }
      setInterviews((await getUserInterviewHistory(db, user)) ?? []);

      const currDate = new Date();
      const currMonth = Number(
        new Date(currDate.getFullYear(), currDate.getMonth(), 1)
      );

      const nextMonth = Number(
        new Date(currDate.getFullYear(), currDate.getMonth() + 1, 1)
      );

      const prevMonth = Number(
        new Date(currDate.getFullYear(), currDate.getMonth() - 1, 1)
      );

      setCurrMonthData(
        (await getUserInterviewHistory(db, user, currMonth, nextMonth)) ?? []
      );

      setPrevMonthData(
        (await getUserInterviewHistory(db, user, prevMonth, currMonth)) ?? []
      );
    };

    void init();
  }, []);

  const getInterviewMetrics = useCallback((): {
    numberOfInterviews: number;
    averageScore: number;
    timeSpent: number;
  } => {
    const initialData = {
      numberOfInterviews: 0,
      averageScore: 0,
      timeSpent: 0,
    };

    const data = interviews.reduce((accumulator, currentValue) => {
      accumulator.numberOfInterviews += 1;
      accumulator.averageScore += currentValue.overallScore.overallScore!;
      accumulator.timeSpent += currentValue.duration;

      return accumulator;
    }, initialData);

    data.averageScore /=
      data.numberOfInterviews === 0 ? 1 : data.numberOfInterviews;

    data.averageScore = Math.floor(data.averageScore);

    return data;
  }, [interviews]);

  return (
    <div className="grid grid-cols-12 gap-8 py-12">
      <div className="col-span-8 grid gap-8">
        <WelcomeCard
          className="h-fit"
          {...getInterviewMetrics()}
          userName={user!.displayName!}
        />
        <DashboardBarChart
          currMonthData={currMonthData}
          prevMonthData={prevMonthData}
          className="h-fit"
        />
      </div>
      <div className="col-span-4 grid gap-8">
        <RadialChart className="h-fit" size={296} />

        <DonutChart className="h-fit" currMonthData={currMonthData} />
      </div>

      <UserInfoCard className="col-span-12" />
    </div>
  );
}

export default Dashboard;
