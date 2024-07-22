import useAuthContext from "@/hooks/useAuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";

export const UserInfoCard = () => {
  const { user } = useAuthContext();

  return (
    <Card className="ml-auto w-2/4">
      <CardHeader>
        <CardTitle>Hi, {user?.displayName}!</CardTitle>
        <CardDescription>This is your current stats...</CardDescription>
      </CardHeader>
      <CardContent>Stats...</CardContent>
      <CardFooter></CardFooter>
    </Card>
  );
};
