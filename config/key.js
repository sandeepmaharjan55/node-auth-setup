//Keys.js figure out what set of credentials to return
// console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === 'production') {
    //production -- return the prod set of keys
    module.exports = require('./prod');
} else {
    //we are in development - return the dev keys
    module.exports = require('./dev');
}

