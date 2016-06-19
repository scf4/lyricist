var gulp   = require('gulp');
var jshint = require('gulp-jshint');

gulp.task('lint', function() {
  var lyrical = require('./lib/index.js')('gzM-i2bSsovQIX95sed01fkO3bxM2e4jGsHu7Z6TquoSpxTGOKxsPasXcU-gBc2o');
  require.uncache('./lib/index.js');
  lyrical.album(56682, function(err, album) {
    console.log("ERROR: %s",err);
    console.log("%s by %s was released on %s", album.name, album.artist.name,album.release_date);
  });
  return gulp.src('./lib/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task("default", ["lint"], function() {
  gulp.watch("./lib/*.js", ["lint"]);
});


/**
 * Removes a module from the cache
 */
require.uncache = function (moduleName) {
    // Run over the cache looking for the files
    // loaded by the specified module name
    require.searchCache(moduleName, function (mod) {
        delete require.cache[mod.id];
    });

    // Remove cached paths to the module.
    // Thanks to @bentael for pointing this out.
    Object.keys(module.constructor._pathCache).forEach(function(cacheKey) {
        if (cacheKey.indexOf(moduleName)>0) {
            delete module.constructor._pathCache[cacheKey];
        }
    });
};

/**
 * Runs over the cache to search for all the cached
 * files
 */
require.searchCache = function (moduleName, callback) {
    // Resolve the module identified by the specified name
    var mod = require.resolve(moduleName);

    // Check if the module has been resolved and found within
    // the cache
    if (mod && ((mod = require.cache[mod]) !== undefined)) {
        // Recursively go over the results
        (function run(mod) {
            // Go over each of the module's children and
            // run over it
            mod.children.forEach(function (child) {
                run(child);
            });

            // Call the specified callback providing the
            // found module
            callback(mod);
        })(mod);
    }
};
