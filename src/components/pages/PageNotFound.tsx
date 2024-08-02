import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";

const PageNotFound = () => {
  const navigate = useNavigate();

  const handleReturnHome = () => {
    navigate("/", { replace: true });
  };

  return (
    <div className="flex flex-col w-full h-full justify-center items-center gap-6">
      <h1 className="text-5xl font-bold">Lost your way?</h1>
      <h1 className="text-xl text-muted-foreground">
        Sorry we can&apos;t find that page. You&apos;ll find lots to explore on
        the Home Page.
      </h1>
      <Button onClick={handleReturnHome}>Return Home</Button>
    </div>
  );
};

export default PageNotFound;
