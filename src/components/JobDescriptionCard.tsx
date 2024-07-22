import { UseFormReturn } from "react-hook-form";
import { CardHeader, CardTitle, CardContent, CardDescription } from "./ui/card";
import { Textarea } from "./ui/textarea";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";

interface Props {
  form: UseFormReturn<
    {
      text: string;
    },
    any,
    undefined
  >;
}

const JobDescriptionCard: React.FC<Props> = (props: Props) => {
  return (
    <>
      <CardHeader>
        <CardTitle>Job Description</CardTitle>
        <CardDescription>
          Please enter the job description you would like to simulate an
          interview for.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FormField
          control={props.form.control}
          name="text"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea
                  {...field}
                  className="h-[268px]"
                  placeholder="Paste here..."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </>
  );
};

export default JobDescriptionCard;
