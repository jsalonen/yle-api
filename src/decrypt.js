'use strict';

var crypto = require('crypto');

function decrypt(encryptedUrl, decryptKey) {
  // Decrypt Media URLs with node's built-in crypto module
  // For the reference implementation with Crypto-JS, see:
  // http://developer.yle.fi/static/decrypt-url.js

  var data = new Buffer(encryptedUrl, 'base64').toString('hex');
  var encryptdata = new Buffer(data.substr(32), 'hex').toString('binary');
  var ivBuffer = new Buffer(data.substr(0, 32), 'hex');
  var decryptKeyBuffer = new Buffer(decryptKey, 'utf8');

  var decipher = crypto.createDecipheriv('aes128', decryptKeyBuffer, ivBuffer);
  var decoded = decipher.update(encryptdata);
  decoded += decipher.final();

  return decoded;
}

module.exports = decrypt;

