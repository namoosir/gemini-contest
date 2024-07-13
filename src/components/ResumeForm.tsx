import useAuthContext from "@/hooks/useAuthContext";
import useFirebaseContext from "@/hooks/useFirebaseContext";
import { addResume } from "@/services/firebase/resumeService";
import { uploadResume } from "@/services/firebase/resumeService";
import { ChangeEvent, FormEvent, useState } from "react";

function ResumeForm() {
  const { user } = useAuthContext();
  const [files, setFiles] = useState<File[]>([]);
  const { storage, db } = useFirebaseContext();

  async function submitHandler(event: FormEvent) {
    event.preventDefault();
    if (user && files.length > 0) {
      for (const file of files) {
        try {
          const ref = await uploadResume(storage, file, user.uid);
          console.log(ref);
          await addResume(db, {
            description: "description",
            url: ref,
            jobId: "jobId",
            uid: user.uid,
            filename: file.name,
          });
        } catch (error) {
          alert("Something went wrong while tryiing to upload Resume.");
          console.error(error as string);
        }
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
    } else setFiles([]);
  }

  return (
    <>
      <form onSubmit={async (e) => await submitHandler(e)}>
        <label htmlFor="file">Choose your resume to upload </label>
        <input type="file" accept=".pdf" onChange={(e) => changeHandler(e)} />
        <button type="submit">Submit</button>
      </form>
    </>
  );
}

export default ResumeForm;
