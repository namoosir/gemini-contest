import { Dispatch, SetStateAction, useEffect } from "react";
import { CardHeader, CardTitle, CardContent, CardDescription } from "./ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Label } from "./ui/label";
import { error } from "console";

interface Props {
  duration: string | undefined;
  setDuration: Dispatch<SetStateAction<string | undefined>>;
  type: string | undefined;
  setType: Dispatch<SetStateAction<string | undefined>>;
  mode: string | undefined;
  setMode: Dispatch<SetStateAction<string | undefined>>;
  interviewTypes: { value: string; name: string }[];
  modes: { value: string; name: string }[];
  durations: { value: string; name: string }[];
}

const InterviewSettingsCard: React.FC<Props> = (props: Props) => {
  return (
    <div className="w-full h-full">
      <CardHeader>
        <CardTitle>Options</CardTitle>
        <CardDescription>
          Please select your preferences for this interview.
        </CardDescription>
      </CardHeader>
      <CardContent>
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
              onValueChange={(value) => {
                if (value) {
                  props.setDuration(value);
                }
              }}
              //defaultValue={durations[0].value}
            >
              {props.durations.map((item) => (
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
              onValueChange={(value) => {
                if (value) {
                  props.setType(value);
                }
              }}
            >
              {props.interviewTypes.map((item) => (
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
              onValueChange={(value) => {
                if (value) {
                  props.setMode(value);
                }
              }}
            >
              {props.modes.map((item) => (
                <ToggleGroupItem key={item.value} value={item.value}>
                  {item.name}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        </div>
        <p className="text-sm font-medium text-destructive">{props.error}</p>
      </CardContent>
    </div>
  );
};

export default InterviewSettingsCard;
