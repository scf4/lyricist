const fetch = require('node-fetch');
const cheerio = require('cheerio');

module.exports = class Lyricist {
  constructor(accessToken) {
    if (!accessToken) throw new Error('No access token provided to lyricist!');
    this.accessToken = accessToken;
  }

  /*
  Main request function
  */

  async _request(path) {
    const url = `https://api.genius.com/${path}`;
    const headers = {
      'Authorization': `Bearer ${this.accessToken}`,
    };
    const { meta, response } = await fetch(url, { headers })
      .then(response => response.json());

    if (meta.status !== 200) {
      throw new Error(`${meta.status}: ${meta.message}`);
    }
    return response;
  }

  /*
  Search song by ID
  */

  async song(id, { fetchLyrics = 123 } = {}) {
    if (!id) throw new Error('No ID was provided to lyricist.song()');

    const { song } = await this._request(`songs/${id}`);

    const lyrics = fetchLyrics ? await this._scrapeLyrics(song.url) : null;

    return Object.assign({ lyrics }, song);
  }

  /*
  Get album by ID
  */

  async album(id, { fetchTracklist = false } = {}) {
    if (!id) throw new Error('No ID was provided to lyricist.album()');

    const { album } = await this._request(`albums/${id}`);

    const tracklist = fetchTracklist ? await this._scrapeTracklist(album.url) : null;

    return Object.assign({ tracklist }, album);
  }

  /* Get artist */

  async artist(id, opts) {
    if (!id) throw new Error('No ID was provided to lyricist.artist()');
    const { artist } = await this._request(`artists/${id}`);
    return artist;
  }

  /* Get artist songs */

  async songsByArtist(id, { page = 1, perPage = 20, sort = 'title' } = {}) {
    if (!id) throw new Error('No ID was provided to lyricist.songsByArtist()');
    const { songs } = await this._request(
      `artists/${id}/songs?per_page=${perPage}&page=${page}&sort=${sort}`
    );
    return songs;
  }

  async search(query) {
    if (!query) throw new Error('No query was provided to lyricist.search()');
    const response = await this._request(`search?q=${query}`);
    return response.hits.map(hit => hit.result);
  }

  /*
  Scrape tracklist
  */

  async _scrapeTracklist(url) {
    const html = await fetch(url).then(res => res.text());
    const $ = cheerio.load(html);
    const json = $('meta[itemprop="page_data"]').attr('content');
    const parsed = JSON.parse(json);
    const songs = parsed.album_appearances;
    return songs.map(({ song, track_number }) =>
      Object.assign({ track_number }, song)
    );
  }

  /* Scrape song lyrics */

  async _scrapeLyrics(url) {
    const response = await fetch(url);
    const text = await response.text();
    const $ = cheerio.load(text);
    return $('.lyrics').text().trim();
  }
}
