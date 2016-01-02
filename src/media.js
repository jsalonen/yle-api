'use strict';

var crypto = require('crypto');

function decrypt(message, key) {
  // Decrypt Media URLs with node's built-in crypto module
  // For the reference implementation with Crypto-JS, see:
  // http://developer.yle.fi/static/decrypt-url.js
  var data = new Buffer(message, 'base64').toString('hex');
  var encryptdata = new Buffer(data.substr(32), 'hex').toString('binary');
  var ivBuffer = new Buffer(data.substr(0, 32), 'hex');
  var decryptKeyBuffer = new Buffer(key, 'utf8');

  var decipher = crypto.createDecipheriv('aes128', decryptKeyBuffer, ivBuffer);
  var decoded = decipher.update(encryptdata);
  decoded += decipher.final();

  return decoded;
}

function encrypt(message, key, iv) {
  var ivBuffer = new Buffer(iv || crypto.randomBytes(16).toString('hex'), 'hex');
  var decryptKeyBuffer = new Buffer(key, 'utf-8').toString('binary');
  var encipher = crypto.createCipheriv('aes-128-cbc', decryptKeyBuffer, ivBuffer.toString('binary'));
  var encryptdata = encipher.update(message);

  var crypted = Buffer.concat([
    new Buffer(ivBuffer, 'hex'),
    new Buffer(encryptdata, 'binary'),
    new Buffer(encipher.final())
  ]);

  return crypted.toString('base64');
}

module.exports = {
  decrypt: decrypt,
  encrypt: encrypt
};