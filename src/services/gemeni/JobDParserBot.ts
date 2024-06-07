import { prompt } from './base';

class JobDParserBot {
    async parseJobDescriptionUrl(jobDescritpionUrl: string){
        return prompt("" + jobDescritpionUrl)
    }
}

export { JobDParserBot }