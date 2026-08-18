import { safeStorage } from 'electron'
import path from 'node:path'
import fs from 'node:fs'

// FOR THE LOVE OF GOD, DO NOT SHIP THIS CODE
const API_KEY_ENCRYPTION_LOCATION = path.join(__dirname, 'secure_key.dat');
const USERNAME_STORAGE = path.join(__dirname, 'username.dat')

/**
 * Saves the user's encrypted API key to disk. NOTE: The saved location is vulnerable, change
 * before shipping
 * 
 * @param key The API key for the user's account
 */
const saveAPIKey = (key: string): void => {
    if (!safeStorage.isEncryptionAvailable()) throw new Error('Encryption is not supported on this device.');

    const encryptedBuffer = safeStorage.encryptString(key);

    fs.writeFileSync(API_KEY_ENCRYPTION_LOCATION, encryptedBuffer)
}

const saveUsername = (username: string): void => {
    if (!safeStorage.isEncryptionAvailable()) throw new Error('Encryption is not supported on this device.');
    const encryptedBuffer = safeStorage.encryptString(username)
    fs.writeFileSync(USERNAME_STORAGE, encryptedBuffer)
}

/**
 * 
 * Gets the user's encrypted API key from disk.
 * 
 * @returns If the API key has been saved, it is returned; null otherwise.
 */
const getAPIKey = (): string | null => {

    if (!fs.existsSync(API_KEY_ENCRYPTION_LOCATION)) return null;

    const encryptedBuffer = fs.readFileSync(API_KEY_ENCRYPTION_LOCATION);

    const decryptedKey = safeStorage.decryptString(encryptedBuffer)

    return decryptedKey;
}

const getUsername = (): string | null => {
    if (!fs.existsSync(API_KEY_ENCRYPTION_LOCATION)) return null;

    const encryptedBuffer = fs.readFileSync(USERNAME_STORAGE)
    const decryptedUsername = safeStorage.decryptString(encryptedBuffer)
    return decryptedUsername;
}

export {saveAPIKey, getAPIKey, saveUsername, getUsername}