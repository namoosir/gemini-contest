import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Icon from "@mdi/react";
import { mdiHomeAnalytics, mdiAccountSupervisor, mdiBookshelf } from "@mdi/js";
import { Button } from "./ui/button";
import Logo from "./icons/Logo";

type Page = "dashboard" | "interview" | "learning" | "";
interface Menu {
  name: string;
  path: Page;
  icon: JSX.Element;
}

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedPage, setSelectedPage] = useState<Page>(
    location.pathname.split("/")[1] as Page
  );
  const menu: Menu[] = [
    {
      name: "Dashboard",
      path: "dashboard",
      icon: <Icon className="h-4 w-4 mr-2" path={mdiHomeAnalytics} />,
    },
    {
      name: "Interview",
      path: "interview",
      icon: <Icon className="h-4 w-4 mr-2" path={mdiAccountSupervisor} />,
    },
    {
      name: "Learning",
      path: "learning",
      icon: <Icon className="h-4 w-4 mr-2" path={mdiBookshelf} />,
    },
  ];

  useEffect(() => {
    console.log(location.pathname.split("/")[1]);
    setSelectedPage(location.pathname.split("/")[1] as Page);
  }, [location]);

  const goToPage = (page: Page) => {
    navigate(`/${page}`);
  };

  return (
    <header className="w-full fixed z-50 top-0 bg-background lg:backdrop-blur-md border-b border-border/40 lg:bg-background/40 flex justify-center">
      <div className="flex p-3 flex-row justify-between items-center w-[1120px]">
        <div onClick={() => goToPage("")}>
          <Logo className="h-8" />
        </div>
        <div>
          {menu.map((menuItem, index) => {
            return (
              <Button
                variant="ghost"
                onClick={() => goToPage(menuItem.path)}
                key={index}
              >
                {menuItem.icon}
                {menuItem.name}
              </Button>
            );
          })}
        </div>
      </div>
    </header>
  );
};

export default Header;
