# Clement
Modern MyBB theme that uses a modern workflow.

## Templates
Download the zip and put it in your root/themes folder.

Run `npm install` inside the directory.

Edit `./tasks/templates/config.json` with the appropriate information.

### Initialize
Run `npm run templates:file` to download all templates from the database to your local installation.

### Save to Database
Run `npm run templates:db` to save all local files to the database.

### Delete
Run `npm run templates:delete` to delete all local files. BE CAREFUL.

### Watch for Changes
Run `npm run templates:watch` to save template files to the database as they change.

## CSS/JS/Images
Include the files `./dist/themes/oasis/css/main.min.css` and `./dist/themes/oasis/js/main.min.js` in your headerinclude. For example:
```html
<link rel="stylesheet" type="text/css" href="themes/oasis/dist/themes/oasis/css/main.min.css" />
<script type="text/javascript" src="themes/oasis/dist/themes/oasis/js/main.min.js"></script>
```

Set your image directory to `themes/oasis/dist/themes/oasis/images` and your logo directory to `themes/oasis/dist/themes/oasis/images/logo.png`

### JS
Run `gulp js` to transpile your Javascript into ES5 and compress it.

### CSS
Run `gulp sass` to transpile your Sass into CSS and compress it.

### Images
Run `gulp img` to compress your images.

### Watch
Run `gulp watch` to automate both JS and CSS transpiling while you edit.

