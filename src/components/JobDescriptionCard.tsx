import { CardHeader, CardTitle, CardContent, CardDescription } from "./ui/card";
import { Textarea } from "./ui/textarea";

interface Props {
  text: string | undefined;
  setText: React.Dispatch<React.SetStateAction<string | undefined>>;
  error: string | undefined;
  setError: React.Dispatch<React.SetStateAction<string | undefined>>;
}

const JobDescriptionCard: React.FC<Props> = (props: Props) => {
  const handleTextareaChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    props.setText(event.target.value);
    if (event.target.value != "" || event.target.value === undefined)
      props.setError(undefined);
  };

  return (
    <div className="w-full h-full">
      <CardHeader>
        <CardTitle>Job Description</CardTitle>
        <CardDescription>
          Please enter the job description you would like to simulate an
          interview for.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Textarea
          className="h-[268px]"
          placeholder="Paste here..."
          value={props.text}
          onChange={handleTextareaChange}
        />
        <p className="text-sm font-medium text-destructive">{props.error}</p>
      </CardContent>
    </div>
  );
};

export default JobDescriptionCard;
