module.exports = {
    newDir: function(dir) {
        return console.log("Created directory: " + dir);
    },

    newFileCount: function(filename, current, max) {
        return console.log("Created file: " + filename + " (" + (current + 1) + " of " + max + ")");
    },
    
    gotTemplates: function() {
        return console.log("Finished getting template set.");
    },
    
    deletedDir: function(dir) {
        return console.log("Deleted folder and all contents: " + dir);
    },
    
    savedFiles: function() {
        return console.log("All files were saved to the database.");
    },
    
    savedFile: function(file) {
        return console.log(file + ' was saved to the database.');
    },
    
    watching: function(location) {
        console.log('Watching ' + location)
    },

    error: function(error) {
        return console.error("Error: " + error);
    }
};
