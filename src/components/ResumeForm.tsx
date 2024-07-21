import { ChangeEvent, FormEvent, useState } from "react";

import useFirebaseContext from "@/hooks/useFirebaseContext";
import useAuthContext from "@/hooks/useAuthContext";
import { uploadResume } from "@/services/firebase/resumeService";
import { Button } from "./ui/button";

function ResumeForm() {
  const { user } = useAuthContext();
  const [files, setFiles] = useState<File[]>();
  const { storage } = useFirebaseContext();

  async function submitHandler(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!user) return;

    if (files) {
      for (const file of files) {
        const ref = await uploadResume(storage, file, user?.uid);
        if (!ref) continue;
      }
    }
  }

  function changeHandler(event: ChangeEvent<HTMLInputElement>) {
    event.preventDefault();
    const files = event.target.files;
    if (files && files.length > 0) {
      const fileList: File[] = [];
      for (const file of files) {
        fileList.push(file);
      }
      setFiles(fileList);
    } else {
      setFiles([]);
    }
  }

  return (
    <>
      <form onSubmit={async (e) => await submitHandler(e)}>
        <label htmlFor="file">Choose your resume to upload </label>
        <input type="file" accept=".pdf" onChange={(e) => changeHandler(e)} />
        <Button type="submit">Submit</Button>
      </form>
    </>
  );
}

export default ResumeForm;
