import crypto from "node:crypto"
import { promisify } from "node:util";

const pbkdf2 = promisify(crypto.pbkdf2);

const PASSWORD_CONFIG = {
  iterations: 310000,
  keyLength: 32,
  digest: 'sha256'
};

async function hashPassword(password) {
  const salt = crypto.randomBytes(16);

  const hashedPassword = await pbkdf2(
    password,
    salt,
    PASSWORD_CONFIG.iterations,
    PASSWORD_CONFIG.keyLength,
    PASSWORD_CONFIG.digest
  );

  return {
    salt,
    hashedPassword
  };
}

async function verifyPassword(password, storedSalt, storedHash) {
  const salt = Buffer.from(storedSalt, "hex");
  const expectedHash = Buffer.from(storedHash,"hex");

  const suppliedHash = await pbkdf2(
    password,
    salt,
    PASSWORD_CONFIG.iterations,
    PASSWORD_CONFIG.keyLength,
    PASSWORD_CONFIG.digest
  );

  return (
    expectedHash.length === suppliedHash.length &&
    crypto.timingSafeEqual(expectedHash, suppliedHash)
  );
}

export {
  hashPassword,
  verifyPassword
};