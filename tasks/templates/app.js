var program = require('commander');
var app = require('./templates.js');

program
  .version('0.0.1')

program
  .command('init')
  .description('create template repository')
  .action(function(env, options){
    app.init();
  });

program
  .command('write-file')
  .description('overwrite all files by templates from database')
  .action(function(env, options){
    app.toFile();
  });

program
  .command('write-db')
  .description('overwrite all database templates by templates from files')
  .action(function(env, options){
    app.toDb();
  });

program
  .command('watch')
  .description('watch templates')
  .action(function(env, options){
    app.watch();
  });

program
  .command('clear')
  .description('delete all file templates')
  .action(function(env, options){
    app.clear();
  });

program.parse(process.argv);
