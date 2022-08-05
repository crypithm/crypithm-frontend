import { importAndDeriveKeyFromRaw, encryptBlob } from "./encrypt";
import { decryptBlob } from "./decrypt";
import { encode, decode } from "base64-arraybuffer";

import { encode as urlenc, trim } from "url-safe-base64";
async function getEncrypted(binary, key, encryptLink, salt) {
  var iv = crypto.getRandomValues(new Uint8Array(16));
  var encryptedDta = await encryptBlob(binary, key, false, iv);
  var rtndta;
  if (encryptLink) {
    rtndta = new Uint8Array(encryptedDta.byteLength + 32);
    rtndta.set(iv, 0);
    rtndta.set(salt, 16);
    rtndta.set(new Uint8Array(encryptedDta), 32);
  } else {
    rtndta = new Uint8Array(encryptedDta.byteLength + 16);
    rtndta.set(iv, 0);
    rtndta.set(new Uint8Array(encryptedDta), 16);
  }
  return rtndta;
}
export async function shareFile(id, key, token, displayName, name) {
  const enc = new TextEncoder();
  var keyAb = decode(key);
  var usedClientKey = await importAndDeriveKeyFromRaw(
    localStorage.getItem("key"),
    keyAb.slice(16, 32)
  );
  var decryptedKeyData = await decryptBlob(
    usedClientKey,
    keyAb.slice(0, 16),
    keyAb.slice(32)
  );
  var tempKey = await crypto.subtle.generateKey(
    {
      name: "AES-GCM",
      length: 128,
    },
    true,
    ["encrypt", "decrypt"]
  );
  var exportedKey = await crypto.subtle.exportKey("raw", tempKey);
  var recryptKey = encode(await getEncrypted(decryptedKeyData, tempKey));
  var linkKey = trim(urlenc(encode(exportedKey)));
  var salt = crypto.getRandomValues(new Uint8Array(16));
  var newclientKey = await importAndDeriveKeyFromRaw(
    localStorage.getItem("key"),
    salt
  );
  var encryptedLink = encode(
    await getEncrypted(enc.encode(`${id}/${linkKey}`), newclientKey, true, salt)
  );
  var encryptedName = encode(await getEncrypted(enc.encode(name), tempKey));
  let form = new FormData();
  form.append("link", encryptedLink);
  form.append("name", encryptedName);
  form.append("shareId", id);
  form.append("token", token);
  form.append("Key", recryptKey);
  form.append("du", displayName);
  console.log(form);
  await fetch(`https://crypithm.com/api/share`, {
    headers: {
      Authorization: localStorage.getItem("tk"),
    },
    method: "PUT",
    body: form,
  });
  return `https://s.crypithm.com/${id}/${linkKey}`;
}
