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
  setAdditionalInstructions: React.Dispatch<
    React.SetStateAction<string | undefined>
  >;
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
          <div>
            {/* <Label htmlFor="duration">Select duration</Label> */}
            <Select>
              <SelectTrigger id="duration">
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
          </div>

          <div>
            {/* <Label htmlFor="type">Select interview type</Label> */}
            <Select>
              <SelectTrigger id="type">
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
        </div>
        <div className="flex-1">
          {/* <Label htmlFor="additional-instructions">Additional instructions</Label> */}
          <Textarea
            id="additional-instructions"
            placeholder="Additional instructions"
            value={props.additionalInstructions}
            onChange={(e) => props.setAdditionalInstructions(e.target.value)}
          />
        </div>
        {/* length, interview type, additional instructions */}
        {/* Add your interview content here */}
      </CardContent>
    </div>
  );
};

export default InterviewSettingsCard;
