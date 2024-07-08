import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { CardHeader, CardTitle, CardContent } from "./ui/card";
import { Textarea } from "./ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface Props {
  text: string | undefined;
  setText: React.Dispatch<React.SetStateAction<string | undefined>>;
}

const FormSchema = z.object({ text: z.string().min(50) });

const JobDescriptionCard: React.FC<Props> = (props: Props) => {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      text: "",
    },
  });
  
  function onSubmit(data: z.infer<typeof FormSchema>) {}

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
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Textarea
              className="h-60"
              placeholder="Paste here..."
              value={props.text}
              onChange={(e) => props.setText(e.target.value)}
            />
          </form>
        </Form>
      </CardContent>
    </div>
  );
};

export default JobDescriptionCard;
