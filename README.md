# Lyricist 🎤
⭐️ Genius.com API client with lyrics scraper

## v2.0

Version 2.0 is a complete rewrite with async/await.

## Installation
```
yarn add lyricist
```

or

```
npm install lyricist --save
```

## Node <= 6
Older versions of node don't support async/await and will need to use the transpiled version (lyricist/node6), along with promises:
```js
const Lyricist = require('lyricist/node6');
```

## API Key
Get an access token at https://genius.com/api-clients.

```js
const lyricist = new Lyricist(accessToken);
```

## Look up a song
Use `song()` to fetch a song by ID:
```js
const song = await lyricist.song(714198);
console.log(song.title);

// output: Death with Dignity
```

#### or with promises for node <= 6:
```js
lyricist.song(714198).then(song => console.log(song.title));
```

## Set text_format
The Genius API lets you specify how the response text is formatted. Supported formatting options are `dom` (default), `plain` and `html`. See https://docs.genius.com/#/response-format-h1 for further information. The `textFormat` option is supported by `song()`, `album()` and `artist()`.
```js
lyricist.song(714198, { textFormat: 'html' }).then(song => console.log(song.description.html));

// output: <p>The first track off of Sufjan’s 2015 album...
```

## Get song lyrics
The Genius API doesn't offer lyrics, but Lyricist can scrape Genius.com for you. Simply provide the `fetchLyrics` option like this:
```js
const song = await lyricist.song(714198, { fetchLyrics: true });
console.log(song.lyrics);

// output: Spirit of my silence I can hear you...
```
## Look up an album

Use `album()` to look up an album by ID. The Genius API doesn't allow you to search an album by title, but song() will return an `album.id`:

```js
const album = await lyricist.album(56682);
console.log(`${album.name} by ${album.artist.name}`);

// output: Lanterns by Son Lux
```

## Get an album's tracklist
The Genius API doesn't provide tracklists, but Lyricist can scrape Genius.com and return the tracklist for you. Simply provide the `fetchTracklist` option like this:

```js
const album = await lyricist.album(56682, { fetchTracklist: true });
console.log(album.songs);

// output: [{ id: 502102, title: 'Alternate World', ... }, { id: 267773, title: 'Lost It To Trying', ... }, ...]

```
## Look up an artist
Use `artist()` to look up an artist by ID:
```js
const artist = await lyricist.artist(2);
console.log(artist.name);
// output: Jay Z
```

## Get songs by an artist
Use `songsByArtist()` to list an artist's songs. Example usage:
```js
const songs = await lyricist.songsByArtist(2);
```
`songsByArtist()` will show  **20 results per page** by default, and can be as high as 50.

You can provide options as a second parameter. The available options are:

* `perPage`: Number (default: 20)
* `page`: Number (default: 1)
* `sort` String: 'title' or 'popularity' (default: 'title')

Example:
```js
const songs = await lyricist.songsByArtist(2, { page: 2, perPage: 50 });
```

## Warning ⚠️
Take care when fetching lyrics. This feature isn't officially supported by the Genius API, so use caching and rate-limit your app's requests as much as possible.

## Genius API Docs

Check the [Genius.com API docs](https://docs.genius.com) for more info.
