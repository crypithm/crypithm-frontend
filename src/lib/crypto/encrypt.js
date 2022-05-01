
const megabyte = 1048576;

//(c)2022 Oh Eunchong
// (AES-256-GCM) binary: blob, key: cryptokey(256bits), iv: iv
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

//data:binary
export async function hashBinary(algo, data) {
  var digest = await window.crypto.subtle.digest(algo, data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function encryptAndUploadFile(
  file,
  clientKey,
  updateStatus,
  ongoingFileId
) {
  await updateStatus(100, 0, ongoingFileId);
  var keysalt = crypto.getRandomValues(new Uint8Array(16));
  var enc = new TextEncoder();
  var importedClientKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(clientKey),
    "PBKDF2",
    false,
    ["deriveKey", "deriveBits"]
  );
  var usedClientKey = await crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: keysalt, iterations: 100000, hash: "SHA-256" },
    importedClientKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );

  var Filekey = await crypto.subtle.generateKey(
    {
      name: "AES-GCM",
      length: 256,
    },
    true,
    ["encrypt", "decrypt"]
  );

  var FileKeyRaw = await crypto.subtle.exportKey("raw", Filekey);
  var keyIV = crypto.getRandomValues(new Uint8Array(16));
  var encryptedFileKey = await encryptBlob(
    FileKeyRaw,
    usedClientKey,
    false,
    keyIV
  );
  var form = new FormData();
  form.append("fileSize", file.size + 32);
  form.append("fileName", file.name);
  form.append("chunkKey", encryptedFileKey);

  if (file.size < megabyte * 5) {
    await loopEncryptChunk([0, file.size]);
  } else {
    await loopEncryptChunk([0, megabyte * 5]);
  }

  async function loopEncryptChunk(offset) {
    var finishedBytes = new Uint8Array(offset[1] - offset[0] + 16);
    var sliced = file.slice(offset[0], offset[1]);
    var reader = new FileReader();
    var iv = crypto.getRandomValues(new Uint8Array(16));
    reader.onloadend = async (slicedFile) => {
      var encryptedBlobSlice = await encryptBlob(
        slicedFile.target.result,
        Filekey,
        false,
        iv
      );
      finishedBytes.set(iv, 0);
      finishedBytes.set(encryptedBlobSlice, 16);
      if (offset[1] < file.size) {
        loopEncryptChunk([offset[1], offset[1] + megabyte * 5]);
      }
    };
    reader.readAsArrayBuffer(sliced);
  }
}
