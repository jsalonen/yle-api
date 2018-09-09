import {createCipheriv, createDecipheriv, randomBytes} from 'crypto'

const ALGORITHM = 'aes-128-cbc';

export function decrypt(encryptedData: string, encryptKey: string) {
  const encryptedBuffer = Buffer.from(encryptedData, 'base64').toString('hex');
  const iv = Buffer.alloc(16, encryptedBuffer.substr(0, 32), 'hex');
  const payload = Buffer.from(encryptedBuffer.substr(32), 'hex');  
  const decipher = createDecipheriv(ALGORITHM, encryptKey, iv);

  const decrypted = decipher.update(payload).toString() + decipher.final().toString();

  return decrypted;
}

export function encrypt(mediaUrl: string, decryptKey: string, iv?: string) {
  const ivHex = iv ? Buffer.from(iv, 'hex') : randomBytes(16);
  const encipher = createCipheriv(ALGORITHM, decryptKey, ivHex);

  const encrypted = Buffer.concat([
    ivHex,
    encipher.update(mediaUrl),
    encipher.final()
  ]);

  return encrypted.toString('base64');
}
