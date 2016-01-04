# yle-api [![Build Status](https://travis-ci.org/jsalonen/yle-api.svg?branch=master&cachebust=1)](https://travis-ci.org/jsalonen/yle-api) [![Coverage Status](https://coveralls.io/repos/jsalonen/yle-api/badge.svg?branch=master&service=github&cachebust=1)](https://coveralls.io/github/jsalonen/yle-api?branch=master)

Unofficial Node.js SDK for Yle API (<http://developer.yle.fi/>).

**Work in progress. All contributions (pull requests, issues, comments) welcome!**

## Installing

Requires: node.js v4.0.0 or later.

Install the library with:

	npm install yle-api

In order to use Yle API, you must provide it with your developer API keys. Follow the developer site instructions. Note that terms of service apply to any usage of the API, including this client.

## Using command-line tool

Authorize the command-line tools with your API keys as follows:

- Copy `.yleapi-EXAMPLE` into your home folder and rename it to `.yleapi`
- Edit the file to add your own API keys

Now try out the command-line tool:

	yle-api search uutiset

Refine the search with optional parameters:

	yle-api search uutiset --availability=ondemand --order=publication.starttime:desc

For documentation, check help:

	yle-api search --help

## Using with node

Install and add as a dependency:

	npm install --save yle-api

Require and create a client instance:

```javascript
var yleapi = require('yle-api');
var client = new yleapi.Client({
  appId: '[YOUR_APP_ID]',
  appKey: '[YOUR_APP_KEY]',
  decryptKey: '[YOUR_DECRYPT_KEY]'
});
```

Use the provided methods as you require.
