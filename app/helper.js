const axios = require('axios');
const cheerio = require('cheerio');

class YoutubeGrabberHelper {
    /**
     * Try to get response from request
     * @param { string } url An url
     * @return { Promise<AxiosResponse | null> } Return AxiosResponse or null if response is end with error
     * */
    static async getResource(url) {
        let response;
        try {
            response = await axios.get(url);
        } catch (e) {
            return null;
        }

        return response;
    }

    /**
     * Get the existing status of resource
     * @param { string } url The url of youtube resource
     * @returns { Promise<boolean> } Return TRUE if resource is exists
     * */
    static async isResourceExists(url) {
        const response = await YoutubeGrabberHelper.getResource(url);
        if (!response) return false;

        const $ = cheerio.load(response.data);
        const metaTags = $('meta[name="title"]');
        return metaTags.length !== 0;
    }
}

module.exports = YoutubeGrabberHelper;