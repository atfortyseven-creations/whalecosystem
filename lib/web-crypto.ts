export async function generateX25519KeyPair() {
  const keyPair = (await crypto.subtle.generateKey({ name: 'X25519' }, true, ['deriveKey', 'deriveBits'])) as CryptoKeyPair;
  const pubRaw = await crypto.subtle.exportKey('raw', keyPair.publicKey);
  const privRaw = await crypto.subtle.exportKey('raw', keyPair.privateKey);
  return {
    publicKey: arrayBufferToBase64(pubRaw),
    privateKey: arrayBufferToBase64(privRaw),
  };
}

export async function deriveSharedSecret(privateKeyB64: string, publicKeyB64: string) {
  const priv = await crypto.subtle.importKey('raw', base64ToArrayBuffer(privateKeyB64), { name: 'X25519' }, false, ['deriveBits']);
  const pub = await crypto.subtle.importKey('raw', base64ToArrayBuffer(publicKeyB64), { name: 'X25519' }, false, []);
  return await crypto.subtle.deriveBits({ name: 'X25519', public: pub }, priv, 256);
}

export async function encryptAESGCM(sharedSecret: ArrayBuffer, data: string) {
  const key = await crypto.subtle.importKey('raw', sharedSecret, { name: 'AES-GCM' }, false, ['encrypt']);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(data));
  return {
    encryptedPayload: arrayBufferToBase64(encrypted),
    iv: arrayBufferToBase64(iv),
    tag: arrayBufferToBase64(encrypted.slice(encrypted.byteLength - 16)), // último tag
  };
}

export async function decryptAESGCM(sharedSecret: ArrayBuffer, encryptedPayload: string, ivB64: string) {
  const key = await crypto.subtle.importKey('raw', sharedSecret, { name: 'AES-GCM' }, false, ['decrypt']);
  const iv = base64ToArrayBuffer(ivB64);
  const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, base64ToArrayBuffer(encryptedPayload));
  return new TextDecoder().decode(decrypted);
}

function arrayBufferToBase64(buffer: ArrayBuffer | Uint8Array) {
  const u8 = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < u8.length; i++) {
    binary += String.fromCharCode(u8[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64: string) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}
