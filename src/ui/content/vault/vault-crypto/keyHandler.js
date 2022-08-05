import { encode, decode } from "base64-arraybuffer";

/**
 *
 * @param {string} pw - user-input pw
 * @returns
 */

async function genKey(pw) {
  var fileKey = await crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
  var keyAb = await crypto.subtle.exportKey("raw", fileKey);
  var salt = crypto.getRandomValues(new Uint8Array(16));

  var enc = new TextEncoder();
  var rk = await crypto.subtle.importKey(
    "raw",
    enc.encode(pw),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );
  var usedClientKey = await crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: salt, iterations: 100000, hash: "SHA-256" },
    rk,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
  var iv1 = crypto.getRandomValues(new Uint8Array(16));
  var firstLayerEncryptedKeyData = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv1 },
    usedClientKey,
    keyAb
  );

  var salt2 = crypto.getRandomValues(new Uint8Array(16));
  var iv2 = crypto.getRandomValues(new Uint8Array(16));
  var sk = await crypto.subtle.importKey(
    "raw",
    enc.encode(localStorage.getItem("key")),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );
  var clientKey = await crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: salt2, iterations: 100000, hash: "SHA-256" },
    sk,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
  var secondLayerEncryptedKeyData = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv2 },
    clientKey,
    firstLayerEncryptedKeyData
  );
  var finalDta = new Uint8Array(
    secondLayerEncryptedKeyData.byteLength + 16 * 4
  );
  finalDta.set(iv1, 0);
  finalDta.set(salt, 16);
  finalDta.set(iv2, 32);
  finalDta.set(salt2, 48);
  finalDta.set(new Uint8Array(secondLayerEncryptedKeyData), 64);
  return encode(finalDta);
}

/**
 *
 * @param {string} pw - user-input pw
 * @returns
 */

export async function getKeyFromPw(pw) {
  var defaultAb = decode(localStorage.getItem("vault-str"));
  var iv2 = defaultAb.slice(0, 16);
  var salt2 = defaultAb.slice(16, 32);
  var iv1 = defaultAb.slice(32, 48);
  var salt = defaultAb.slice(48, 64);
  var doubleLayer = defaultAb.slice(64);
  var enc = new TextEncoder();
  var rk = await crypto.subtle.importKey(
    "raw",
    enc.encode(localStorage.getItem("key")),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );
  var usedClientKey = await crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: salt, iterations: 100000, hash: "SHA-256" },
    rk,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
  var singleLayer = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: iv1 },
    usedClientKey,
    doubleLayer
  );

  var rk = await crypto.subtle.importKey(
    "raw",
    enc.encode(pw),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );
  var pwKey = await crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: salt2, iterations: 100000, hash: "SHA-256" },
    rk,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );

  try {
    var peeled = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: iv2 },
      pwKey,
      singleLayer
    );
    if (peeled) {
      var str = await genKey(pw);
      localStorage.setItem("vault-str", str);
      return [true, peeled];
    }
    return [false];
  } catch (e) {
    return [false];
  }
}
