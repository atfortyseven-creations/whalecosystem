import { ethers } from 'ethers';

/**
 * Derives a symmetric encryption key from a wallet signature.
 * This ensures that only the user who can sign the specific "Access" message can decrypt the data.
 * @param signature - The signature produced by the wallet (e.g., from personal_sign)
 * @param salt - A random salt ensuring uniqueness per file/vault (optional but recommended)
 */
async function deriveKey(signature: string, salt: string = "omega-vault-salt"): Promise<CryptoKey> {
    const enc = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey(
        "raw",
        enc.encode(signature),
        { name: "PBKDF2" },
        false,
        ["deriveKey"]
    );

    return window.crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: enc.encode(salt),
            iterations: 100000,
            hash: "SHA-256"
        },
        keyMaterial,
        { name: "AES-GCM", length: 256 },
        true,
        ["encrypt", "decrypt"]
    );
}

/**
 * Encrypts a JSON object into a safe binary blob using AES-GCM.
 */
export async function encryptVault(data: any, signer: ethers.Signer | any): Promise<{ encryptedData: Uint8Array, iv: Uint8Array, signature: string }> {
    const message = "Allow Access to Sovereign Vault";
    
    // 1. Get User Signature (The "Key")
    // If using wagmi or ethers, adjust accordingly. 
    // Ideally use personal_sign to avoid broadcasting a transaction
    const signature = await signer.signMessage(message);

    // 2. Derive AES Key
    const key = await deriveKey(signature);

    // 3. Encrypt
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encodedData = new TextEncoder().encode(JSON.stringify(data));

    const encryptedContent = await window.crypto.subtle.encrypt(
        {
            name: "AES-GCM",
            iv: iv
        },
        key,
        encodedData
    );

    return {
        encryptedData: new Uint8Array(encryptedContent),
        iv: iv,
        signature // The user needs to re-generate this to decrypt, but we don't store it with the data usually. 
                  // In this flow, we might return it just for session caching.
    };
}

/**
 * Decrypts the vault data.
 * The user must provide the signature again (proving ownership) to derive the key.
 */
export async function decryptVault(encryptedData: Uint8Array, iv: Uint8Array, signature: string): Promise<any> {
    const key = await deriveKey(signature);

    try {
        const decryptedContent = await window.crypto.subtle.decrypt(
            {
                name: "AES-GCM",
                iv: iv
            },
            key,
            encryptedData
        );

        const decoded = new TextDecoder().decode(decryptedContent);
        return JSON.parse(decoded);
    } catch (e) {
        throw new Error("Failed to decrypt Sovereign Vault. Invalid Signature or Corrupted Data.");
    }
}

