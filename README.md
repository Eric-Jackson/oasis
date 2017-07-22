# Clement
Modern MyBB theme that uses a modern workflow.

## Install
Download the zip and put it in your root/themes folder.

Run `npm install` inside the directory.

Edit `./tasks/templates/config.json` with the appropriate information.

## Initialize
Run `npm run templates:file` to download all templates from the database to your local installation.

## Save to Database
Run `npm run templates:db` to save all local files to the database.

## Delete
Run `npm run templates:delete` to delete all local files. BE CAREFUL.

## Watch for Changes
Run `npm run templates:watch` to save template files to the database as they change.