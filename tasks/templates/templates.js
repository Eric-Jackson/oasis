/*! Original code by Matslom https://github.com/Matslom/mybb-theme-editor
Modified by Eric Jackson http://digitalrelativity.com */

'use strict';

const config   = require('./config.json'),
      watch    = require('watch'),
      mysql    = require('mysql'),
      del      = require('del'),
      glob     = require("glob"),
      mkdirp   = require("mkdirp"),
      path     = require('path'),
      fs       = require('fs'),
      xml2js   = require('xml2js');

module.exports = {

    connection: mysql.createConnection(config.mysql),
    queries: {
        allTemplates: 'SELECT title, template, sid FROM ' + config.database.prefix + 'templates WHERE sid='+ config.templates.id + ' OR sid=-2',
        updateTemplates: function(data, title) {
            return 'UPDATE ' + config.database.prefix + 'templates SET template=\'' + data + '\' WHERE sid=' + config.templates.id + ' AND title=\'' + title + '\'';
        }
    },

    init: function() {
        this.connection.connect();

        let createDirectory = new Promise((resolve, reject) => {
            mkdirp(config.app.datadir, error => {
                if (error) {
                    console.error(error);
                    return reject();
                } else {
                    console.log(config.app.datadir + ' directory created.');
                    return resolve();
                }
            });
        });

        createDirectory.then(function() {
            this.toFile();
        }.bind(this)).catch(function () {
            console.log("Promise Rejected");
        }).then(function() {
            this.connection.end();
        }.bind(this));
    },

    toFile: function() {
        this.connection.query(this.queries.allTemplates, function(err, rows, fields) {
            if (err) {
                Promise.reject();
            } 
            for (let i = 0; i < rows.length; i++) {
                this.createTemplate(rows[i]);
            }
            Promise.resolve();
        }.bind(this));
    },

    createTemplate: function(row) {
        let title = row.title,
            name = title.split('_'),
            dir;

        if (this.inArray(title, config.templates.ungrouped)) {
            dir = config.app.datadir +'/ungrouped';
        } else {
            dir = config.app.datadir +'/'+ name.shift();
        }

        let createDirectory = new Promise((resolve, reject) => {
            mkdirp(dir, error => {
                if (error) {
                    console.error(error);
                    return reject();
                } else {
                    console.log(dir + ' directory created.');
                    return resolve();
                }
            });
        });

        createDirectory.then(function() {
            fs.writeFile(dir +'/'+ title + config.app.fileext, row.template, err => {
                if(err) {
                    return Promise.reject();
                }
                console.log("Template " + dir + '/' + title + config.app.fileext + " created.");
                return Promise.resolve();
            });
        }).catch(function () {
            console.log("Promise Rejected");
        });
    },

    inArray: (string, array) => array.indexOf(string) !== -1,

    toDb: function() {
        this.connection.connect();
    
        let saveFiles = new Promise(function(resolve, reject) {
            glob(config.app.datadir + '/**/*' + config.app.fileext, function(err, files) {
                if (err) {
                    console.log(err);
                    reject();
                } 
                for (let i = 0; i < files.length; i++) {
                    this.saveTemplate(files[i]);
                    console.log(files[i] + ' was saved to the database.');
                }
                resolve();
            }.bind(this));
        }.bind(this));
        
        saveFiles.then(function() {
            this.connection.end();
        })
        
        .catch(function () {
            console.log("Promise Rejected");
        });
    },

    saveTemplate: function(fullpath) {
        let filename = path.basename(fullpath, config.app.fileext);
        fs.readFile(fullpath, 'utf8', function(err, data) {
            if (err) {
                return console.log(err);
            }
            let cleanData = this.addSlashes(data);
            this.connection.query(this.queries.updateTemplates(cleanData, filename), (err, result) => {
                if (err) {
                    throw err;
                }
            });
        }.bind(this));
    },

    watch: function() {
        this.connection.connect();
    
        watch.createMonitor(config.app.datadir, function(monitor) {
            monitor.files = config.app.datadir + '/**/*' + config.app.fileext;
            console.log('Watching ' + config.app.datadir);
            monitor.on("changed", function(f, curr, prev)  {
                this.saveTemplate(f);
            });
        });
    },

    delete: () => {
        del([config.app.datadir +'/*']);
        console.log('All data deleted');
    },

    addSlashes: string => {
        return string.replace(/\\/g, '\\\\')
                     .replace(/\u0008/g, '\\b')
                     .replace(/\t/g, '\\t')
                     .replace(/\n/g, '\\n')
                     .replace(/\f/g, '\\f')
                     .replace(/\r/g, '\\r')
                     .replace(/'/g, '\\\'')
                     .replace(/"/g, '\\"');
    }
};

// // TODO: Make this work
// loadThemeFile() {
//     let parser = new xml2js.Parser();
//     fs.readFile(__dirname + '/foo.xml', function(err, data) {
//         parser.parseString(data, function (err, result) {
//             console.dir(result);
//             console.log('Done');
//         });
//     });
// }
