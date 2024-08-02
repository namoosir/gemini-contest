import Icon from "@mdi/react";
import { mdiLogout, mdiMicrophone } from "@mdi/js";
import { Card, CardContent } from "@/components/ui/card";
import useAuthContext from "@/hooks/useAuthContext";

function Home() {
  const { user, logout } = useAuthContext();

  return (
    <>
      <div>
        {user && (
          <>
            <p>{user.displayName} is logged in...</p>
            <button onClick={logout} title="Sign Out">
              <Icon className="w-8 ml-1" path={mdiLogout} />
            </button>

            <Card className="bg-primary text-primary-foreground">
              <CardContent>
                <p>This is the USER card content.</p>
              </CardContent>
            </Card>

            <Card className="bg-muted">
              <CardContent>
                <p>This is the Gemini card content.</p>
              </CardContent>
            </Card>

            <Icon className="w-8 h-8" path={mdiMicrophone} />
          </>
        )}
      </div>
    </>
  );
}

export default Home;
