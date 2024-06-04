import { prompt } from './base';

class JobDParserBot {
    async parseJobDescriptionUrl(jobDescritpionUrl: string){
        return prompt("Give me the job desciption form the following URL: " + jobDescritpionUrl)
    }
}

export { JobDParserBot }