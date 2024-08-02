import Logo from "@/components/icons/Logo";
import Google from "../icons/Google";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import { Button } from "../ui/button";

import { useNavigate } from "react-router-dom";
import useAuthContext from "@/hooks/useAuthContext";

function App() {
  const navigate = useNavigate();
  const { login } = useAuthContext();

  const handleLogin = async () => {
    await login();
    navigate("/");
  };

  return (
    <div className="flex items-center justify-center min-h-full">
      <Card>
        <CardHeader></CardHeader>
        <CardContent className="flex flex-col items-center justify-center gap-8">
          <Logo />
          <Button variant="secondary" className="w-full" onClick={handleLogin}>
            <Google className="mr-2 h-5 w-5" />
            <span>Continue with Google</span>
          </Button>
        </CardContent>
        <CardFooter></CardFooter>
      </Card>
    </div>
  );
}

export default App;
