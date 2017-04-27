import fetch from 'node-fetch';
import cheerio from 'cheerio';

export default class Lyricist {
  constructor(accessToken) {
    if (!accessToken) throw new Error('No access token provided!');
  	this.accessToken = accessToken;
  }

  /*
  Main request function
  */

  async _request(path) {
    const url = `https://api.genius.com/${path}`;
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${this.accessToken}` }
    });
    const json = await response.text();
    const parsed = JSON.parse(json);
    if (parsed.meta.status !== 200) {
      // throw new Error(parsed.meta.status);
    }
    return parsed.response;
  }

  /*
  Search song by ID
  */

  async song(id, opts) {
    if (!id) throw new Error('No ID was provided to lyricist.song()');

    const path = `songs/${id}`;
    const response = await this._request(path);
    const song = response.song;

    let lyrics = null;
    if (opts && opts.fetchLyrics)
      lyrics = await this._scrapeLyrics(song.url);

    return Object.assign({ lyrics }, song);
  }

  /*
  Get album by ID
  */

  async album(id, opts) {
    if (!id) throw new Error('No ID was provided to lyricist.album()');

    const path = `albums/${id}`;
    const response = await this._request(path);
    const album = response.album;

    let tracklist = null;
    if (opts && opts.fetchTracklist)
      tracklist = await this._scrapeTracklist(album.url);

    return Object.assign({ tracklist }, album);
  }

  /* Get artist */

  async artist(id, opts) {
    if (!id) throw new Error('No ID was provided to lyricist.artist()');

    const path = `artists/${id}`;
    const response = await this._request(path);
    return response.artist;
  }

  /* Get artist songs */

  async songsByArtist(id, opts) {
    if (!id) throw new Error('No ID was provided to lyricist.songsByArtist()');
    const page = opts && opts.page || 1;
    const perPage = opts && opts.perPage || 20;
    const sort = opts && opts.sort || 'title';


    const path = `artists/${id}/songs?per_page=${perPage}&page=${page}&sort=${sort}`;
    const response = await this._request(path);
    const songs = response.songs;

    return songs;
  }

  async search(query, opts) {
    if (!query) throw new Error('No search query was provided to lyricist.search()');
    const path = `search?q=${query}`;
    const response = await this._request(path);
    return response.hits.map(hit => hit.result);
  }

  /*
  Scrape tracklist
  */

  async _scrapeTracklist(url) {
    const response = await fetch(url);
    const text = await response.text();
    const $ = cheerio.load(text);
    const songs = $('.primary_list li').map((i, el) => ({
      id: $(el).data('id'),
      title: $(el).find('.song_title').text(),
    }));
    return songs.toArray();
  }

  /* Scrape song lyrics */

  async _scrapeLyrics(url) {
    const response = await fetch(url);
    const text = await response.text();
    const $ = cheerio.load(text);
    return $('.lyrics').text().trim();
  }
}
