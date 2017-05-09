const program = require('commander');
const app = require('./templates.js');

program
  .version('0.0.1');

program
  .command('init')
  .description('create template repository')
  .action(function(env, options){
    app.init();
  });

program
  .command('reset')
  .description('overwrite all files by templates from database')
  .action(function(env, options){
    app.toFile();
  });

program
  .command('upload')
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
  .command('delete')
  .description('delete all file templates')
  .action(function(env, options){
    app.clear();
  });

program.parse(process.argv);
