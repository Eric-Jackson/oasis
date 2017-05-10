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
        updateTemplates: (data, title) => {
            return 'UPDATE ' + config.database.prefix + 'templates SET template=\'' + this.addslashes(data) + '\' WHERE sid=' + config.theme.id + ' AND title=\'' + title + '\'';
        }
    },

    init: () => {
        this.connection.connect();

        let createDirectory = new Promise((resolve, reject) => {
            mkdirp(config.app.datadir, error => {
                if (error) {
                    console.error(error);
                } else {
                    console.log(config.app.datadir + ' directory created.');
                }
            });
        });

        createDirectory.then(() => {
            this.toFile();
        });

        this.connection.end();
    },

    createTemplate: row => {
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
                } else {
                    console.log(dir + ' directory created.');
                }
            });
        });

        createDirectory.then(() => {
            fs.writeFile(dir +'/'+ title + config.app.fileext, row.template, err => {
                if(err) {
                    return console.log(err);
                }
                console.log("Template " + dir + '/' + title + config.app.fileext + " created.");
            });
        });
    },

    inArray: (string, array) => array.indexOf(string) !== -1,

    toFile: () => {
        this.connection.query(this.queries.allTemplates, (err, rows, fields) => {
            if (err) throw err;
            for (let i = 0; i < rows.length; i++) {
                this.createTemplate(rows[i]);
            }
        });
    },

    toDb: () => {
        this.connection.connect();
    
        glob(config.app.datadir + '/**/*' + config.app.fileext, (err, files) => {
            if (err) throw err;
            for (let i = 0; i < files.length; i++) {
                this.saveTemplate(files[i]);
            }
        });

        this.connection.end();
    },

    saveTemplate(fullpath) {
        let filename = path.basename(fullpath, config.app.fileext);
        fs.readFile(fullpath, 'utf8', (err, data) => {
            if (err) {
                return console.log(err);
            }
            this.connection.query(this.queries.updateTemplates(data, filename), (err, result) => {
                if (err) {
                    throw err;
                }
                console.log('Template '+ filename +' changed');
            });
        });
    },

    watch: () => {
        this.connection.connect();
    
        watch.createMonitor(config.app.datadir, monitor => {
            monitor.files = config.app.datadir + '/**/*' + config.app.fileext;
            console.log('Watching ' + config.app.datadir);
            monitor.on("changed", (f, curr, prev) => {
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
