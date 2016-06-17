'use strict';

var Genius = require('node-genius');

var lyrical = function(api_key) {

  var module = {};

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
  module.song = function(query, callback) {

    if(typeof query === 'number'){
      genius.search()

    }
  };

  return module;
};

module.exports = lyrical;
