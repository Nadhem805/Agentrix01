// AES-256-GCM encryption for OAuth tokens stored in SQLite
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'node:crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 16
const SALT = 'agentrix-token-salt-v1'

function deriveKey(secret: string): string {
  return (scryptSync(secret, SALT, 32) as Buffer).toString('hex').slice(0, 32)
}

export function encrypt(plaintext: string, secret: string): string {
  const key = deriveKey(secret)
  const iv = randomBytes(IV_LENGTH).toString('hex').slice(0, IV_LENGTH)
  const cipher = createCipheriv(ALGORITHM, key, iv)
  const encrypted = cipher.update(plaintext, 'utf8', 'hex') + cipher.final('hex')
  const tag = cipher.getAuthTag().toString('hex')
  return `${iv}:${tag}:${encrypted}`
}

export function decrypt(ciphertext: string, secret: string): string {
  const key = deriveKey(secret)
  const [iv, tag, encrypted] = ciphertext.split(':')
  const decipher = createDecipheriv(ALGORITHM, key, iv)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  decipher.setAuthTag(tag as any)
  return decipher.update(encrypted, 'hex', 'utf8') + decipher.final('utf8')
}
