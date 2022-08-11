import { encode } from "base64-arraybuffer";
import { FileThumbnail } from "../utils/thumbnail";

const megabyte = 1048576;
const baseEndpointURL = "https://crypithm.com/api";

//(c)2022 Oh Eunchong

/**
 * encrypts blob with the given params
 * 
 * @param {arraybuffer} binary 
 * @param {cryptokey} key 
 * @param {boolean} randomiv - generate a random iv?
 * @param {Uint8Array} iv - (only if randomiv === false) => initialization vector value
 * @returns {Promise<arraybuffer>}
 */

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

/**
 * derives cryptokey from raw localstorage key string
 * 
 * @param {string} rawKeyBytes - localstorage key
 * @param {Uint8Array} keysalt - PBKDF2 salt
 * @returns {cryptokey}
 */

export async function importAndDeriveKeyFromRaw(rawKeyBytes, keysalt) {
  var enc = new TextEncoder();
  var importedClientKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(rawKeyBytes),
    "PBKDF2",
    false,
    ["deriveKey", "deriveBits"]
  );
  var usedClientKey = await crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: keysalt, iterations: 100000, hash: "SHA-256" },
    importedClientKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt","decrypt"]
  );

  return usedClientKey;
}

//data:binary
/**
 * creates a hash with the given params
 * 
 * @param {{name:string}} algo 
 * @param {arraybuffer} data 
 * @returns 
 */
export async function hashBinary(algo, data) {
  var digest = await window.crypto.subtle.digest(algo, data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function calchunk(filelength) {
  var chunkcount;
  chunkcount = parseInt(filelength / (1024 * 1024 * 5));
  if (filelength % (1024 * 1024 * 5) > 0) {
    chunkcount = chunkcount + 1;
  }
  return chunkcount;
}

export async function encryptAndUploadFile(
  file,
  clientKey,
  updateStatus,
  ongoingFileId,
  finishedUpload,
  directory
) {
  var keysalt = crypto.getRandomValues(new Uint8Array(16));
  var usedClientKey = await importAndDeriveKeyFromRaw(clientKey, keysalt);
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

  var encryptedFileKeyArr = new Uint8Array(encryptedFileKey.byteLength + 32);
  encryptedFileKeyArr.set(keyIV, 0);
  encryptedFileKeyArr.set(keysalt, 16);
  encryptedFileKeyArr.set(new Uint8Array(encryptedFileKey), 32);

  var fnIV = crypto.getRandomValues(new Uint8Array(16));
  var enc = new TextEncoder();

  var encryptedFileName = await encryptBlob(
    enc.encode(file.name),
    usedClientKey,
    false,
    fnIV
  );

  var encryptedFileNameArr = new Uint8Array(encryptedFileName.byteLength + 32);
  encryptedFileNameArr.set(fnIV, 0);
  encryptedFileNameArr.set(keysalt, 16);
  encryptedFileNameArr.set(new Uint8Array(encryptedFileName), 32);
  var form = new FormData();

  form.append("fileSize", file.size + 32);
  form.append("fileName", encode(encryptedFileNameArr));
  form.append("chunkKey", encode(encryptedFileKeyArr));
  form.append("id", ongoingFileId);
  form.append("dir", directory);

  var resp = await fetch(`${baseEndpointURL}/pre`, {
    headers: {
      Authorization: localStorage.getItem("tk"),
    },
    method: "POST",
    body: form,
  });
  var tA = [0, 1, 2, 3, 4];
  var jsn = await resp.json();
  if (file.size < megabyte * 5) {
    await loopEncryptChunk([0, file.size], 0);
  } else {
    var giantLoop =
      parseInt(calchunk(file.size) / 5) +
      (calchunk(file.size) % 5 == 0 ? 0 : 1);
    for (var i = 0; i < giantLoop; i++) {
      const promises = tA.map(async (v) => {
        await loopEncryptChunk(
          [megabyte * 5 * (5 * i + v), megabyte * 5 * (5 * i + v + 1)],
          5242912 * (5 * i + v)
        );
      });
      if (giantLoop - 1 == i) {
        await Promise.all(promises);
      } else {
        await Promise.any(promises);
      }
    }
  }
  await finishedUpload(ongoingFileId);
  var fullUploadedBytes = 0;
  async function loopEncryptChunk(offset, startFrom) {
    return new Promise((resolve, _) => {
      if (offset[0] > file.size) {
        resolve();
      } else {
        var qoffset = offset[1];
        if (offset[1] > file.size) {
          qoffset = file.size;
        }
        var sliced = file.slice(offset[0], qoffset);
        var reader = new FileReader();
        var iv = crypto.getRandomValues(new Uint8Array(16));
        reader.onloadend = async (slicedFile) => {
          var encryptedBlobSlice = await encryptBlob(
            slicedFile.target.result,
            Filekey,
            false,
            iv
          );
          var finishedBytes = new Uint8Array(
            encryptedBlobSlice.byteLength + 16
          );
          finishedBytes.set(iv, 0);
          finishedBytes.set(new Uint8Array(encryptedBlobSlice), 16);
          var Form = new FormData();
          Form.append("token", jsn.StatusMessage);
          Form.append("partialFileDta", new Blob([finishedBytes]));
          var xhr = new XMLHttpRequest();
          xhr.open("POST", `${baseEndpointURL}/upload`);
          xhr.setRequestHeader("StartRange", startFrom);

          var prevVal = 0,
            prevloaded = 0;
          xhr.upload.onprogress = (e) => {
            setTimeout(() => {
              prevloaded = e.loaded;
            }, 1000);
            updateStatus(
              e.loaded - prevVal,
              Math.round(((e.loaded - prevloaded) / megabyte) * 10) / 10,
              ongoingFileId,
              file.size
            );
            prevVal = e.loaded;
          };

          xhr.onloadend = function () {
            fullUploadedBytes += qoffset - offset[0];
            resolve();
          };
          xhr.send(Form);
        };
        reader.readAsArrayBuffer(sliced);
      }
    });
  }
}
