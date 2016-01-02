var media = require('../../lib/media');

const ENCRYPTED_URL = '8YdMEQewP5F/A5OpdoMWjvwYoCGab0W7Ihv0luSbfl+0pi7iDee3RmQnORzbj7GK0UxCNG+8V5Yiy5svLNdrng==';
const DECRYPTED_URL = 'http://example.com/file.m3u8?a=1~b=/c/d';
const IV = 'f1874c1107b03f917f0393a97683168e';
const KEY = '1234567890abcdef';

describe('media', function() {
  describe('decrypt', function() {
    it('should decrypt URL with given decrypt key', function() {
      var decryptedUrl = media.decrypt(ENCRYPTED_URL, KEY);
      expect(decryptedUrl).toBe(DECRYPTED_URL);
    });
  });
  
  describe('encrypt', function() {
    it('should encrypt given media URL', function() {
      var encryptedUrl = media.encrypt(DECRYPTED_URL, KEY, IV);

      expect(encryptedUrl).toBe(ENCRYPTED_URL);
    });

    it('should generate random initialization vector if not given', function() {
      var encrypted1 = media.encrypt(DECRYPTED_URL, KEY);
      var encrypted2 = media.encrypt(DECRYPTED_URL, KEY);

      expect(encrypted1).not.toBe(encrypted2);
    });
  });
});
