//(c)2022 Oh Eunchong // AES-256-GCM binary: blob, key: cryptokey(256bits), iv: iv
export async function encryptBlob(binary, key, randomiv, iv) {
  var willUsedIV;
  if (randomiv) {
    willUsedIV = crypto.getRandomValues(new Uint8Array(16));
  } else {
    willUsedIV = iv;
  }
  var cryptdata = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: willUsedIV },
    key,
    binary
  );
  return cryptdata;
}

var finishedBits = new Uint8Array(file.length + 32);
export async function encryptAndUploadFile(file, offset, clientKey) {
  if(offset[1]==0){
    var keysalt = new Uint8Array(16);
    var clientKey = await crypto.subtle.deriveKey(
      { name: "PBKDF2", salt: keysalt, iterations: 100000, hash: "SHA-256" },
      clientKey,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );
  
    var Filekey = await crypto.subtle.generateKey();
  
    var FileKeyRaw = await crypto.subtle.exportKey("raw", Filekey);
    var keyIV = crypto.getRandomValues(new Uint8Array(16));
    var encryptedFileKey = await crypto.subtle.encrypt()
    var form = new FormData();
    form.append("fileSize", file.length + 32);
    form.append("fileName", file.name);
    form.append("chunkKey", encryptedFileKey);
    await fetch((url = "https://crypithm.com/api/startUpload"), {
      method: "POST",
      body: form,
    });
  }
}
