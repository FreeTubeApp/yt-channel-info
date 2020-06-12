const mocha = require('mocha');
const chai = require('chai');
const expect = chai.expect;

const YoutubeGrabber = require('../index');
const YoutubeGrabberValidation = require('../app/validation');

describe('URL validation', () => {
    it('URL is valid. Should return true', () => {
        const urlValidationStatus = YoutubeGrabber.isYoutubeURLValid(`https://www.youtube.com/channel/UCsBjURrPoezykLs9EqgamOA`);
        expect(urlValidationStatus).to.equal(true);
    });

    it('URL is not URL but contains right resource. Should return false', () => {
        const urlValidationStatus = YoutubeGrabber.isYoutubeURLValid(`youtube/\/\/\/\\/\/\//channel/////\/\/\/\/\\/UCsBjURrPoezykLs9EqgamOA`);
        expect(urlValidationStatus).to.equal(false);
    });

    it('URL is not contains youtube. Should return false', () => {
        const urlValidationStatus = YoutubeGrabber.isYoutubeURLValid(`https://www.test.com/user/dotconferences`);
        expect(urlValidationStatus).to.equal(false);
    });

    it('URL is empty. Should return false', () => {
        const urlValidationStatus = YoutubeGrabber.isYoutubeURLValid('');
        expect(urlValidationStatus).to.equal(false);
    });

    describe('URL validation by resource', () => {
        it('URL with channel resource. Should return true', () => {
            const urlValidationStatus = YoutubeGrabber.isYoutubeURLValid(`https://www.youtube.com/channel/UCsBjURrPoezykLs9EqgamOA`);
            expect(urlValidationStatus).to.equal(true);
        });

        it('URL with user resource. Should return true', () => {
            const urlValidationStatus = YoutubeGrabber.isYoutubeURLValid(`https://www.youtube.com/user/dotconferences`);
            expect(urlValidationStatus).to.equal(true);
        });

        it('URL with playlist resource. Should return true', () => {
            const urlValidationStatus = YoutubeGrabber.isYoutubeURLValid(`https://www.youtube.com/playlist?list=PLMW8Xq7bXrG7LL-bLSweRFmFw7y2HhypC`);
            expect(urlValidationStatus).to.equal(true);
        });

        it('URL with video resource. Should return true', () => {
            const urlValidationStatus = YoutubeGrabber.isYoutubeURLValid(`https://www.youtube.com/watch?v=ET4kT88JRXs`);
            expect(urlValidationStatus).to.equal(true);
        });

        it('URL with wrong resource. Should return false', () => {
            const urlValidationStatus = YoutubeGrabber.isYoutubeURLValid(`https://www.youtube.com/test/dotconferences`);
            expect(urlValidationStatus).to.equal(false);
        });
    });
});

describe('Type of resource validation', () => {
    it('URL is channel resource (user). Should return "channel" string', () => {
        const type = YoutubeGrabber.getTypeOfResource(`https://www.youtube.com/user/dotconferences`);
        expect(type).to.equal('channel');
    });

    it('URL is channel resource (channel). Should return "channel" string', () => {
        const type = YoutubeGrabber.getTypeOfResource(`https://www.youtube.com/channel/UCsBjURrPoezykLs9EqgamOA`);
        expect(type).to.equal('channel');
    });

    it('URL is playlist resource. Should return "playlist" string', () => {
        const type = YoutubeGrabber.getTypeOfResource(`https://www.youtube.com/playlist?list=PLMW8Xq7bXrG7LL-bLSweRFmFw7y2HhypC`);
        expect(type).to.equal('playlist');
    });

    it('URL is video resource. Should return "video" string', () => {
        const type = YoutubeGrabber.getTypeOfResource(`https://www.youtube.com/watch?v=ET4kT88JRXs`);
        expect(type).to.equal('video');
    });

    it('URL is wrong resource. Should return null', () => {
        const type = YoutubeGrabber.getTypeOfResource(`https://www.youtube.com/test-wrong-resource/UCsBjURrPoezykLs9EqgamOA`);
        expect(type).to.equal(null);
    });
});

