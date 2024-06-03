import { uploadResume } from "@/firebase/storage";
import { FormEvent } from "react";

function ResumeForm() {
  type changeEvent = React.ChangeEvent<HTMLInputElement> | undefined;
  type formEvent = FormEvent<HTMLFormElement>

  function handleSubmit(event: formEvent) {
    console.log(event);
    event.preventDefault();
  }

  function handleChange(event: changeEvent) {
    event?.preventDefault();
    const files = event?.target.files;
    if (files && files?.length === 1) {
      const file = files[0];
      uploadResume(file, "uid", "jobid", "description");
    }
  }

  return (
    <>
      <form onSubmit={e => handleSubmit(e)}>
        <label htmlFor="file">Choose your resume to upload </label>
        <input
          type="file"
          accept=".pdf"
          onChange={e => handleChange(e)}
        />
        <button type="submit">Upload</button>
      </form>
    </>
  )
}

export default ResumeForm;