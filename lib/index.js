'use strict';

var Genius = require('node-genius');

var lyrical = function(api_key){

  var module = {};

  // Make sure we have the API key
  if(api_key){
    var genius = new Genius(api_key);
  }
  else{
    throw new Error('You need to provide an API key for Lyrical!');
  }

  /**
  * Look up song
  * @param  object|number  query     Search query (Genius ID or keywords).
  * @param  function       callback  The function to call when we have a result.
  */
  module.song = function(query, callback){
    // If query is an object with keywords like {search: 'keywords'}
    if(typeof query === 'object'){
      genius.search(query.search, function (error, response){
        var song = parse(response).hits[0];
        callback(error, song);
      });
    }
    // Or if query is an ID
    else if(typeof query === 'number'){
      genius.getSong(query), function(error, response){
        var song = parse(response).song;
        callback(error, song);
      };
    }
  };

  // Parse JSON because node-genius doesn't
  function parse(data){
    return JSON.parse(data).response;
  }
  
  return module;
};

module.exports = lyrical;
