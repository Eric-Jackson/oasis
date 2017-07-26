const program = require('commander');
const oasis = require('./templates.js');

program
  .version('0.0.1');

program
  .command('file')
  .description('create template repository')
  .action(function(env, options){
    oasis.init();
  });

program
  .command('db')
  .description('overwrite all database templates by templates from files')
  .action(function(env, options){
    oasis.toDb();
  });

program
  .command('watch')
  .description('watch templates')
  .action(function(env, options){
    oasis.watch();
  });

program
  .command('delete')
  .description('delete all file templates')
  .action(function(env, options){
    oasis.delete();
  });

program
  .command('build-theme')
  .description('Build theme file')
  .action(function(env, options){
    oasis.createThemeFile();
  });

program.parse(process.argv);
