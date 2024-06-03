import { getStorage, ref, uploadBytes } from "firebase/storage"
import { createResume } from "./database";

export const uploadResume = (file: File, uid: string, jobId: string, description: string) => {
	const storage = getStorage()
	const resumeRef = ref(storage, `resume/${uid}/${file.name}`);

	// This uploads it to firebase Storage
	uploadBytes(resumeRef, file).then(() => {
		console.log('Successfully uploaded file!')
	}).catch(err => console.error(`Some error happened while uploading resume: ${err}`))

	// This line creates a document in firestore
	createResume({
		description: description,
		url: resumeRef.toString(),
		jobId: jobId
	}, uid)
}