'use strict';

/**
 * Module dependencies.
 */

var inspect = require('util').inspect;
var through = require('through2');
var path = require('path');
var _ = require('lodash');

/**
 * Get a list of related pages based on the options.
 *
 * @param {Object} `collection` current collection used to generate the pages.
 * @param {Object} `options` options used to generate the pages.
 * @param {Function} `callback` callback function used when all the related pages have been generated.
 * @returns {undefined}
 */

module.exports = function relatedPagesPlugin(collection, options, callback) {
  var assemble = this;

  // Clone the options
  var opts = _.extend({}, options);

  if (!options.template) {
    return callback();
  }

  var files = [];

  var relatedPages = through.obj(function (templateFile, enc, cb) {
    collection.forEach(function (item) {
      var pages = item.pages();
      files = files.concat(pages.map(function (page, idx) {
        var file = templateFile.clone();

        file.data = _.extend(file.data || {}, {
          pagination: inspect(page, null, 10)
        });

        // generate a page path like 'tags/football/2/index.hbs'
        var currentPagePath = opts.plural + '/' + item.collectionItem + '/' + (idx + 1);
        file.path = file.base + '/' + currentPagePath + '/index' + path.extname(file.path);
        return file;
      }));
    });

    cb();
  }, function (cb) {
    callback(null, files);
    cb();
  });

  // read in the related pages template
  assemble.src(opts.template).pipe(relatedPages);
};