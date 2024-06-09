import { prompt } from './base';

// Will provide an interview based on the inital job description
const userResponses = [
    "Im qualified",
    "Im super qualified",
    "Im mega qualified",
]
class InterviewBot {
    async initInterviewForJobD(jobDescritpion: string){
        let res = await prompt(`
            I want you to provide me 3 interview questions based on the job description i'm about to provide.
            I will prompt you 4 more times in the future.
            The first time will be the the job description. You will return me the first interview question.
            The second time will be my answer to the first interview question. You will return me the second interview question.
            The third time will be my answer to the second interview question. You will return me the last interview question.
            The forth time will be my answer to the last interview question. 
            You will return me an evaulation of how well I performed based on the job description and the answers for the each 3 questions.
            Understood?

            Here are some extra considerations:
            - This is a job description. Do not assume I currently have any or all of the skills mentioned in the job description.
                Only ask questions as if you are an interviewer hiring for the job. You have no knowledge on the background of me.
            - You should still be asking questions specific to to the job. Ie. if you the job is a C Develooper, you should be asking
                questions around C. Regardless of wether the user actually knows any the skill.
            - My response can be extremley random. Regardless of my response, you will give me the next question until the last.
                You should only comment on my responses after the interview is over. When you return me an evaulation.
            `
        )
        console.log(res)

        res = await prompt("Here is the job description \n" + jobDescritpion);
        console.log(res)

        res = await prompt("This is my response to the first question \n" + userResponses[0]);
        console.log(res)
        res = await prompt("This is my response to the second question \n" + userResponses[1]);
        console.log(res)
        res = await prompt("This is my response to the last question \n" + userResponses[2]);
        console.log(res)


    }
}

export { InterviewBot }