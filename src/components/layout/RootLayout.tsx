import useAuthContext from "@/hooks/useAuthContext";
import { Outlet } from "react-router-dom";
import Header from "../Header";

export const RootLayout = () => {
  const { user } = useAuthContext();

  return (
    <div className="min-h-screen flex justify-center">
      {user && <Header />}
      <div className="min-h-full w-[1120px] lg:mt-[65px] mt-[72px]">
        <Outlet />
      </div>
    </div>
  );
};
