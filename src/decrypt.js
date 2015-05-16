// Media URL decryption module
// Modified from: http://developer.yle.fi/static/decrypt-url.js
'use strict';

let CryptoJS = require('crypto-js/core');
require('crypto-js/cipher-core');
require("crypto-js/aes");
require('crypto-js/enc-base64');

module.exports = (url, decryptKey) => {
	var data = CryptoJS.enc.Base64.parse( url ).toString(CryptoJS.enc.Hex);
	var key = CryptoJS.enc.Utf8.parse( decryptKey ) ;
	var iv = CryptoJS.enc.Hex.parse( data.substr(0, 32) );
	var message = CryptoJS.enc.Hex.parse( data.substr(32) );

	var options = {
		iv: iv,
		mode: CryptoJS.mode.CBC,
		padding: CryptoJS.pad.Pkcs7
	};

	var params = CryptoJS.lib.CipherParams.create( {ciphertext: message} );
	var decryptedMessage = CryptoJS.AES.decrypt( params, key, options );
	return decryptedMessage.toString( CryptoJS.enc.Utf8 );
};
