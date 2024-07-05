import { mdiCheck, mdiCircleOutline } from "@mdi/js";
import Icon from "@mdi/react";

import { cn } from "@/lib/utils";

interface Step {
  label: string;
  completed: boolean;
}

interface Props {
  currentStep: number;
}

export default function Steps(props: Props) {
  const steps: Step[] = [
    { label: "Job", completed: props.currentStep >= 1 },
    { label: "Resume", completed: props.currentStep >= 2 },
    { label: "Preferences", completed: props.currentStep >= 3 },
  ];

  return (
    <div className="flex flex-row justify-center items-center">
      {steps.map((step, index) => (
        <div key={index} className="flex flex-row justify-center items-center">
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
