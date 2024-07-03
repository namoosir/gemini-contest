import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Icon from "@mdi/react";
import { mdiHomeAnalytics, mdiAccountSupervisor, mdiBookshelf } from "@mdi/js";
import { useClickAway } from '@uidotdev/usehooks'
import Hamburger from 'hamburger-react'
import { motion, AnimatePresence } from 'framer-motion'

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

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedPage, setSelectedPage] = useState<Page>(
    location.pathname.split("/")[1] as Page
  );

  const mobileRef = useClickAway(() => { setIsOpen(false) })
  
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
          <Logo className="h-8 w-[340px] cursor-pointer" />
        </div>
        <div className="hidden lg:flex">
          {menu.map((menuItem, index) => {
            return (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  type: 'spring',
                  stiffness: 260,
                  damping: 20,
                  delay: 0.1 + index / 10
                }}
                key={index}
              >
                <Button
                  variant="ghost"
                  onClick={() => goToPage(menuItem.path)}
                  key={index}
                >
                  <span className={selectedPage === menuItem.path ? 'text-primary' : ''}>{menuItem.icon}</span>
                  {menuItem.name}
                </Button>
              </motion.div>
            );
          })}
        </div>
        <div
          // @ts-expect-error ref type is not matching
          ref={mobileRef}
          className="lg:hidden"
        >
          <Hamburger
            color="hsl(var(--primary))"
            size={24}
            toggled={isOpen}
            toggle={setIsOpen}
          />
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed left-0 shadow-4xl right-0 top-[72px] p-3 pt-0 bg-background border-b border-border/40 grid"
              >
                {menu.map((menuItem, index) => (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                      type: 'spring',
                      stiffness: 260,
                      damping: 20,
                      delay: 0.1 + index / 10
                    }}
                    key={index}
                  >
                    <Button
                      className="w-full"
                      variant="ghost"
                      onClick={() => {
                        setIsOpen((prev) => !prev)
                        goToPage(menuItem.path)
                      }}
                      key={index}
                    >
                      <span className={selectedPage === menuItem.path ? 'text-primary' : ''}>{menuItem.icon}</span>
                      {menuItem.name}
                    </Button>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

export default Header;
