import { Dispatch, SetStateAction } from "react";
import { CardHeader, CardTitle, CardContent } from "./ui/card";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  additionalInstructions: string | undefined;
  setAdditionalInstructions: Dispatch<SetStateAction<string | undefined>>;
  duration: string | undefined;
  setDuration: Dispatch<SetStateAction<string | undefined>>;
  type: string | undefined;
  setType: Dispatch<SetStateAction<string | undefined>>;
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

  return (
    <div className="w-full">
      <CardHeader>
        <CardTitle>Options</CardTitle>
        <p className="text-base text-muted-foreground">
          Please select your preferences for this interview.
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col flex-1 gap-4 w-1/2">
          <Select
            value={props.duration}
            onValueChange={(e) => props.setDuration(e)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a duration" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {durations.map((item, index) => (
                  <SelectItem key={index} value={item.value}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          <Select value={props.type} onValueChange={(e) => props.setType(e)}>
            <SelectTrigger>
              <SelectValue placeholder="Select an interview type" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {interviewTypes.map((item, index) => (
                  <SelectItem key={index} value={item.value}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1">
          <Textarea
            className="h-32"
            placeholder="Additional instructions"
            value={props.additionalInstructions}
            onChange={(e) => props.setAdditionalInstructions(e.target.value)}
          />
        </div>
      </CardContent>
    </div>
  );
};

export default InterviewSettingsCard;
