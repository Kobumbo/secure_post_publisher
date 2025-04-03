import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || '';
const IV_LENGTH = 16;

if (ENCRYPTION_KEY.length !== 64) {
    throw new Error('ENCRYPTION_KEY must be 64 characters long.');
}

// Derive a 32-byte key from the 64-character key using SHA-256
const derivedKey = crypto.createHash('sha256').update(ENCRYPTION_KEY).digest();

export function encrypt(text: string): string {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', derivedKey, iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
}

export function decrypt(encryptedText: string): string {
    const [iv, encrypted] = encryptedText.split(':');
    const decipher = crypto.createDecipheriv(
        'aes-256-cbc',
        derivedKey,
        Buffer.from(iv, 'hex')
    );
    let decrypted = decipher.update(Buffer.from(encrypted, 'hex'));
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}

const SALT_LENGTH = 16; // Salt length for PBKDF2
const KEY_LENGTH = 32; // Key length for AES-256
const ITERATIONS = 100_000; // PBKDF2 iterations for key derivation


export function encryptWithPassword(text: string, password: string): string {
    const salt = crypto.randomBytes(SALT_LENGTH); // Generate a random salt
    const iv = crypto.randomBytes(IV_LENGTH); // Generate a random initialization vector

    const key = crypto.pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, 'sha256');

    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return `${salt.toString('hex')}:${iv.toString('hex')}:${encrypted}`;
}


export function decryptWithPassword(encryptedText: string, password: string): string {
    const [saltHex, ivHex, encrypted] = encryptedText.split(':');
    if (!saltHex || !ivHex || !encrypted) {
        throw new Error('Invalid encrypted text format.');
    }

    const salt = Buffer.from(saltHex, 'hex');
    const iv = Buffer.from(ivHex, 'hex');

    
    const key = crypto.pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, 'sha256');

    
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
}
