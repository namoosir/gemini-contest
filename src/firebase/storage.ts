import { getStorage, ref, uploadBytes } from "firebase/storage"


export const uploadResume = (file: File) => {
    const storage = getStorage()
    const resumeRef = ref(storage, `resume/${file.name}`);
    uploadBytes(resumeRef, file).then(() => {
        console.log('Successfully uploaded file!')
    }).catch(err => console.error(`Some error happened while uploaded resume: ${err}`))
}