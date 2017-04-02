/*! Original code by Matslom https://github.com/Matslom/mybb-theme-editor
    Modified by Eric Jackson http://digitalrelativity.com */

"use strict";
var config = require('./config.json');
var watch = require('watch');
var mysql = require('mysql');
var del = require('del');
var glob = require("glob");
var mkdirp = require("mkdirp");
var path = require('path');
var fs = require('fs');
var Sequence = require('sequence').Sequence,
               sequence = Sequence.create();

module.exports = {
  init: function(){
    var connection = mysql.createConnection(config.mysql);
    connection.connect();

    sequence
      .then(function(next){
        mkdirp(config.app.datadir, function (err) {
          if (err) console.error(err)
          else console.log('dir created')
        });
        next();
      })
      .then(function(next){
        connection.query('SELECT title, template, sid FROM ' + config.database.prefix + 'templates WHERE sid='+ config.templates.id + ' OR sid=-2', function(err, rows, fields) {
          if (err) throw err;
          for (var i = 0; i < rows.length; i++) {
            createTemplate(rows[i]);
          };
        });
        next();
      });

      connection.end();
  },
  toFile: function(){
    var connection = mysql.createConnection(config.mysql);
    connection.connect();

    connection.query('SELECT title, template, sid FROM ' + config.database.prefix +'templates WHERE sid='+ config.templates.id + ' OR sid=-2', function(err, rows, fields) {
      if (err) throw err;
      for (var i = 0; i < rows.length; i++) {
        createTemplate(rows[i]);
      };
    });

    connection.end();
  },
  toDb: function(){
    var connection = mysql.createConnection(config.mysql);
    connection.connect();

    glob(config.app.datadir +'/**/*'+ config.app.fileext, function (err, files) {
      if (err) throw err;
      refreshDB(files, connection);
    });
  },
  watch: function(){
    var connection = mysql.createConnection(config.mysql);
    connection.connect();

    watch.createMonitor(config.app.datadir, function (monitor) {
      monitor.files[config.app.datadir +'/**/*'+ config.app.fileext];
      console.log('watching');
      monitor.on("changed", function (f, curr, prev) {
        saveTemplate(f, connection);
      })
    });
  },
  clear: function(){
    del([config.app.datadir +'/*']);
    console.log('All data deleted');
  }
}

function saveTemplate(fullpath, connection) {
  var filename = path.basename(fullpath, config.app.fileext);
  fs.readFile(fullpath, 'utf8', function (err,data) {
    if (err) {
      return console.log(err);
    }
    updateDbTemplate(filename, data, connection);
  });
}

function updateDbTemplate(name, data, connection) {
  connection.query('UPDATE '+ config.database.prefix +'templates SET template=\''+ addslashes(data) +'\' WHERE sid='+ config.templates.id +' AND title=\''+ name +'\'', function (err, result) {
    if (err) throw err;
    console.log('Template '+ name +' changed');
  })
}

function addslashes(string) {
  return string.replace(/\\/g, '\\\\')
               .replace(/\u0008/g, '\\b')
               .replace(/\t/g, '\\t')
               .replace(/\n/g, '\\n')
               .replace(/\f/g, '\\f')
               .replace(/\r/g, '\\r')
               .replace(/'/g, '\\\'')
               .replace(/"/g, '\\"');
}

function createTemplate(row) {
  var title = row.title;
  console.log(title);
  var name = title.split('_');
  if (inArray(title, config.templates.ungrouped)) {
  	var dir = config.app.datadir +'/ungrouped';
  } else {
    var dir = config.app.datadir +'/'+ name.shift();
  }

  sequence
    .then(function(next){
      mkdirp(dir, function (err) {
        if (err) {
          console.error(err);
        } else {
          console.log('Directory ' + dir + ' created.');
        }
      });
      next();
    })
    .then(function(next){
      fs.writeFile(dir +'/'+ title + config.app.fileext, row.template, function(err) {
        if(err) {
          return console.log(err);
        }
        console.log("Template " + dir + '/' + title + config.app.fileext + " created.");
      });
      next();
    });
}

function inArray(string, array) {
  return array.indexOf(string) != -1;
}

function refreshDB(file, connection) {
  var summ = file.length;
  for (var i = 0; i < file.length; i++) {
    saveTemplate(file[i], connection);
  }
}
