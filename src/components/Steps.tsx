import { mdiCheck, mdiCircleOutline } from "@mdi/js";
import Icon from "@mdi/react";

import { cn } from "@/lib/utils";
import { Dispatch, SetStateAction } from "react";
import { Page } from "./pages/Interview";

interface Step {
  label: string;
  completed: boolean;
}

interface Props {
  currentStep: number;
  onStepClick: Dispatch<SetStateAction<Page>>
}

export default function Steps(props: Props) {
  const steps: Step[] = [
    { label: "Job", completed: props.currentStep >= 1 },
    { label: "Resume", completed: props.currentStep >= 2 },
    { label: "Options", completed: props.currentStep >= 3 },
  ];

  return (
    <div className="flex flex-row justify-center items-center">
      {steps.map((step, index) => (
        <div onClick={() => props.onStepClick((index) as Page)} key={index} className="flex flex-row justify-center items-center cursor-pointer">
          <div className="flex flex-row justify-center items-center gap-1">
            <Icon
              className={cn(
                "h-4 w-4 text-muted-foreground",
                (index > 0 ? steps[index - 1].completed : true) ? "text-primary" : ""
              )}
              path={step.completed ? mdiCheck : mdiCircleOutline}
            />
          </div>
          <p className={cn("ml-1 text-muted-foreground", step.completed ? "text-primary" : "")}>
            {step.label}
          </p>
          {index < steps.length - 1 && (
            <div
              className={cn(
                "w-10 h-1 rounded-lg",
                step.completed ? "bg-primary" : "bg-muted-foreground",
                "mx-2"
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}
