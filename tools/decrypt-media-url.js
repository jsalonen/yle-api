'use strict';

let fs = require('fs');
let yleApiAuth = JSON.parse(fs.readFileSync('yle-api-auth.json', 'utf8'));
let yleApi = require('../lib/index.js')(yleApiAuth);

let programId = (process.argv.length > 2) ? process.argv[2] : null;

if(!programId) {
	console.log(`Usage: decrypt-media-url [programId]`);
} else {
	yleApi.getProgramPlayableMediaUrl(programId, (err, url) => {
		console.log(url);
	});
}
