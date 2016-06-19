# lyricist

Fetches song lyrics using the Genius.com API and website. Uses the [node-genius](https://github.com/alexbooker/node-genius) client.

## Installation
```
$ npm install --save lyricist
```

## API Key
Get an API key at https://genius.com/api-clients.
```js
var lyricist = require('lyricist')(api_key);
```
## Look up a song
Use `song()` to fetch a single song:
```js
lyricist.song(714198, function (err, song) {
  console.log(song.lyrics);
});
```
```js
//output: Spirit of my silence I can [...] never see us again
```
You can also search by keywords, including lyrics:
```js
lyricist.song({search: "spirit of my silence I can hear you"}, function (err, song) {
  console.log("%s - %s", song.primary_artist.name, song.title);
});
```
```js
//output: Sufjan Stevens - Death with Dignity
```
or by artist/title:
```js
lyricist.song({search: "Kanye West Famous"}, function (err, song) {
  console.log("%s - %s", song.primary_artist.name, song.title);
});
```
```js
//output: Kanye West - Famous
```
## Look up an album

Use `album()` to look up an album by ID. The API can't search an album by title, but `song()` will return a `songs.album.id`:
```js
lyricist.album(56682, function(err, album) {
  console.log("%s by %s was released on %s", album.name, album.artist.name,album.release_date);
});
```
```js
//output: Lanterns by Son Lux was released on 2013-08-21
```
The returned `album` object looks like this:
```js
{
api_path: "/albums/56682",
cover_art_url: "https://images.genius.com/697732b0160cfd90f5cde6db0b6555b0.1000x1000x1.jpg",
id: 56682,
name: "Lanterns",
url: "http://genius.com/albums/Son-lux/Lanterns",
artist: {...},
description_annotation: {...},
release_date: "2013-08-21",
songs: [...]
}
```
## Get songs in an album
`album()` provides the `album.songs` array as seen above. Example usage:
```js
lyricist.album(56682, function(err, album) {
  for(var i in album.songs)
    console.log(album.songs[i].title);
});
```
```js
//output: Alternate World \n Lost It To Trying \n[...]
```
When fetching multiple songs, `.lyrics` will be `null` unless you explicitly request them like this:
```js
lyricist.album(56682, {fetch_lyrics: true}, function(err, album) {});
```
## Look up an artist
Use `artist()` to look up an artist by ID:
```js
lyricist.artist(2, function(err, artist) {
  console.log(artist.name);
});
```
```js
//output: Jay Z
```
The returned `artist` object looks like this:
```js
{
api_path: "/artists/2",
description: {...},
facebook_name: "JayZ",
followers_count: 3117,
header_image_url: "https://images.genius.com/0d53c56a247ef39e4106718deb95f347.1000x500x1.jpg",
id: 2,
image_url: "https://images.genius.com/0d53c56a247ef39e4106718deb95f347.1000x500x1.jpg",
instagram_name: "officials_c_",
name: "Jay Z",
twitter_name: "S_C_",
url: "http://genius.com/artists/Jay-z",
current_user_metadata: {...},
description_annotation: {...},
user: null,
songs: [...],
next_page: 2
}
```
## Get songs by an artist
`artist()` will provide the `artist.songs` array. Example usage:
```js
lyricist.artist(2, {get_songs: true}, function(err, artist) {
    for(var i in artist.songs)
        console.log(artist.songs[i].title);
});
```
```js
//output: '03 Bonnie & Clyde\n100$ Bill[...]

```
`artist()` will show  **20 results per page** by default, and can be as high as 50. `artist.next_page` will return the `next_page` number assuming there are more pages. You can specify the page number like this:
```js
lyricist.artist(2, {page: 2, per_page: 50}, function(err, artist) { });
```
`artist()` will **not** fetch lyrics. Lyricist scrapes the Genius.com website for lyrics and this would result in too many concurrent page requests.
