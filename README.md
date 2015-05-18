# yle-api

Client for YLE API (<http://developer.yle.fi/>).

**UNSTABLE. This library is still very much in its early stages. Anything can still change.**

## Installing

Install dependencies:

	npm install

## Using as a command-line tool

Provide your own API keys:

- Copy `yle-api-example.json` into `yle-api.json`
- Replace placeholder with your own API keys

You can now run command-line tools as follows:

	yle-api get-programs
	yle-api get-program 1-820561
	yle-api get-program-stream 1-820561

## Using as a node library

Add yle-api into your package.json:

	npm install --save yle-api

Require and use the library:

	var yleApi = require('yle-api')({appId: '', appKey: '', decryptKey: ''});
