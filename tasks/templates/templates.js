/*! Original code by Matslom https://github.com/Matslom/mybb-theme-editor
Modified by Eric Jackson http://digitalrelativity.com */

'use strict';

const config   = require('./config.json'),
      utils    = require('./utils.js'),
      msg      = require('./messages.js'),
      fs       = require('fs-extra'),
      mysql    = require('promise-mysql'),
      glob     = require("glob-promise"),
      watch    = require('watch'),
      path     = require('path'),
      xml2js   = require('xml2js'),
      builder  = require('xmlbuilder');

module.exports = {
    
    // Store queries we plan to use throughout the app
    queries: {
        customTemplates: `SELECT title, template, sid, version FROM ${config.database.prefix}templates WHERE sid=${config.templates.id}`,
        defaultTemplates: `SELECT title, template, sid, version FROM ${config.database.prefix}templates WHERE sid=-2`,
        updateTemplates: function(data, title) {
            return `UPDATE ${config.database.prefix}templates SET template='${data}' WHERE sid=${config.templates.id} AND title='${title}'`;
        }
    },

    
    init: function() {
        const _this = this;
        let connect = mysql.createConnection,
            connection;
        
        connect(config.mysql)
            .then(conn => {
                connection = conn;
                return _this.getDefaultTemplates(connection);
            })
            .then(() => _this.getCustomTemplates(connection))
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
            dir = `${config.app.datadir}/ungrouped`;
        } else {
            dir = config.app.datadir +'/'+ name.shift();
        }

        return _this.createFile(`${dir}/${title}${config.app.fileext}`, template.template, currentIndex, templateAmount);
    },

    createFile: function(filename, dbTemplate, current, max) {
        return fs.outputFile(filename, dbTemplate)
                .then(() => {
                    msg.newFileCount(filename, current, max);
                    Promise.resolve(filename);
                })
                .catch(e => msg.error(e));
    },

    delete: () => {
        return fs.remove(config.app.datadir)
                 .then(console.log("Deleted folder and all contents: " + config.app.datadir))
                 .catch(e => msg.error(e));
    },

    toDb: function() {
        const _this = this;
        let connect = mysql.createConnection(config.mysql),
            connection;

        connect
            .then(conn => {
                connection = conn;
                return _this.saveAll(connection);
            })
            .then(() => connection.end())
            .catch(e => msg.error(e));
    },

    saveAll: function(connection) {
        const _this = this;
        let promises = [];

        return glob(config.app.datadir + '/**/*' + config.app.fileext)
            .then(files => {
                for (let i = 0; i < files.length; i++) {
                    promises.push(_this.saveTemplate(connection, files[i]));
                }

                return Promise.all(promises);
            })
            .then(() => console.log("Finished saving all to database."))
            .catch(e => msg.error(e));
    },

    saveTemplate: function(connection, fullpath) {
        const _this = this;
        let filename = path.basename(fullpath, config.app.fileext);
        return fs.readFile(fullpath, 'utf8')
            .then(data => {
                let cleanData = utils.addSlashes(data);
                console.log(filename + ' was saved to the database.');
                return connection.query(_this.queries.updateTemplates(cleanData, filename));
            })
            .catch(e => msg.error(e));
    },

    watch: function() {
        const _this = this;
        let connect = mysql.createPool(config.mysql),
            connection;
        
        connect.getConnection()
            .then((conn) => {
                connection = conn;
                watch.createMonitor(config.app.datadir, function(monitor) {
                    monitor.files = config.app.datadir + '/**/*' + config.app.fileext;
                    console.log('Watching ' + config.app.datadir);
                    monitor.on("changed", function(f, curr, prev) {
                        _this.saveTemplate(connection, f);
                    });
                });
            })
            .catch(e => msg.error(e));
        
    },

    createThemeFile: function() {
        fs.readdir(config.app.datadir)
        .then(folders => 
            Promise.all(
                folders.map(folder =>
                    fs.readdir(`${config.app.datadir}/${folder}`)
                    .then(files =>
                        Promise.all(
                            files.map(file => {
                                return new Promise(function(resolve, reject) {
                                    resolve(`${config.app.datadir}/${folder}/${file}`);
                                });
                            })
                        )
                    )
                    .catch(e => msg.error(e))
                )
            )
        )
        .then(data => {
            data = [].concat.apply([], data);
            var root = builder.create('squares');

            data.forEach(function(filename) {
                fs.readFile(filename, 'utf-8', function(err, content) {
                    if (err) {
                        msg.error(err);
                        return;
                    }
                    
                    console.log(content);
                });
            });
        })
        .catch(e => msg.error(e));
    }

        // let xml = builder.create('root')
        //         .ele('xmlbuilder')
        //             .ele('repo', {'type': 'git'}, 'git://github.com/oozcitak/xmlbuilder-js.git')
        //         .end({ pretty: true});

    // loadThemeFile() {
    //     let parser = new xml2js.Parser();
    //     fs.readFile(__dirname + '/foo.xml', function(err, data) {
    //         parser.parseString(data, function (err, result) {
    //             console.dir(result);
    //             console.log('Done');
    //         });
    //     });

    //         foreach($theme['properties'] as $property => $value)
    //         {
    //             if($property == "tag" || $property == "value")
    //             {
    //                 continue;
    //             }
    //             if($property == 'colors' || $property == 'disporder')
    //             {
    //                 $data = my_unserialize($value['value']);
    //                 if(!is_array($data))
    //                 {
    //                     // Bad data?
    //                     continue;
    //                 }
    //                 $value['value'] = $data;
    //             }
    //             $properties[$property] = $value['value'];
    //         }
    // }
};
