module.exports = {
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