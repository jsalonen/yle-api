import { randomBytes } from 'crypto'
import { decrypt, encrypt } from './mediaurl'

const ENCRYPTED_URL = '8YdMEQewP5F/A5OpdoMWjvwYoCGab0W7Ihv0luSbfl+0pi7iDee3RmQnORzbj7GK0UxCNG+8V5Yiy5svLNdrng=='
const DECRYPTED_URL = 'http://example.com/file.m3u8?a=1~b=/c/d'
const IV = 'f1874c1107b03f917f0393a97683168e'
const KEY = '1234567890abcdef'
const INVALID_KEY = 'ffffffffffffffff'

describe('mediaurl', () => {
  describe('decrypt', () => {
    test('decrypts URL with given decrypt key', () => {
      const decryptedUrl = decrypt(ENCRYPTED_URL, KEY)
      expect(decryptedUrl).toBe(DECRYPTED_URL)
    })

    test('throws an error with invalid decrypt key', () => {
      expect(() => {
        const decryptedUrl = decrypt(ENCRYPTED_URL, INVALID_KEY)
      }).toThrow()
    })
  })

  describe('encrypt', () => {
    test('encrypts any given media URL', () => {
      const encryptedUrl = encrypt(DECRYPTED_URL, KEY, IV)

      expect(encryptedUrl).toBe(ENCRYPTED_URL)
    })

    test('generates a random initialization vector and uses it to encrypt any given URl', () => {
      const encrypted1 = encrypt(DECRYPTED_URL, KEY)
      const encrypted2 = encrypt(DECRYPTED_URL, KEY)

      expect(encrypted1).not.toBe(encrypted2)
    })
  })

  test('any encrypted data can be losslessly decrypted with any valid key and any valid iv', () => {
    const data = randomBytes(256).toString('hex')
    const key = randomBytes(8).toString('hex')

    const result = decrypt(encrypt(data, key), key)
    expect(data).toMatch(result)
  })
})
