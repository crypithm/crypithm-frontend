import { encode } from "base64-arraybuffer";

const megabyte = 1048576;
const baseEndpointURL = "https://crypithm.com/api"


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
  //update Status==> await updateStatus(100, 0, ongoingFileId);
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
    ["encrypt"]
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

  var encryptedFileKeyArr = new Uint8Array(encryptedFileKey.byteLength + 32)
  encryptedFileKeyArr.set(keyIV,0)
  encryptedFileKeyArr.set(keysalt,16)
  encryptedFileKeyArr.set(new Uint8Array(encryptedFileKey),32)

  var fnIV = crypto.getRandomValues(new Uint8Array(16))
  var enc = new TextEncoder()

  var encryptedFileName = await encryptBlob(
    enc.encode(file.name),
    usedClientKey,
    false,
    fnIV
  )

  var encryptedFileNameArr = new Uint8Array(encryptedFileName.byteLength + 32)
  encryptedFileNameArr.set(fnIV,0)
  encryptedFileNameArr.set(keysalt,16)
  encryptedFileNameArr.set(new Uint8Array(encryptedFileName),32)
  console.log(encryptedFileName)
  var form = new FormData();

  form.append("fileSize", file.size + 32);
  form.append("fileName", encode(encryptedFileNameArr));
  form.append("chunkKey", encode(encryptedFileKeyArr));
  form.append("id",ongoingFileId)

  var resp = await fetch(`${baseEndpointURL}/pre`,{
    headers : {
      'Authorization': localStorage.getItem("tk")
    },
    method: "POST",
    body: form
  })
  var jsn = await resp.json()
  if (file.size < megabyte * 5) {
    await loopEncryptChunk([0, file.size],0);
  } else {
    
    await loopEncryptChunk([0, megabyte * 5],0);
  }
  var varForConcurrent = 0
  async function loopEncryptChunk(offset, previous) {
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
      var finishedBytes = new Uint8Array(encryptedBlobSlice.byteLength + 16);
      finishedBytes.set(iv, 0);
      finishedBytes.set(new Uint8Array(encryptedBlobSlice), 16);

      var Form = new FormData()
      Form.append("token",jsn.StatusMessage)
      Form.append("partialFileDta", new Blob([finishedBytes]))
      var xhr = new XMLHttpRequest()
      xhr.open("POST", `${baseEndpointURL}/upload`)
      xhr.setRequestHeader("StartRange",previous)
      
      var prevVal=0
      var prevloaded=0, nowloaded=0
      xhr.upload.onprogress=function(e){
        setTimeout(()=>{prevloaded = e.loaded},1000)
        nowloaded = e.loaded
        varForConcurrent += e.loaded - prevVal
        updateStatus((varForConcurrent/file.size)*100, Math.round(((nowloaded - prevloaded)/megabyte)*10)/10, ongoingFileId)
        prevVal=e.loaded
      }

      xhr.onloadend=function(){
        if(offset[1]>=file.size){
          console.log("ended")
        }
      }
      xhr.send(Form)

      if (offset[1] < file.size) {
        loopEncryptChunk([offset[1], offset[1] + megabyte * 5], previous+finishedBytes.byteLength);
      }
    };
    reader.readAsArrayBuffer(sliced);
  }
}
