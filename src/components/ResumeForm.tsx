import { uploadResume } from "@/firebase/storage";
import { useState } from "react";

function ResumeForm() {
  type changeEvent = React.ChangeEvent<HTMLInputElement> | undefined
  type submitEvent = React.FormEvent<HTMLFormElement>

  const [files, setFiles] = useState<Array<File>>()

  function submitHandler(event: submitEvent) {
    event.preventDefault();
    if (files) {
      for (const file of files) {
        uploadResume(file, "uid", "jobid", "description")
      }
    }
  }

  function changeHandler(event: changeEvent) {
    event?.preventDefault();
    const files = event?.target.files;
    if (files) {
      let fileList: Array<File> = []
      for (const file of files) {
        fileList.push(file)
      }
      setFiles(fileList)
    } else 
    setFiles([])
  }

  return (
    <>
      <form onSubmit={e => submitHandler(e)}>
        <label htmlFor="file">Choose your resume to upload </label>
        <input
          type="file"
          accept=".pdf"
          onChange={e => changeHandler(e)}
        />
        <button type="submit">Submit</button>
      </form>
    </>
  )
}

export default ResumeForm;