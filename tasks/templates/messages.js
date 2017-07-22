module.exports = {
    newDir: function(message) {
        return console.log("Created directory: " + message);
    },

    newFileCount: function(filename, current, max) {
        return console.log("Created file: " + filename + " (" + (current + 1) + " of " + max + ")");
    },

    error: function(error) {
        return console.error("Error: " + error);
    }
};