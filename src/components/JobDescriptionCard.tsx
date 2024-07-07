import { CardHeader, CardTitle, CardContent } from "./ui/card";
import { Textarea } from "./ui/textarea";

interface Props {
  text: string | undefined;
  setText: React.Dispatch<React.SetStateAction<string | undefined>>;
}

const JobDescriptionCard: React.FC<Props> = (props: Props) => {
  return (
    <div className="w-full">
      <CardHeader>
        <CardTitle>Job Description</CardTitle>
        <p className="text-base text-muted-foreground">
          Please enter the job description you would like to simulate an
          interview for.
        </p>
      </CardHeader>
      <CardContent>
        <Textarea
          className="h-60"
          placeholder="Paste here..."
          value={props.text}
          onChange={(e) => props.setText(e.target.value)}
        />
      </CardContent>
    </div>
  );
};

export default JobDescriptionCard;
