# Lyricist 🎤
⭐️ Genius.com API client with lyric scraping

## Installation
```
yarn add lyricist
```

or

```
npm install lyricist
```

## API Key
Get an access token at https://genius.com/api-clients

```js
const lyricist = new Lyricist(accessToken);
```

## Look up a song by ID
Use `song()` to fetch a song by ID:
```js
const song = await lyricist.song(714198);
console.log(song.title);

// output: Death with Dignity
```

#### or with promises
```js
lyricist.song(714198).then(song => console.log(song.title));
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

## Search songs by artist name/title
Use `search()` to search for songs:
```js
const songs = await lyricist.search('Virtual Insanity - Jamiroquai');
console.log(songs);

/* output: (Array of all matching songs)
[
  {
    annotation_count: 1,
    api_path: '/songs/1952220',
    full_title: 'Virtual insanity - remastered by Jamiroquai',
    header_image_thumbnail_url: 'https://images.genius.com/cd9bd5e1d6d23c9a8b044843831d4b3c.300x300x1.png',
    header_image_url: 'https://images.genius.com/cd9bd5e1d6d23c9a8b044843831d4b3c.820x820x1.png',
    id: 1952220,
    ...
  },
  ...
]
*/
```

## Set text_format
The Genius API lets you specify how the response text is formatted. Supported formatting options are `dom` (default), `plain` and `html`. See https://docs.genius.com/#/response-format-h1 for further information. The `textFormat` option is supported by `song()`, `album()` and `artist()`.
```js
const song = lyricist.song(714198, { textFormat: 'html' });
console.log(song.description.html);

// output: <p>The first track off of Sufjan’s 2015 album...
```

## Warning ⚠️
Take care when fetching lyrics. This feature isn't officially supported by the Genius API, so use caching and rate-limit your app's requests as much as possible.

## Node 6
Node 6 doesn't support async/await and will need to use the transpiled version (lyricist/node6) along with promises:
```js
const Lyricist = require('lyricist/node6');
```

> Future updates will likely remove this support for old versions of Node

## Genius API Docs

Check the [Genius.com API docs](https://docs.genius.com) for more info.
