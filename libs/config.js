var nconf = require('nconf');
nconf.argv()
    .env()
    .file({ file: './config/main.json' });

module.exports = nconf;

