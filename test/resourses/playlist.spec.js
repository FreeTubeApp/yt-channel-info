const mocha = require('mocha');
const chai = require('chai');
const expect = chai.expect;
const fs = require('fs');

const YoutubeGrabber = require('../../');

describe('Getting playlist info', () => {
    describe('Basic information', () => {
        it('Public playlist. Should return basic playlist info {error: {}, info: {id, title, videosCount, views, thumbnail, channel}}', async () => {
            const id = 'PLfMzBWSH11xaZvhv1X5Fq1H-oMdnAtG6k';
            const playlistInfo = await YoutubeGrabber.getPlaylistInfo(`https://www.youtube.com/playlist?list=${id}`);
            
            expect(playlistInfo).to.be.an('object');
            expect(playlistInfo).to.have.property('error');
            expect(playlistInfo.error).to.have.property('status');
            expect(playlistInfo.error.status).to.equal(false);

            expect(playlistInfo).to.have.property('info');
            expect(playlistInfo.info).to.have.property('id');
            expect(playlistInfo.info.id).to.be.a('string');
            expect(playlistInfo.info.id).to.be.equal(id);

            expect(playlistInfo.info).to.have.property('title');
            expect(playlistInfo.info.title).to.be.a('string');

            expect(playlistInfo.info).to.have.property('playlistImage');
            expect(playlistInfo.info.playlistImage).to.be.a('string');

            expect(playlistInfo.info).to.have.property('channel').that.has.all.keys('url', 'name');
            expect(playlistInfo.info.channel.url).to.be.a('string');
            expect(playlistInfo.info.channel.name).to.be.a('string');

            expect(playlistInfo.info).to.have.property('views');
            expect(playlistInfo.info.views).to.be.a('number');

            expect(playlistInfo.info).to.have.property('videos');
            expect(playlistInfo.info.videos.count).to.be.a('number');
            expect(playlistInfo.info.videos.array).to.be.an('array').and.has.length(playlistInfo.info.videos.count);
            
        });

        it('Private playlist. Should return error object with reason', async () => {
            const id = 'PLJWMNbdQCkFcwyNKLqntmJga-KkbdaVghl';
            const playlistInfo = await YoutubeGrabber.getPlaylistInfo(`https://www.youtube.com/playlist?list=${id}`);
            expect(playlistInfo).to.be.an('object');
            expect(playlistInfo).to.have.property('error');
            expect(playlistInfo.error).to.have.property('status');
            expect(playlistInfo.error).to.have.property('reason');
            expect(playlistInfo.error.status).to.equal(true);
            expect(playlistInfo.error.reason).to.be.a('string');

            expect(playlistInfo).to.have.property('info');
            expect(playlistInfo.info).to.be.equal(null);
        });

        it('Not existing playlist. Should return error object with reason', async () => {
            const playlistInfo = await YoutubeGrabber.getPlaylistInfo(`https://www.youtube.com/playlist?list=test-grabber`);
            expect(playlistInfo).to.be.an('object');
            expect(playlistInfo).to.have.property('error');
            expect(playlistInfo.error).to.have.property('status');
            expect(playlistInfo.error).to.have.property('reason');
            expect(playlistInfo.error.status).to.equal(true);
            expect(playlistInfo.error.reason).to.be.a('string');

            expect(playlistInfo).to.have.property('info');
            expect(playlistInfo.info).to.be.equal(null);
        });
    });

    describe('Config testing', () => {
        it('Public playlist with all videos. Should return basic info with all video info', async () => {

        });

        it('Public playlist with channel info. Should return basic info with additional channel info', async () => {

        });
    });
});