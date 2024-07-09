import { Dispatch, SetStateAction } from "react";
import { CardHeader, CardTitle, CardContent, CardDescription } from "./ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Label } from "./ui/label";

interface Props {
  duration: string | undefined;
  setDuration: Dispatch<SetStateAction<string | undefined>>;
  type: string | undefined;
  setType: Dispatch<SetStateAction<string | undefined>>;
  mode: string | undefined;
  setMode: Dispatch<SetStateAction<string | undefined>>;
}

const InterviewSettingsCard: React.FC<Props> = (props: Props) => {
  const durations = [
    {
      value: "5",
      name: "5 Minutes",
    },
    {
      value: "10",
      name: "10 Minutes",
    },
    {
      value: "15",
      name: "15 Minutes",
    },
  ];

  const interviewTypes = [
    {
      value: "technical",
      name: "Technical",
    },
    {
      value: "behavioral",
      name: "Behavioral",
    },
    {
      value: "case-study",
      name: "Case Study",
    },
  ];

  const modes = [
    {
      value: "normal",
      name: "Normal",
    },
    { value: "voice-only", name: "Voice Only" },
  ];

  return (
    <div className="w-full h-full">
      <CardHeader>
        <CardTitle>Options</CardTitle>
        <CardDescription>
          Please select your preferences for this interview.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 ">
          <div className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="interview-duration">Duration</Label>
              <CardDescription>
                Select the length of the interview session that best fits your
                needs.
              </CardDescription>
            </div>
            <ToggleGroup
              type="single"
              variant="outline"
              id="interview-duration"
              size="lg"
              value={props.duration}
              onValueChange={props.setDuration}
              defaultValue={durations[0].value}
            >
              {durations.map((item) => (
                <ToggleGroupItem key={item.value} value={item.value}>
                  {item.name}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
          <div className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="interview-type">Type </Label>
              <CardDescription>
                Tailor the session to a interview type depending on the
                requirements of the role.
              </CardDescription>
            </div>
            <ToggleGroup
              type="single"
              variant="outline"
              id="interview-type"
              size="lg"
              value={props.type}
              onValueChange={props.setType}
              defaultValue={interviewTypes[0].value}
            >
              {interviewTypes.map((item) => (
                <ToggleGroupItem key={item.value} value={item.value}>
                  {item.name}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
          <div className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5 w-1/2">
              <Label htmlFor="interview-mode">Mode</Label>
              <CardDescription>
                Choose between normal mode or voice only which excludes the
                transcript.
              </CardDescription>
            </div>
            <ToggleGroup
              type="single"
              variant="outline"
              id="interview-mode"
              className="w-fit-content"
              size="lg"
              value={props.mode}
              onValueChange={props.setMode}
              defaultValue={modes[0].value}
            >
              {modes.map((item) => (
                <ToggleGroupItem key={item.value} value={item.value}>
                  {item.name}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        </div>
      </CardContent>
    </div>
  );
};

export default InterviewSettingsCard;
