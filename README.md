# yle-api [![Build Status](https://travis-ci.org/jsalonen/yle-api.svg?branch=master&cachebust=1)](https://travis-ci.org/jsalonen/yle-api)

Unofficial Yle API SDK for Node.js

Features:

- Promise-based with async/await support
- TypeScript support
- Decent test coverage
- Fairly minimal dependencies

**Work in progress. All contributions (pull requests, issues, comments) welcome!**

## Requirements

Requires node.js v6.x or later.

You must provide the SDK with your developer API keys. The keys can be ordered from the official developer site at: http://developer.yle.fi/.

Note that terms of service apply to any usage of the API, including this SDK.

## Using from Command-line

For command-line use, you may prefer installing globally with:

    npm install -g yle-api

Authorize the command-line tools with your API keys as follows:

- Copy `.yleapi-EXAMPLE` into your home folder and rename it to `.yleapi`
- Edit the file to add your own API keys

Now try out the command-line tool to do a program search:

	yle-api search Uutiset

If everything went well, a list of results should be returned.

Now, obtain and use ID of any specific result to get more info with:

	yle-api info 1-123456

## Using as a Node.js/JavaScript Library

Install and add as a dependency:

    npm install --save yle-api

Simple usage example:

```js
const yleapi = require('yle-api');
const client = new yleapi.Client({
  appId: '[YOUR_APP_ID]',
  appKey: '[YOUR_APP_KEY]',
  decryptKey: '[YOUR_DECRYPT_KEY]'
});

client
  .fetchPrograms({q: 'Uutiset'})
  .then(response => {
    const programs = response.data;
    console.log(programs);
  });
```

All async methods return promises and can be sugared with async/await:

```js
(async function() {
  const programs = await client.getPrograms({q: 'Uutiset'});
  // ...
})();
```

The library has full TypeScript support. Enable typings support by using TypeScript important syntax:

```ts
import { Client } from 'yle-api';
```

TypeScript typings may not be completely accurate. Please, feel free to open a Pull Request if you
require a fix to build-in typings.
