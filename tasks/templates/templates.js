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
        allTemplates: 'SELECT title, template, sid FROM ' + config.database.prefix + 'templates WHERE sid='+ config.templates.id + ' OR sid=-2'
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
            this.connection.query(this.queries.allTemplates, function(err, rows, fields) {
                if (err) throw err;
                for (let i = 0; i < rows.length; i++) {
                    this.createTemplate(rows[i]);
                }
            });
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
            fs.writeFile(dir +'/'+ title + config.app.fileext, row.template, function(err) {
                if(err) {
                    return console.log(err);
                }
                console.log("Template " + dir + '/' + title + config.app.fileext + " created.");
            });
        });
    },

    inArray: (string, array) => array.indexOf(string) !== -1
};

// module.exports = class Templates {
//     constructor() {
//         this.connection = mysql.createConnection(config.mysql);
//         this.queries = {
//             allTemplates: 'SELECT title, template, sid FROM ' + config.database.prefix + 'templates WHERE sid='+ config.templates.id + ' OR sid=-2',
//             updateTemplates: 'UPDATE '+ config.database.prefix +'templates SET template=\''+ addslashes(data) +'\' WHERE sid='+ config.templates.id +' AND title=\''+ name +'\''
//         };
//     }
//
//     init() {
//         this.connection.connect();
//
//         let createDirectory = new Promise((resolve, reject) => {
//             mkdirp(config.app.datadir, error => {
//                 if (error) {
//                     console.error(error);
//                 } else {
//                     console.log(config.app.datadir + ' directory created.');
//                 }
//             });
//         });
//
//         createDirectory.then(() => {
//             this.connection.query(this.queries.allTemplates, function(err, rows, fields) {
//                 if (err) throw err;
//                 for (let i = 0; i < rows.length; i++) {
//                     this.createTemplate(rows[i]);
//                 }
//             });
//         });
//
//         this.connection.end();
//     }
//


    // toFile() {
    //     this.connection.connect();
    //
    //     this.connection.query(this.queries.allTemplates, function(err, rows, fields) {
    //         if (err) throw err;
    //         for (let i = 0; i < rows.length; i++) {
    //             this.createTemplate(rows[i]);
    //         }
    //     });
    //
    //     this.connection.end();
    // }
    //
    // toDb() {
    //     this.connection.connect();
    //
    //     glob(config.app.datadir + '/**/*' + config.app.fileext, function (err, files) {
    //         if (err) throw err;
    //         this.refreshDB(files, this.connection);
    //     });
    // }
    //
    // watch() {
    //     this.connection.connect();
    //
    //     watch.createMonitor(config.app.datadir, function (monitor) {
    //         monitor.files = config.app.datadir + '/**/*' + config.app.fileext;
    //         console.log('watching');
    //         monitor.on("changed", function (f, curr, prev) {
    //             this.saveTemplate(f, this.connection);
    //         });
    //     });
    // }
    //
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
    //
    // updateDb(name, data, connection) {
    //     connection.query(this.queries.updateTemplates, function (err, result) {
    //         if (err) {
    //             throw err;
    //         }
    //         console.log('Template '+ name +' changed');
    //     });
    // }
    //
    // saveTemplate(fullpath, connection) {
    //     let filename = path.basename(fullpath, config.app.fileext);
    //     fs.readFile(fullpath, 'utf8', function (err,data) {
    //         if (err) {
    //             return console.log(err);
    //         }
    //         this.updateDb(filename, data, connection);
    //     });
    // }
    //
    //
    // refreshDB(file, connection) {
    //     let sum = file.length;
    //     for (let i = 0; i < file.length; i++) {
    //         this.saveTemplate(file[i], connection);
    //     }
    // }
    //
    // addSlashes(string) {
    //     return string.replace(/\\/g, '\\\\')
    //                  .replace(/\u0008/g, '\\b')
    //                  .replace(/\t/g, '\\t')
    //                  .replace(/\n/g, '\\n')
    //                  .replace(/\f/g, '\\f')
    //                  .replace(/\r/g, '\\r')
    //                  .replace(/'/g, '\\\'')
    //                  .replace(/"/g, '\\"');
    // }
    //
    // static inArray(string, array) {
    //     return array.indexOf(string) != -1;
    // }
    //
    // static clear() {
    //     del([config.app.datadir +'/*']);
    //     console.log('All data deleted');
    // }
//};