describe('Existence of a resource', () => {
    describe('Channel or user', () => {
        it('URL is channel and exists. Should return true.', async () => {
            const existenceStatus = await YoutubeGrabber.isResourceExists(`https://www.youtube.com/channel/UCsBjURrPoezykLs9EqgamOA`);
            expect(existenceStatus).to.equal(true);
        });

        it('URL is channel and does not exist. Should return false.', async () => {
            const existenceStatus = await YoutubeGrabber.isResourceExists(`https://www.youtube.com/channel/`);
            expect(existenceStatus).to.equal(false);
        });

        it('URL is user and exists. Should return true.', async () => {
            const existenceStatus = await YoutubeGrabber.isResourceExists(`https://www.youtube.com/user/dotconferences`);
            expect(existenceStatus).to.equal(true);
        });

        it('URL is user and does not exist. Should return false.', async () => {
            const existenceStatus = await YoutubeGrabber.isResourceExists(`https://www.youtube.com/user/`);
            expect(existenceStatus).to.equal(false);
        });
    });

    describe('Playlist', () => {
        it('URL is playlist and exists. Should return true.', async () => {
            const existenceStatus = await YoutubeGrabber.isResourceExists(`https://www.youtube.com/playlist?list=PLMW8Xq7bXrG7LL-bLSweRFmFw7y2HhypC`);
            expect(existenceStatus).to.equal(true);
        });

        it('URL is playlist and does not exist. Should return false.', async () => {
            const existenceStatus = await YoutubeGrabber.isResourceExists(`https://www.youtube.com/playlist?list=`);
            expect(existenceStatus).to.equal(false);
        });
    });

    describe('Video', () => {
        it('URL is video and exists. Should return true.', async () => {
            const existenceStatus = await YoutubeGrabber.isResourceExists(`https://www.youtube.com/watch?v=ET4kT88JRXs`);
            expect(existenceStatus).to.equal(true);
        });

        it('URL is video and does not exist. Should return false.', async () => {
            const existenceStatus = await YoutubeGrabber.isResourceExists(`https://www.youtube.com/watch?v=ET4kT88JRXs`);
            expect(existenceStatus).to.equal(true);
        });
    });
});

describe('Channel id or username parse', () => {
    it('Channel URL. Should return the id of channel', () => {
        const id = `UCsBjURrPoezykLs9EqgamOA`;
        const idParsed = YoutubeGrabberValidation.getChannelIdOrUser(`https://www.youtube.com/channel/${id}`);
        expect(idParsed).to.equal(id);
    });

    it('Channel URL with trash after link. Should return the id of channel', () => {
        const id = `UCsBjURrPoezykLs9EqgamOA`;
        const idParsed = YoutubeGrabberValidation.getChannelIdOrUser(`https://www.youtube.com/channel/${id}///asdasd/asdasdasd/fdfsdg/channel/asd`);
        expect(idParsed).to.equal(id);
    });

    it('Channel URL with separator. Should return the id of channel', () => {
        const id = `UCWl46j4jtT_I4cbS6KbhGmw`;
        const idParsed = YoutubeGrabberValidation.getChannelIdOrUser(`https://www.youtube.com/channel/${id}`);
        expect(idParsed).to.equal(id);
    });

    it('User URL. Should return the user name of channel', () => {
        const name = `dotconferences`;
        const nameParsed = YoutubeGrabberValidation.getChannelIdOrUser(`https://www.youtube.com/user/${name}`);
        expect(nameParsed).to.equal(name);
    });

    it('User URL with trash after link. Should return the name of channel', () => {
        const name = `dotconferences`;
        const nameParsed = YoutubeGrabberValidation.getChannelIdOrUser(`https://www.youtube.com/user/${name}/\/asdda/user/aaa`);
        expect(nameParsed).to.equal(name);
    });

    it('URL with channelId, but w/o channel. Should return null', () => {
        const id = `UCsBjURrPoezykLs9EqgamOA`;
        const idParsed = YoutubeGrabberValidation.getChannelIdOrUser(`https://www.youtube.com/${id}`);
        expect(idParsed).to.equal(null);
    });

    it(`Empty URL. Should return null`, () => {
        const idParsed = YoutubeGrabberValidation.getChannelIdOrUser(``);
        expect(idParsed).to.equal(null);
    });
});