import "server-only";

import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

/**
 * Retrieve and validate the AES-256 encryption key from the `ENCRYPTION_KEY` environment variable.
 *
 * @returns The decoded 32-byte encryption key as a `Buffer`.
 * @throws Error if `ENCRYPTION_KEY` is not set ("ENCRYPTION_KEY environment variable is not set").
 * @throws Error if the decoded key is not exactly 32 bytes ("ENCRYPTION_KEY must be 32 bytes (base64-encoded)").
 */
function getKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error("ENCRYPTION_KEY environment variable is not set");
  }
  const buf = Buffer.from(key, "base64");
  if (buf.length !== 32) {
    throw new Error("ENCRYPTION_KEY must be 32 bytes (base64-encoded)");
  }
  return buf;
}

/**
 * Encrypts a UTF-8 string using AES-256-GCM and returns a combined hex payload.
 *
 * @param plaintext - The UTF-8 text to encrypt
 * @returns A colon-delimited hex string in the format `ivHex:authTagHex:ciphertextHex`
 */
export function encrypt(plaintext: string): string {
  const key = getKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });

  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted.toString("hex")}`;
}

/**
 * Decrypts a colon-delimited AES-256-GCM payload and returns the plaintext.
 *
 * @param stored - A string in the format `ivHex:authTagHex:ciphertextHex`, where each component is hex-encoded
 * @returns The decrypted UTF-8 plaintext
 * @throws Error If `stored` does not contain an IV, authentication tag, and ciphertext (message: "Invalid encrypted value format")
 */
export function decrypt(stored: string): string {
  const key = getKey();
  const [ivHex, authTagHex, ciphertextHex] = stored.split(":");

  if (!ivHex || !authTagHex || !ciphertextHex) {
    throw new Error("Invalid encrypted value format");
  }

  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  const ciphertext = Buffer.from(ciphertextHex, "hex");

  const decipher = createDecipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });
  decipher.setAuthTag(authTag);

  return Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]).toString("utf8");
}

/**
 * Produce a shortened, obfuscated representation of an API key.
 *
 * @param key - The API key to mask
 * @returns `key` unchanged if its length is 4 or fewer, otherwise a masked string consisting of the first 3 characters, `...`, and the last 4 characters
 */
export function maskApiKey(key: string): string {
  if (key.length <= 4) {
    return key;
  }
  return `${key.slice(0, 3)}...${key.slice(-4)}`;
}
