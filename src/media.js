'use strict';

var crypto = require('crypto');

function decrypt(message, key) {
  const data = new Buffer(message, 'base64').toString('hex');
  const payload = new Buffer(data.substr(32), 'hex');  
  const iv = new Buffer(data.substr(0, 32), 'hex');
  const decipher = crypto.createDecipheriv('aes128', key, iv);

  return decipher.update(payload) + decipher.final();
}

function encrypt(message, key, customIv) {
  const iv = new Buffer(customIv || crypto.randomBytes(16), 'hex');
  const encipher = crypto.createCipheriv('aes-128-cbc', key, iv);
  const crypted = Buffer.concat([
    iv,
    new Buffer(encipher.update(message), 'binary'),
    new Buffer(encipher.final())
  ]);

  return crypted.toString('base64');
}

module.exports = {
  decrypt: decrypt,
  encrypt: encrypt
};