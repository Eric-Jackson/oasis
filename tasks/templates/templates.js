/*! Original code by Matslom https://github.com/Matslom/mybb-theme-editor
Modified by Eric Jackson http://digitalrelativity.com */

'use strict';

const config   = require('./config.json'),
      utils    = require('./utils.js'),
      msg      = require('./messages.js'),
      fs       = require('fs-extra'),
      mysql    = require('promise-mysql'),
      watch    = require('watch'),
      glob     = require("glob"),
      path     = require('path'),
      xml2js   = require('xml2js');

module.exports = {
    queries: {
        customTemplates: 'SELECT title, template, sid, version FROM ' + config.database.prefix + 'templates WHERE sid='+ config.templates.id,
        defaultTemplates: 'SELECT title, template, sid, version FROM ' + config.database.prefix + 'templates WHERE sid=-2',
        updateTemplates: function(data, title) {
            return 'UPDATE ' + config.database.prefix + 'templates SET template=\'' + data + '\' WHERE sid=' + config.templates.id + ' AND title=\'' + title + '\'';
        }
    },

    init: function() {
        const _this = this;
        let connect = mysql.createConnection(config.mysql),
            connection;
        
        connect
            .then(conn => {
                connection = conn;
                return _this.getCustomTemplates(connection);
            })
            .then(() => _this.getDefaultTemplates(connection))
            .then(() => connection.end())
            .catch(e => msg.error(e));
    },

    getTemplates: function(connection, query) {
        const _this = this;
        let promises = [];

        return connection.query(query)
            .then(rows => {
                for (let i = 0; i < rows.length; i++) {
                    promises.push(_this.setupFile(rows[i], i, rows.length));
                }

                return promises;
            })
            .then(() => {
                return Promise.all(promises)
                    .then(console.log("Finished getting template set."));
            })
            .catch(e => msg.error(e));
    },

    getDefaultTemplates: function(connection) {
        const _this = this;
        return _this.getTemplates(connection, _this.queries.defaultTemplates);
    },

    getCustomTemplates: function(connection) {
        const _this = this;
        return _this.getTemplates(connection, _this.queries.customTemplates);
    },
    
    setupFile: function(template, currentIndex, templateAmount) {
        const _this = this;

        let title = template.title,
            name = title.split('_'),
            dir;

        if (utils.inArray(title, config.templates.ungrouped)) {
            dir = config.app.datadir +'/ungrouped';
        } else {
            dir = config.app.datadir +'/'+ name.shift();
        }

        return _this.createFile(dir + "/" + title + config.app.fileext, template.template, currentIndex, templateAmount);
    },

    createFile: function(filename, dbTemplate, current, max) {
        let newFile = fs.outputFile(filename, dbTemplate);
        msg.newFileCount(filename, current, max);
        return newFile;
    },

    delete: () => {
        return fs.remove(config.app.datadir)
                 .then(console.log("Deleted folder and all contents: " + config.app.datadir));
    },

    // toDb: function() {
    //     const _this = this;

    //     _this.connection.connect();
    //     let saveFiles = new Promise(function(resolve, reject) {
    //         glob(config.app.datadir + '/**/*' + config.app.fileext, function(err, files) {
    //             if (err) {
    //                 console.log(err);
    //                 reject();
    //             } 
    //             for (let i = 0; i < files.length; i++) {
    //                 _this.saveTemplate(files[i]);
    //                 console.log(files[i] + ' was saved to the database.');
    //             }
    //         });
    //     });
        
    //     saveFiles.then(function() {
    //         _this.connection.end();
    //     })
        
    //     .catch(function () {
    //         console.log("Promise Rejected");
    //     });
    // },

    // saveTemplate: function(fullpath) {
    //     const _this = this;
    //     let filename = path.basename(fullpath, config.app.fileext);

    //     return new Promise((resolve, reject) => {
    //         fs.readFile(fullpath, 'utf8', function(err, data) {
    //             if (err) {
    //                 console.log(err);
    //                 return reject();
    //             }
    //             let cleanData = _this.addSlashes(data);
    //             _this.connection.query(_this.queries.updateTemplates(cleanData, filename), (err, result) => {
    //                 if (err) {
    //                     console.log(err);
    //                     return reject();
    //                 }

    //                 return resolve(result);
    //             });
    //         });
    //     });
    // },

    // watch: function() {
    //     const _this = this;
    //     _this.connection.connect();
    
    //     watch.createMonitor(config.app.datadir, function(monitor) {
    //         monitor.files = config.app.datadir + '/**/*' + config.app.fileext;
    //         console.log('Watching ' + config.app.datadir);
    //         monitor.on("changed", function(f, curr, prev)  {
    //             _this.saveTemplate(f);
    //         });
    //     });
    // },

    inArray: (string, array) => array.indexOf(string) !== -1,

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
