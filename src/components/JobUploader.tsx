import React, { useState } from 'react';
import { JobDParserBot } from '@/services/gemeni/JobDParserBot';
import { WebPage } from '@/services/utils/url';

const JobUploader: React.FC = () => {
  const [url, setUrl] = useState<string>('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const bot: JobDParserBot = new JobDParserBot();
    try {
      const webpage = await WebPage.init(url);
      console.log(webpage.htmlpage())

      // const generatedText = await bot.parseJobDescriptionUrl(url)
      

    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUrl(event.target.value);
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label>
          Input Job Post Url:
          <textarea value={url} onChange={handleChange} />
        </label>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default JobUploader;