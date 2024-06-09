import React, { useState } from 'react';
import { InterviewBot } from '@/services/gemeni/JobDParserBot';

const Interviewer: React.FC = () => {
  const [jobDescription, setJobDescription] = useState<string>('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const bot: InterviewBot = new InterviewBot();
    await bot.initInterviewForJobD(jobDescription)
  };

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJobDescription(event.target.value);
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label>
          Provide the Job description to Start the interview process:
          <textarea style={{ color: 'black'}} value={jobDescription} onChange={handleChange} />
        </label>
        <button  type="submit">Submit</button>
      </form>
    </div>
  );
};

export default Interviewer;