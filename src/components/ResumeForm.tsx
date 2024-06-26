import useFirebaseContext from "@/hooks/useFirebaseContext";
import { addResume } from "@/services/firebase/resumeService";
import { uploadResume } from "@/services/firebase/resumeService";
import { useState } from "react";

function ResumeForm() {
  type changeEvent = React.ChangeEvent<HTMLInputElement> | undefined
  type submitEvent = React.FormEvent<HTMLFormElement>

  const [files, setFiles] = useState<Array<File>>()
  const { storage, db } = useFirebaseContext()

  function submitHandler(event: submitEvent) {
    event.preventDefault();
    if (files) {
      for (const file of files) {        
        const ref = uploadResume(storage, file, "uid")
        addResume(db, {
          description: "description",
          url: ref,
          jobId: "jobId",
          uid: "uid",
          filename: file.name
        })
      }
    }
  }

  function changeHandler(event: changeEvent) {
    event?.preventDefault();
    const files = event?.target.files;
    if (files) {
      const fileList: Array<File> = []
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