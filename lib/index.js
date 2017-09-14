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
      Authorization: `Bearer ${this.accessToken}`,
    };

    // Fetch result and parse it as JSON
    const body = await fetch(url, { headers });
    const result = await body.json();

    // Handle errors
    if (result.error)
      throw new Error(`${result.error}: ${result.error_description}`);
    if (result.meta.status !== 200)
      throw new Error(`${result.meta.status}: ${result.meta.message}`);

    return result.response;
  }

  /*
  Get song by ID
  */

  async song(id, { fetchLyrics = false, textFormat = 'dom' } = {}) {
    if (!id) throw new Error('No ID was provided to lyricist.song()');

    const path = `songs/${id}?text_format=${textFormat}`;
    const { song } = await this._request(path);

    const lyrics = fetchLyrics ? await this._scrapeLyrics(song.url) : null;

    return Object.assign({ lyrics }, song);
  }

  /*
  Get album by ID
  */

  async album(id, { fetchTracklist = false, textFormat = 'dom' } = {}) {
    if (!id) throw new Error('No ID was provided to lyricist.album()');

    const path = `albums/${id}?text_format=${textFormat}`;
    const { album } = await this._request(path);

    const tracklist = fetchTracklist
      ? await this._scrapeTracklist(album.url)
      : null;

    return Object.assign({ tracklist }, album);
  }

  /* Get artist by ID */

  async artist(id, { textFormat = 'dom' } = {}) {
    if (!id) throw new Error('No ID was provided to lyricist.artist()');

    const path = `artists/${id}?text_format=${textFormat}`;
    const { artist } = await this._request(path);
    return artist;
  }

  /*
    Get artist by exact name (undocumented, likely to change)
    Potentially unreliable, use at own risk! ⚠️
  */

  async artistByName(name, opts) {
    const slug = this._geniusSlug(name);
    const id = await this._scrapeArtistPageForArtistID(slug);
    return this.artist(id, opts);
  }

  /* Get artist songs */

  async songsByArtist(id, { page = 1, perPage = 20, sort = 'title' } = {}) {
    if (!id) throw new Error('No ID was provided to lyricist.songsByArtist()');

    const path = `artists/${id}/songs?per_page=${perPage}&page=${page}&sort=${sort}`;
    const { songs } = await this._request(path);

    return songs;
  }

  /* Search (for songs) */

  async search(query) {
    if (!query) throw new Error('No query was provided to lyricist.search()');

    const path = `search?q=${query}`;
    const response = await this._request(path);

    return response.hits.map(hit => hit.result);
  }

  /* Scrape tracklist */

  async _scrapeTracklist(url) {
    const html = await fetch(url).then(res => res.text());
    const $ = cheerio.load(html);
    const json = $('meta[itemprop="page_data"]').attr('content');
    const parsed = JSON.parse(json);
    const songs = parsed.album_appearances;
    return songs.map(({ song, track_number }) =>
      Object.assign({ track_number }, song),
    );
  }

  /* Scrape song lyrics */

  async _scrapeLyrics(url) {
    const response = await fetch(url);
    const text = await response.text();
    const $ = cheerio.load(text);
    return $('.lyrics')
      .text()
      .trim();
  }

  /* Get slug from name/title */

  _geniusSlug(string) {
    // Probably not 100% accurate yet
    // Currently only used by undocumented artistByName function
    const slug = string
      .trim()
      .replace(/\s+/g, '-')
      .replace("'", '')
      .replace(/[^a-zA-Z0-9]/g, '-')
      .toLowerCase();
    // Uppercase first letter
    return slug.charAt(0).toUpperCase() + slug.slice(1);
  }

  /* Scrape artist page to retrieve artist ID */

  async _scrapeArtistPageForArtistID(slug) {
    const url = `https://genius.com/artists/${slug}`;
    const html = await fetch(url).then(res => res.text());
    const $ = cheerio.load(html);
    const id = $('meta[name="newrelic-resource-path"]')
      .attr('content')
      .split('/')
      .pop();
    return id;
  }
};
