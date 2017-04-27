import Lyricist from './index';
import authKey from './test_key';

describe('Lyricist', () => {
  const lyricist = new Lyricist(authKey);

  test('initiating without an authKey should throw an error', () => {
    expect(() => {
      new Lyricist();
    }).toThrow();
  });

  test('invalid request should return 403 status and throw error', async () => {
    await expect(lyricist._request({ path: '/abc' })).toThrow();
  });

  test('successful requests should return object', async () => {
    const result = await lyricist.getSong(714198);
    expect(result).toBeInstanceOf(Object);
  });

  describe('_scrapeTracklist', () => {
    test('scrape an album tracklist and return an array of songs', async () => {
      const result = await lyricist._scrapeTracklist('http://genius.com/albums/Son-lux/Lanterns');
      expect(result).toBeInstanceOf(Array);
    });
  });

  describe('_scrapeLyrics', () => {
    test('scrape song lyrics and return text', async () => {
      const result = await lyricist._scrapeLyrics('https://genius.com/Son-lux-alternate-world-lyrics');
      expect(result).toMatch(/Alternate world/);
    });
  });

  describe('getSong', () => {
    test('throw an error if no ID is given', async (done) => {
      try {
        await lyricist.getSong();
      } catch (e) {
        expect(e.message).toEqual('No ID was provided to getSong()');
        done();
      }
    });

    test('load a song', async () => {
      const result = await lyricist.getSong(714198);
      expect(result).toHaveProperty('title');
    });

    test('include lyrics when the option is given', async () => {
      const result = await lyricist.getSong(714198, { fetchLyrics: true });
      expect(result.lyrics).toMatch(/Spirit of my silence/);
    });
  });

  describe('getAlbum', () => {
    test('throw an error if no ID is given', async (done) => {
      try {
        await lyricist.getAlbum();
      } catch (e) {
        expect(e.message).toEqual('No ID was provided to getAlbum()');
        done();
      }
    });

    test('load an album', async () => {
      const result = await lyricist.getAlbum(56682);
      expect(result).toHaveProperty('artist');
    });

    test('include tracklist when the option is given', async () => {
      const result = await lyricist.getAlbum(56682, { fetchTracklist: true });
      expect(result.tracklist).toBeInstanceOf(Array);
      expect(result.tracklist[0].title).toEqual('Alternate World');
    });
  });

  describe('getArtist', () => {
    test('throw an error if no ID is given', async (done) => {
      try {
        await lyricist.getArtist();
      } catch (e) {
        expect(e.message).toEqual('No ID was provided to getArtist()');
        done();
      }
    });

    test('load an artist', async () => {
      const result = await lyricist.getArtist(2);
      expect(result.name).toEqual('Jay Z');
    });
  })

  describe('getArtistSongs', () => {
    test('throw an error if no ID is given', async (done) => {
      try {
        await lyricist.getArtistSongs();
      } catch (e) {
        expect(e.message).toEqual('No ID was provided to getArtistSongs()');
        done();
      }
    });

    test('load artist songs', async() => {
      const result = await lyricist.getArtistSongs(2);
      expect(result[0]).toHaveProperty('title');
    });

    test('perPage option', async() => {
      const perPage = 10;
      const result = await lyricist.getArtistSongs(2, { perPage });
      expect(result.length).toEqual(perPage);
    });

    test('page option', async() => {
      const page = 2;
      const result = await lyricist.getArtistSongs(2, { page });
      expect(result.find(t => t.title === 'Addicted to the Game').id).toEqual(3129);
    });

    test('sort option', async() => {
      const sort = 'popularity'
      const result = await lyricist.getArtistSongs(2);
      const resultWithSort = await lyricist.getArtistSongs(2, { sort });
      expect(result).toBeInstanceOf(Array);
      expect(resultWithSort).toBeInstanceOf(Array);
      expect(result).not.toEqual(resultWithSort);
    });
  });
});
