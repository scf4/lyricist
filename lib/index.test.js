const Lyricist = require('./');
require('dotenv').config();

describe('Lyricist', () => {
  const lyricist = new Lyricist(process.env.TEST_KEY);

  test('initiating without an authKey should throw an error', () => {
    expect(() => {
      new Lyricist();
    }).toThrow();
  });

  test('invalid request should return 403 status and throw error', () =>
    expect(lyricist._request('abc')).rejects.toEqual(
      new Error('403: Action forbidden for current scope'),
    ));

  test('request with invalid auth key should throw a helpful error', async done => {
    const lyricist = new Lyricist("I'm an invalid auth key");
    try {
      await lyricist._request('songs/1');
    } catch (e) {
      expect(e.message).toMatch('invalid_token');
      done();
    }
  });

  test('successful requests should return object', async () => {
    const result = await lyricist._request('songs/1');
    expect(result).toBeInstanceOf(Object);
  });

  describe('_scrapeTracklist', () => {
    test('scrape an album tracklist and return an array of songs', async () => {
      const result = await lyricist._scrapeTracklist(
        'http://genius.com/albums/Son-lux/Lanterns',
      );
      expect(result).toBeInstanceOf(Array);
      expect(result.length > 0).toBeTruthy();
    });
  });

  describe('_scrapeLyrics', () => {
    test('scrape song lyrics and return text', async () => {
      const result = await lyricist._scrapeLyrics(
        'https://genius.com/Son-lux-alternate-world-lyrics',
      );
      expect(result).toMatch(/Alternate world/);
    });
  });

  describe('_geniusSlug', () => {
    test('converts a name/title to the slug used by genius.com', async () => {
      const namesAndExpectedSlugs = {
        'Kanye West': 'Kanye-west',
        'A$AP Rocky': 'A-ap-rocky',
        'Alt J': 'Alt-j',
      };
      const names = Object.keys(namesAndExpectedSlugs);
      const expectedSlugs = names.map(name => namesAndExpectedSlugs[name]);
      const slugs = names.map(lyricist._geniusSlug);
      expect(slugs).toEqual(expectedSlugs);
    });
  });

  describe('_scrapeArtistPageForArtistID', () => {
    test('scrape an artist page and return their genius ID', async () => {
      const result = await lyricist._scrapeArtistPageForArtistID('Son-lux');
      expect(result).toEqual('94423');
    });
  });

  describe('song()', () => {
    test('throw an error if no ID is given', async done => {
      try {
        await lyricist.song();
      } catch (e) {
        expect(e.message).toEqual('No ID was provided to lyricist.song()');
        done();
      }
    });

    test('load a song', async () => {
      const result = await lyricist.song(714198, {});
      expect(result).toHaveProperty('title');
    });

    test('include lyrics when the option is given', async () => {
      const result = await lyricist.song(714198, { fetchLyrics: true });
      expect(result.lyrics).toMatch(/Spirit of my silence/);
    });
  });

  describe('album()', () => {
    test('throw an error if no ID is given', async done => {
      try {
        await lyricist.album();
      } catch (e) {
        expect(e.message).toEqual('No ID was provided to lyricist.album()');
        done();
      }
    });

    test('load an album', async () => {
      const result = await lyricist.album(56682);
      expect(result).toHaveProperty('artist');
    });

    test('include tracklist when the option is given', async () => {
      const result = await lyricist.album(56682, { fetchTracklist: true });
      expect(result.tracklist).toBeInstanceOf(Array);
      expect(result.tracklist[0].title).toEqual('Alternate World');
    });
  });

  describe('artist()', () => {
    test('throw an error if no ID is given', async done => {
      try {
        await lyricist.artist();
      } catch (e) {
        expect(e.message).toEqual('No ID was provided to lyricist.artist()');
        done();
      }
    });

    test('load an artist', async () => {
      const result = await lyricist.artist(2);
      expect(result.api_path).toEqual('/artists/2');
    });
  });

  describe('artistByName()', () => {
    test('load artist by name', async () => {
      const result = await lyricist.artistByName('Son Lux');
      expect(result.api_path).toEqual('/artists/94423');
    });
  });

  describe('songsByArtist()', () => {
    test('throw an error if no ID is given', async done => {
      try {
        await lyricist.songsByArtist();
      } catch (e) {
        expect(e.message).toEqual(
          'No ID was provided to lyricist.songsByArtist()',
        );
        done();
      }
    });

    test('load artist songs', async () => {
      const result = await lyricist.songsByArtist(2);
      expect(result[0]).toHaveProperty('title');
    });

    test('perPage option', async () => {
      const perPage = 10;
      const result = await lyricist.songsByArtist(2, { perPage });
      expect(result.length).toEqual(perPage);
    });

    test('page option', async () => {
      const page = 2;
      const result = await lyricist.songsByArtist(2, { page });
      expect(result.find(t => t.title === 'Addicted to the Game').id).toEqual(
        3129,
      );
    });

    test('sort option', async () => {
      const sort = 'popularity';
      const result = await lyricist.songsByArtist(2);
      const resultWithSort = await lyricist.songsByArtist(2, { sort });
      expect(result).toBeInstanceOf(Array);
      expect(resultWithSort).toBeInstanceOf(Array);
      expect(result).not.toEqual(resultWithSort);
    });
  });

  describe('search()', () => {
    test('throw an error if no search term is given', async done => {
      try {
        await lyricist.search();
      } catch (e) {
        expect(e.message).toEqual('No query was provided to lyricist.search()');
        done();
      }
    });

    test('return search results', async () => {
      const result = await lyricist.search(
        'spirit of my silence I can hear you',
      );
      expect(result[0].primary_artist.name).toEqual('Sufjan Stevens');
    });
  });
});
