import fetch from 'node-fetch';

class WebPage {
    url: string;
    htmlContent: string;

    private constructor(url: string, htmlContent: string) {
        this.url = url;
        this.htmlContent = htmlContent;
    }

    static async init(url: string): Promise<WebPage> {
        const htmlContent = await WebPage.fetchHTML(url);
        return new WebPage(url, htmlContent);
    }

    private static async fetchHTML(url: string): Promise<string> {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return await response.text();
        } catch (error) {
            console.error('Failed to fetch HTML:', error);
            throw error;
        }
    }

    htmlpage(): string {
        return this.htmlContent;
    }
}

export { WebPage }