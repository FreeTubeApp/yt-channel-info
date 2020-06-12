const mocha = require('mocha');
const chai = require('chai');
const expect = chai.expect;
const fs = require('fs');

const YoutubeGrabber = require('../../');

describe('Getting channel info', () => {
    describe('Basic information', () => {
        it('Public channel. Should return basic info: { error: {}, info: { id, title, avatarURL, subscriberCount, isConfirmed, description } }', async () => {
            const channelInfo = await YoutubeGrabber.getChannelInfo(`https://www.youtube.com/channel/UCsBjURrPoezykLs9EqgamOA`);
            expect(channelInfo).to.be.an('object');

            expect(channelInfo).to.have.property('error');
            expect(channelInfo.error).to.have.property('status');
            expect(channelInfo.error.status).to.equal(false);

            expect(channelInfo).to.have.property('info');
            expect(channelInfo.info).to.have.property('id');
            expect(channelInfo.info.id).to.be.a('string');

            expect(channelInfo.info).to.have.property('title');
            expect(channelInfo.info.title).to.be.a('string');

            expect(channelInfo.info).to.have.property('avatarURL');
            expect(channelInfo.info.avatarURL).to.be.a('string');

            expect(channelInfo.info).to.have.property('subscriberCount');
            expect(channelInfo.info.subscriberCount).to.be.a('number');

            expect(channelInfo.info).to.have.property('isConfirmed');
            expect(channelInfo.info.isConfirmed).to.be.a('boolean');

            expect(channelInfo.info).to.have.property('description');
            expect(channelInfo.info.description).to.be.a('string');
        });

        it('Blocked channel. Should return the channel object with error { error: { status, reason }, info: null }', async () => {
            const channelInfo = await YoutubeGrabber.getChannelInfo(`https://www.youtube.com/channel/UCOJhTUTRcGjPYTcD-GVOyCA`);
            expect(channelInfo).to.be.an('object');

            expect(channelInfo).to.have.property('error');
            expect(channelInfo.error).to.have.property('status');
            expect(channelInfo.error.status).to.equal(true);

            expect(channelInfo.error).to.have.property('reason');
            expect(channelInfo.error.reason).to.be.a('string');

            expect(channelInfo).to.have.property('info');
            expect(channelInfo.info).to.equal(null);
        });

        it('Not existing channel. Should return channel object with error { error: { status, reason }, info: null }', async () => {
            const channelInfo = await YoutubeGrabber.getChannelInfo(`https://www.youtube.com/channel/`);
            expect(channelInfo).to.be.an('object');

            expect(channelInfo).to.have.property('error');
            expect(channelInfo.error).to.have.property('status');
            expect(channelInfo.error.status).to.equal(true);

            expect(channelInfo.error).to.have.property('reason');
            expect(channelInfo.error.reason).to.be.a('string');

            expect(channelInfo).to.have.property('info');
            expect(channelInfo.info).to.equal(null);
        });

        it('Public channel with private subscribers_count. Property subscriberCount should be equal to false.', async () => {
            const channelInfo = await YoutubeGrabber.getChannelInfo(`https://www.youtube.com/channel/UCemb7r7IyrvY-AFPqsDjs7w`);
            expect(channelInfo).to.be.an('object');

            expect(channelInfo).to.have.property('error');
            expect(channelInfo.error).to.have.property('status');
            expect(channelInfo.error.status).to.equal(false);

            expect(channelInfo).to.have.property('info');
            expect(channelInfo.info).to.have.property('id');
            expect(channelInfo.info.id).to.be.a('string');

            expect(channelInfo.info).to.have.property('title');
            expect(channelInfo.info.title).to.be.a('string');

            expect(channelInfo.info).to.have.property('avatarURL');
            expect(channelInfo.info.avatarURL).to.be.a('string');

            expect(channelInfo.info).to.have.property('subscriberCount');
            expect(channelInfo.info.subscriberCount).to.be.a('boolean');
            expect(channelInfo.info.subscriberCount).to.equal(false);

            expect(channelInfo.info).to.have.property('isConfirmed');
            expect(channelInfo.info.isConfirmed).to.be.a('boolean');

            expect(channelInfo.info).to.have.property('description');
            expect(channelInfo.info.description).to.be.a('string');
        });
    });

    describe('Videos', () => {
        it('Public channel with videos. Should return basic channel info with videos array (not empty)', async () => {
            const channelInfo = await YoutubeGrabber.getChannelInfo(`https://www.youtube.com/channel/UCsBjURrPoezykLs9EqgamOA`, {
                videos: true
            });
            expect(channelInfo).to.be.an('object');

            expect(channelInfo).to.have.property('error');
            expect(channelInfo.error).to.have.property('status');
            expect(channelInfo.error.status).to.equal(false);

            expect(channelInfo).to.have.property('info');
            expect(channelInfo.info).to.have.property('id');
            expect(channelInfo.info.id).to.be.a('string');

            expect(channelInfo.info).to.have.property('title');
            expect(channelInfo.info.title).to.be.a('string');

            expect(channelInfo.info).to.have.property('avatarURL');
            expect(channelInfo.info.avatarURL).to.be.a('string');

            expect(channelInfo.info).to.have.property('subscriberCount');
            expect(channelInfo.info.subscriberCount).to.be.a('number');

            expect(channelInfo.info).to.have.property('isConfirmed');
            expect(channelInfo.info.isConfirmed).to.be.a('boolean');

            expect(channelInfo.info).to.have.property('description');
            expect(channelInfo.info.description).to.be.a('string');

            expect(channelInfo.info.videos).to.be.an('array');
            expect(channelInfo.info.videos.length).to.be.above(0);
        });

        it('Public channel w/o videos. Should return basic channel info with 0 len videos array', async () => {
            const channelInfo = await YoutubeGrabber.getChannelInfo(`https://www.youtube.com/channel/UCWl46j4jtT_I4cbS6KbhGmw`, {
                videos: true
            });
            expect(channelInfo).to.be.an('object');

            expect(channelInfo).to.have.property('error');
            expect(channelInfo.error).to.have.property('status');
            expect(channelInfo.error.status).to.equal(false);

            expect(channelInfo).to.have.property('info');
            expect(channelInfo.info).to.have.property('id');
            expect(channelInfo.info.id).to.be.a('string');

            expect(channelInfo.info).to.have.property('title');
            expect(channelInfo.info.title).to.be.a('string');

            expect(channelInfo.info).to.have.property('avatarURL');
            expect(channelInfo.info.avatarURL).to.be.a('string');

            expect(channelInfo.info).to.have.property('subscriberCount');
            expect(channelInfo.info.subscriberCount).to.be.a('boolean');

            expect(channelInfo.info).to.have.property('isConfirmed');
            expect(channelInfo.info.isConfirmed).to.be.a('boolean');

            expect(channelInfo.info).to.have.property('description');
            expect(channelInfo.info.description).to.be.a('string');

            expect(channelInfo.info.videos).to.be.an('array');
            expect(channelInfo.info.videos.length).to.be.equal(0);
        });
    });

    describe('Playlists', () => {
        describe('Public channel with public playlists', () => {
            let channelInfo;

            it ('Should return basic info with playlists array non empty', async () => {
                channelInfo = await YoutubeGrabber.getChannelInfo(`https://www.youtube.com/channel/UCMO51vS4kaOSLqBD9bmZGIg`, {
                    playlists: true
                });
                expect(channelInfo).to.be.an('object');

                expect(channelInfo).to.have.property('error');
                expect(channelInfo.error).to.have.property('status');
                expect(channelInfo.error.status).to.equal(false);

                expect(channelInfo).to.have.property('info');
                expect(channelInfo.info).to.have.property('id');
                expect(channelInfo.info.id).to.be.a('string');

                expect(channelInfo.info).to.have.property('title');
                expect(channelInfo.info.title).to.be.a('string');

                expect(channelInfo.info).to.have.property('avatarURL');
                expect(channelInfo.info.avatarURL).to.be.a('string');

                expect(channelInfo.info).to.have.property('subscriberCount');
                expect(channelInfo.info.subscriberCount).to.be.a('number');

                expect(channelInfo.info).to.have.property('isConfirmed');
                expect(channelInfo.info.isConfirmed).to.be.a('boolean');

                expect(channelInfo.info).to.have.property('description');
                expect(channelInfo.info.description).to.be.a('string');

                expect(channelInfo.info.playlists).to.be.an('array');
                expect(channelInfo.info.playlists.length).to.be.above(0);
            });

            it ('Valid playlists. Array must include the valid playlist info {id, url, title, thumbnail, videoCount}', () => {
                let foundNotValid = false;
                for (let i = 0; i < channelInfo.info.playlists.length; i++) {
                    const playlist = channelInfo.info.playlists[i];
                    if (!((playlist.url && typeof playlist.url === 'string') &&
                        (playlist.videosCount && typeof playlist.videosCount === 'number') &&
                        (playlist.thumbnail && typeof playlist.thumbnail === 'string') &&
                        (playlist.title && typeof playlist.title === 'string') &&
                        (playlist.id && typeof playlist.id === 'string'))
                    ) {
                        foundNotValid = true;
                        break;
                    }

                }

                expect(foundNotValid).to.equal(false);
            });
        });

        it('Public channel w/o playlists. Should return basic info with playlists array empty', async () => {
            const channelInfo = await YoutubeGrabber.getChannelInfo(`https://www.youtube.com/channel/UCWl46j4jtT_I4cbS6KbhGmw`, {
                playlists: true
            });
            expect(channelInfo).to.be.an('object');

            expect(channelInfo).to.have.property('error');
            expect(channelInfo.error).to.have.property('status');
            expect(channelInfo.error.status).to.equal(false);

            expect(channelInfo).to.have.property('info');
            expect(channelInfo.info).to.have.property('id');
            expect(channelInfo.info.id).to.be.a('string');

            expect(channelInfo.info).to.have.property('title');
            expect(channelInfo.info.title).to.be.a('string');

            expect(channelInfo.info).to.have.property('avatarURL');
            expect(channelInfo.info.avatarURL).to.be.a('string');

            expect(channelInfo.info).to.have.property('subscriberCount');
            expect(channelInfo.info.subscriberCount).to.be.a('boolean');

            expect(channelInfo.info).to.have.property('isConfirmed');
            expect(channelInfo.info.isConfirmed).to.be.a('boolean');

            expect(channelInfo.info).to.have.property('description');
            expect(channelInfo.info.description).to.be.a('string');

            expect(channelInfo.info.playlists).to.be.an('array');
            expect(channelInfo.info.playlists.length).to.be.equal(0);
        });
    });
});