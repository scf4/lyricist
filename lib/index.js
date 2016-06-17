'use strict';

var request = require('request');
var cheerio = require('cheerio');
var Genius = require('node-genius');

var lyrical = function(key){

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
  };

  /**
  * Look up album
  * @param  number    id        The album's Genius ID.
  * @param  function  callback  The function to call when we have a result.
  */
  module.album = function(id, callback){
    genius.getAlbum(id, function(error, response){
      if(error){ return(callback(error)); }
      var album = JSON.parse(response).response.album;
      callback(error, album);
    })
  };

  function _search(query, callback){
    genius.search(query, function (error, response){
      if(error){ return(callback(error)); }
      var song = JSON.parse(response).response.hits[0].result;
      _scrapeLyrics(song.path, function(error, lyrics){
        song.lyrics = lyrics;
        callback(error, song);
      });
    });
  }

  function _getSong(query, callback){
    genius.getSong(query, function (error, response){
      if(error){ return(callback(error)); }
      var song = JSON.parse(response).response.song;
      _scrapeLyrics(song.path, function(error, lyrics){
        song.lyrics = lyrics;
        callback(error, song);
      });
    });
  }

  function _scrape(url, element, callback){
    request(url, function(error, response, body){
      var $ = cheerio.load(body);
      var data = $(element).text();
      callback(error, data);
    });
  }

  function _scrapeLyrics(path, callback){
    var url = 'http://genius.com' + path;
    _scrape(url, '.lyrics', callback);
  }

  return module;
};

module.exports = lyrical;
