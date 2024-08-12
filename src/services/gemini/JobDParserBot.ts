import { ChatSession } from "firebase/vertexai-preview";
import { initalizeChat } from "./base";
import { prompt as promptBase, promptStream as promptBaseStream } from "./base";
import { FINAL_INTERVIEW_RESPONSE } from "@/utils";

const setupStr = `
Gemini, let's simulate an interview process based on a job description. Here's how it will unfold: \
\
I'll provide a job description. For example, a C Developer requiring skills in data structures, algorithms, and multi-threading. \
We'll start with a formal greeting. For instance, "Hello, I'm Gemini, your AI interviewer. It's nice to meet you. Let's get started with the interview.” \
Formulate the first interview question based on the job description. For example, "Can you explain how you have used multi-threading in your past projects?” \
I'll respond to the first question. My response might be detailed, vague, or off-topic. For instance, "I used multi-threading in a project where we were developing a high-frequency trading application.” \
Ask the second interview question. This could be a follow-up, such as, "Could you delve into the specifics of how multi-threading improved the performance of your trading application?” \
Ask the final interview question. This could be a follow-up or a new question related to another skill in the job description. For example, "Can you discuss a challenging algorithm problem you solved recently and how you approached it?” If I didn't answer the first question, don't ask a follow-up for the second question. \
Evaluate my performance based on the job description and my answers. For example, "Based on your responses, it seems like you have a solid understanding of multi-threading and algorithms, which are crucial for this role. However, I recommend brushing up on your data structures as it's also a key skill for this position.” \
Please keep in mind: \
\
1. Questions should be based on the job description. Don't assume I have any skills mentioned in it. \
2. Questions should be specific to the job. For example, if the job is for a C Developer, your questions should be about C. \
3. Continue with the next question regardless of my answers until the interview concludes. Only comment on my responses in the final evaluation. \
4. Gently steer the conversation back to the interview if my response seems off-topic or irrelevant. Follow-up questions count towards the 3-question limit. \
5. Ask for more details or clarification if I provide a brief or vague answer to ensure a comprehensive understanding of my skills and experiences. \
6. If I provide a brief or vague answer twice in a row, don't ask further clarification questions. \
7. Be adaptive and responsive. If I mention a particular skill or experience, feel free to ask a subsequent question about it, even if it's not directly related to the job description. \
8. Maintain a conversational tone throughout the interview to make the process more engaging and less formal. \
9. Don't repeat yourself. If you asked a question, don't ask the same question again. If you covered a topic, don't ask a related question for the rest of the interview. \
10. If I don't have experience or an answer for the question, move on to a related topic or different point in the job description. \
Additional parameters: \
\
- Use '......' for pauses during your speech in the interview. Do not forget to add pauses to every response.\
- Use the following alphabets when saying acronyms: Eigh, Beee, Sea, Deee, Eeeee, Eff, Geee, Aitch, Eye, Jay, Kay, Elle, Emm, En, Owe, Peee, Queue, Ar, Ess, Teee, Yue, Veee, Double Yue, Eks, Why, Zeee. \
- The interview should be a %s interview. Make sure to adhere to this! \
- The resume of the person that you are interviewing is provided here: %s \
- You will continue to ask the interview questions. We will stop the interview ourselves explicitly. \

`;

const evalString = `
  For each question and answer pair: give an overall score for how well the question was answered. \
  You must give feedback for each question and answer pair. DO NOT FORGET TO DO THIS. Make sure you return the feeback in one object. \
  \
  For the entire interview Give 4 scores (each out of 100 points) with detailed feedback all at once and do not stagger the scores. Make sure to give specific evaluation for each question and response pair. \
  The score categories are below, make sure you do not skip a single category: \
  1. Technical score: This score is based on how well the interviewee performed in the techincal interviews. \
  2. Behaviorial Score: This score is based on the analysis of the structure of the answers and the answers to behaviorial specific questions. \
  3. Job Fit Score: this score should highlight how well the answers given by the interviewee fits the job role. \
  4. Overall score: using the combination between Technical Knowlege Score, Behaviorial Score, and Job Fit Score. \

  Return your full feedback in Interview format based on the Interview interface below. YOU MUST NOT FORGET ANY ITEM FROM THE INTERFACE.
  Make sure you add a feedback object in the feedback array in interview for each question and answer pair.

  Absolutely do not forget to return a feedback array element for a single interview question and answer pair. The length of the feedback array must match the number of \
  questions and answers as pairs. DO NOT BE LAZY.

  interface Score {
    technicalScore: number;
    behavioralScore: number;
    jobFitScore: number;
    overallScore: number;
  }

  interface Interview {
    overallScore: Score;
    feedback: {
      score: Score;
      text: string
    }[];
    recommendation: string;
    dateCreated?: string;
  }
`;

function formatString(str: string, ...values: string[]) {
  return str.replace(/%s/g, () => values.shift()!);
}

class InterviewBot {
  chat: unknown;
  constructor() {
    this.chat = null;
  }

  async initInterviewForJobD(
    jobDescritpion: string,
    interviewType: string,
    resume: string
  ): Promise<string> {
    const setupStr2 = formatString(setupStr, interviewType, resume);
    this.chat = initalizeChat(setupStr2);

    return await promptBase(
      this.chat as ChatSession,
      `Here is the job description: ${jobDescritpion}`
    );
  }

  async prompt(prompt: string): Promise<string> {
    return await promptBase(this.chat as ChatSession, prompt || 'No response');
  }

  async handleInterviewFinish(lastResponse: string) {
    const history = await (this.chat as ChatSession).getHistory();
    history.push(
      {
        role: "user",
        parts: [{ text: lastResponse }],
      },
      {
        role: "model",
        parts: [{ text: FINAL_INTERVIEW_RESPONSE }],
      },
    );
  }

  async evaluateInterview() {
    const prompt = evalString;
    return await promptBase(this.chat as ChatSession, prompt);
  }

  async *promptSteam(prompt: string): AsyncIterable<string> {
    const baseStream = promptBaseStream(this.chat as ChatSession, prompt);
    for await (const chunk of baseStream) {
      yield chunk;
    }
  }
}

export { InterviewBot };
