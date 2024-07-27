import { DashboardBarChart } from "../DashboardBarChart";
import { UserInfoCard } from "../UserInfoCard";
import { RadialChart } from "../RadialChart";

import { useEffect, useState } from "react";
import { ChatMessage } from "@/services/voice/TTS";
import { getUserInterviewHistory } from "@/services/firebase/saveInterviewSevice";
import { db } from "@/FirebaseConfig";
import useAuthContext from "@/hooks/useAuthContext";

function Dashboard() {
  // const { user } = useAuthContext();

  // useEffect(() => {
  //   const init = async () => {
  //     await getUserInterviewHistory(db, user!);
  //   };

  //   init();
  // }, []);

  return (
    <div className="flex flex-col m-10">
      <div className="flex flex-row">
        <div className="pr-20">
          <RadialChart />
        </div>
        <UserInfoCard />
      </div>
      <DashboardBarChart />
    </div>
  );
}

export default Dashboard;
