'use strict';

var request = require('request');
var cheerio = require('cheerio');
var Genius = require('node-genius');

var lyricist = function(key){

  var module = {};

  if(key){
    var genius = new Genius(key);
  }
  else{
    throw new Error('You need to provide an API key!');
  }

  /**
  * Look up song
  * @param  object|number  query     Search query (Genius ID or keywords).
  * @param  function       callback  The function to call when we have a result.
  */
  module.song = function(query, callback){
    // If query is an object with keywords like {search: 'keywords'}
    if(typeof query === 'object'){
      _search(query.search, callback);
    }
    // Or if query is an ID
    else if(typeof query === 'number'){
      _getSong(query, callback);
    }
  }; // End of module.song()

  /**
  * Look up album
  * @param  number    id        The album's Genius ID.
  * @param  object    options   Options e.g., fetch_lyrics (optional)
  * @param  function  callback  The function to call when we have a result.
  */
  module.album = function(id, options, callback){
    if(typeof options === 'function'){
      // If the options parameter receives a function then there will
      // be no options. use defaults:
      callback = options; // And get the callback from the options parameter.
    }
    genius.getAlbum(id, function(error, response){
      if(error){ return(callback(error)); }
      var album = JSON.parse(response).response.album;
      _scrapeTracklist(album.url, function(error, songs){
        album.songs = songs;
        callback(error, album);
      });
    });
  }; // End of module.album()

  /**
  * Look up artist
  * @param  number    id        The artist's Genius ID.
  * @param  object    options   Options e.g., page, per_page, get_songs (optional)
  * @param  function  callback  The function to call when we have a result.
  */
  module.artist = function(id, options, callback){
    if(typeof options === 'function'){
      // If the options parameter receives a function then there will
      // be no options. use defaults:
      options.get_songs = false;
      callback = options; // And get the callback from the options parameter.
    }
    genius.getArtist(id, function(error, response){
      if(error){ return(callback(error)); }
      var artist = JSON.parse(response).response.artist;
      if(options.get_songs){
        // Set defaults if empty:
        options.page = options.page || 1;
        options.per_page = options.per_page || 20;
        genius.getArtistSongs(artist.id, {per_page: options.per_page, pages: options.pages}, function(error, response){
          artist.songs = JSON.parse(response).response.songs;
          artist.next_page = JSON.parse(response).response.next_page;
          callback(error, artist);
        });
      }else{
        callback(error, artist);
      }
    });
  }; // End of module.artist()

  /**
  * Private functions.
  * These are internal functions for the module only.
  */
  
  function _search(query, callback){
    genius.search(query, function (error, response){
      if(error){ return(callback(error)); }
      var song = JSON.parse(response).response.hits[5].result;
      _scrapeLyrics(song.path, function(error, lyrics){
        song.lyrics = lyrics;
        callback(error, song);
      });
    });
  } // End of _search()

  function _getSong(query, options, callback){
    if(typeof options === 'function'){
      // If the options parameter receives a function then there will
      // be no options, so use defaults:
      callback = options; // And get the callback from the options parameter.
      options.fetch_lyrics = true;
    }

    genius.getSong(query, function (error, response){
      if(error){ return(callback(error)); }
      var song = JSON.parse(response).response.song;
      if(options.fetch_lyrics){
        _scrapeLyrics(song.path, function(error, lyrics){
          song.lyrics = lyrics;
          callback(error, song);
        });
      } else {
        callback(error, song);
      }
    });
  } // End of _getSong()

  // Scrape URL and return Cheerio function ($) and content
  // Usage: $('.class_name').text(); etc like jQuery
  function _scrape(url, callback){
    if(url.substr(0, 4)!='http'){
        url = 'http://genius.com' + url;
    }
    request(url, function(error, response, body){
      var $ = cheerio.load(body);
      callback(error, $);
    });
  } // End of _scrape()

  // Use _scrape() to fetch lyrics from the given path
  // The element with lyrics on Genius.com has the class '.lyrics'
  function _scrapeLyrics(path, callback){
    _scrape(path, function(error, $){
      callback(error, $('.lyrics').text());
    });
  } // End of _scrapeLyrics()

  // Scrape album tracklist with Cheerio and load info for /every/ song on
  // the tracklist. This needs to be used with care!
  // Warning: 'fetch_lyrics = true' will scrape each song's lyrics at once,
  // resulting in 31 simultaneous requests (15 http) for a 15 song album...
  // Not recommended!
  function _scrapeTracklist(url, options, callback){
    if(typeof options == 'function'){
      // If the options parameter receives a function then there will
      // be no options, so use defaults:
      callback = options; // And get the callback from the options parameter.
      options.fetch_lyrics = false; // Don't load album lyrics by default!
    }
    _scrape(url, function(error, $){
      var songs = [], i = 1;
      // Loop through each item, get the song ID from data-id and pass it to
      // the _getSong() function - for each song on the tracklist.
      // Note: The loops run asynchronously!
      $('.primary_list li').each(function(num){
        var id = $(this).data('id');
        _getSong(id, { fetch_lyrics: options.fetch_lyrics }, function(error, song){
          songs[num] = song;

          // If we've done <number of songs> loops, then we're done:
          if(i++ == $('.primary_list li').length){
            callback(error, songs);
          }
        });
      });
    });
  } // End of _scrapeTracklist()

  return module;
};

module.exports = lyricist;
