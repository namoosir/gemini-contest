import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Icon from "@mdi/react";
import {
  mdiHomeAnalytics,
  mdiAccountSupervisor,
  mdiBookshelf,
  mdiLogout,
} from "@mdi/js";
import { useClickAway } from "@uidotdev/usehooks";
import Hamburger from "hamburger-react";
import { motion, AnimatePresence } from "framer-motion";

import useFirebaseContext from "@/hooks/useFirebaseContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "./ui/button";
import Logo from "./icons/Logo";
import { signOut, User } from "firebase/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Page = "dashboard" | "interview" | "learning" | "";
interface Menu {
  name: string;
  path: Page;
  icon: JSX.Element;
}

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { auth } = useFirebaseContext();

  const [user, setUser] = useState<User | undefined>(undefined);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedPage, setSelectedPage] = useState<Page>(
    location.pathname.split("/")[1] as Page
  );

  const mobileRef = useClickAway(() => {
    setIsOpen(false);
  });

  useEffect(() => {
    const signIn = auth.onAuthStateChanged((newUser) => {
      if (newUser) {
        setUser(newUser);
        console.log(newUser);
      } else {
        setUser(undefined);
      }
    });
    return () => signIn();
  }, [auth]);

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

  const getInitials = () => {
    if (user?.displayName) {
      const names = user.displayName.split(" ");
      if (names.length > 1) {
        return names[0][0] + names[1][0];
      }
      return names[0][0];
    }
    return "!";
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      window.location.href = "/";
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <header className="w-full fixed z-50 top-0 bg-background lg:backdrop-blur-md border-b border-border/40 lg:bg-background/40 flex justify-center">
      <div className="flex p-3 flex-row justify-between items-center w-[1120px]">
        <div onClick={() => goToPage("")}>
          <Logo className="h-8 w-[340px] cursor-pointer" />
        </div>
        <div className="hidden lg:flex gap-2 justify-center items-center">
          {menu.map((menuItem, index) => {
            return (
              <Button
                variant="ghost"
                onClick={() => goToPage(menuItem.path)}
                key={index}
              >
                <span
                  className={
                    selectedPage === menuItem.path
                      ? "text-foreground"
                      : "text-muted-foreground"
                  }
                >
                  {menuItem.icon}
                </span>
                <span
                  className={
                    selectedPage === menuItem.path
                      ? "text-foreground"
                      : "text-muted-foreground"
                  }
                >
                  {menuItem.name}
                </span>
              </Button>
            );
          })}
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Avatar className="h-8 w-8 text-xs">
                <AvatarImage src={user?.photoURL} />
                <AvatarFallback>{getInitials()}</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                className="flex justify-center"
                onClick={handleSignOut}
              >
                <Icon className="h-4 w-4 mr-2" path={mdiLogout} />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div
          // @ts-expect-error ref type is not matching
          ref={mobileRef}
          className="lg:hidden"
        >
          <Hamburger
            color="hsl(var(--foreground))"
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
                  <Button
                    className="w-full"
                    variant="ghost"
                    onClick={() => {
                      setIsOpen((prev) => !prev);
                      goToPage(menuItem.path);
                    }}
                    key={index}
                  >
                    <span
                      className={
                        selectedPage === menuItem.path
                          ? "text-foreground"
                          : "text-muted-foreground"
                      }
                    >
                      {menuItem.icon}
                    </span>
                    <span
                      className={
                        selectedPage === menuItem.path
                          ? "text-foreground"
                          : "text-muted-foreground"
                      }
                    >
                      {menuItem.name}
                    </span>
                  </Button>
                ))}
                <div className="flex justify-center items-center w-full">
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <Avatar className="h-8 w-8 text-xs">
                        <AvatarImage src={user?.photoURL} />
                        <AvatarFallback>{getInitials()}</AvatarFallback>
                      </Avatar>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        className="flex justify-center"
                        onClick={handleSignOut}
                      >
                        <Icon className="h-4 w-4 mr-2" path={mdiLogout} />
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

export default Header;
