import {createCipheriv, createDecipheriv, randomBytes} from 'crypto'

const ALGORITHM = 'aes-128-cbc'
const IV_LENGTH = 16

export function decrypt(encryptedData: string, encryptKey: string) {
  const encryptedBuffer = Buffer.from(encryptedData, 'base64').toString('hex')
  const iv = Buffer.alloc(IV_LENGTH, encryptedBuffer.substr(0, IV_LENGTH * 2), 'hex')
  const payload = Buffer.from(encryptedBuffer.substr(IV_LENGTH * 2), 'hex')
  const decipher = createDecipheriv(ALGORITHM, encryptKey, iv)

  const decrypted = Buffer.concat([
    decipher.update(payload),
    decipher.final()
  ])

  return decrypted.toString()
}

export function encrypt(mediaUrl: string, decryptKey: string, iv?: string) {
  const ivHex = iv ? Buffer.from(iv, 'hex') : randomBytes(IV_LENGTH)
  const encipher = createCipheriv(ALGORITHM, decryptKey, ivHex)

  const encrypted = Buffer.concat([
    ivHex,
    encipher.update(mediaUrl),
    encipher.final()
  ])

  return encrypted.toString('base64')
}
