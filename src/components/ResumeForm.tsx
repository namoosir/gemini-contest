import { useState } from "react";
import useFirebaseContext from "@/hooks/useFirebaseContext";

import useAuthContext from "@/hooks/useAuthContext";
import { addResume, uploadResume } from "@/services/firebase/resumeService";

type changeEvent = React.ChangeEvent<HTMLInputElement> | undefined
type submitEvent = React.FormEvent<HTMLFormElement>

function ResumeForm() {
  const { user } = useAuthContext()
  const [files, setFiles] = useState<File[]>()
  const { storage, db } = useFirebaseContext()

  async function submitHandler(event: submitEvent) {
    event.preventDefault();

    if (!user) return;

    if (files) {
      for (const file of files) {        
        const ref = await uploadResume(storage, file, user?.uid)
        if (!ref) continue

        await addResume(db, {
          description: "description",
          url: ref,
          jobId: "jobId",
          uid: user?.uid,
          filename: file.name
        })
      }
    }
  }

  function changeHandler(event: changeEvent) {
    event?.preventDefault();
    const files = event?.target.files;
    if (files) {
      const fileList: File[] = []
      for (const file of files) {
        fileList.push(file)
      }
      setFiles(fileList)
    } else {
      setFiles([])
    }
  }

  return (
    <>
      <form onSubmit={async e => await submitHandler(e)}>
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