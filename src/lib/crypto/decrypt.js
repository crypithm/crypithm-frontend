import { decode } from "base64-arraybuffer";
const mimeDB = require("mime-db");

//mime database by: jshttp
//(c)2022 Oh Eunchong

const baseEndpointURL = "https://crypithm.com/api";
const megabyte = 1048576;
async function decryptBlob(key, iv, binary) {
  var decdata = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: iv },
    key,
    binary
  );
  return decdata;
}

async function deriveCryptoKey(keyAB, salt) {
  return await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyAB,
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"]
  );
}

export async function getFileBlob(id, name, updateStatus) {
  var form = new FormData();
  form.append("id", id);
  var resp = await fetch(`${baseEndpointURL}/predown`, {
    headers: {
      Authorization: localStorage.getItem("tk"),
    },
    body: form,
    method: "POST",
  });
  var fileDetailJSON = await resp.json();
  var nameBinary = fileDetailJSON.Blobkey;

  var enc = new TextEncoder();
  var normalMountedKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(localStorage.getItem("key")),
    "PBKDF2",
    false,
    ["deriveKey", "deriveBits"]
  );

  var keysalt = decode(nameBinary).slice(16, 32);
  var usedClientKey = await deriveCryptoKey(normalMountedKey, keysalt);
  var Fullname = decode(nameBinary);
  var decryptedData = await decryptBlob(
    usedClientKey,
    Fullname.slice(0, 16),
    Fullname.slice(32)
  );
  var fileKey = await crypto.subtle.importKey(
    "raw",
    decryptedData,
    { name: "AES-GCM" },
    false,
    ["decrypt"]
  );
  var totalBlobList = [];
  var hmc = calchunk(fileDetailJSON.Size);

  var intArr = Array.from(Array(hmc).keys());
  const promises = intArr.map((i, _) =>
    sendAndDownloadData(
      fileDetailJSON.Token,
      5 * megabyte * i + 32 * i,
      5 * megabyte * (i + 1) + 32 * (i + 1),
      fileKey,
      updateStatus
    ).then((decData) => {
      var respAb = new Uint8Array(decData);
      totalBlobList[i] = new Blob([respAb]);
    })
  );
  await Promise.all(promises);

  var re = /\.[^.\\/:*?"<>|\r\n]+$/;
  var ext = re.exec(name)[0];
  ext = ext ? ext.split(".")[1] : ext;
  var Filemime = false;

  Object.keys(mimeDB).forEach((value, _) => {
    try {
      if (mimeDB[value]["extensions"].indexOf(ext) != -1) {
        Filemime = value;
      }
    } catch {}
  });

  var q = new Blob(totalBlobList, {
    type: Filemime ? Filemime : "application/octet-stream",
  });
  return [URL.createObjectURL(q), Filemime ? Filemime : "application/octet-stream"];
}

function calchunk(filelength) {
  var chunkcount;
  chunkcount = parseInt(filelength / (1024 * 1024 * 5));
  if (filelength % (1024 * 1024 * 5) > 0) {
    chunkcount = chunkcount + 1;
  }
  return chunkcount;
}

function sendAndDownloadData(token, startrange, endrange, fileKey, updateStatus) {
  return new Promise((resolve, _) => {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", `${baseEndpointURL}/download`);
    xhr.responseType = "arraybuffer";
    var form = new FormData();
    form.append("token", token);
    xhr.setRequestHeader("StartRange", startrange);
    xhr.setRequestHeader("EndRange", endrange);
    xhr.onprogress = (e) => {
      console.log(e.loaded)
      updateStatus()
    };
    xhr.onloadend = async () => {
      var data = await decryptBlob(
        fileKey,
        xhr.response.slice(0, 16),
        xhr.response.slice(16)
      );
      resolve(data);
    };
    xhr.send(form);
  });
}

export async function getAllFiledata(key) {
  var encoder = new TextEncoder();
  var stringKeyAb = encoder.encode(key);
  var importedClientKey = await crypto.subtle.importKey(
    "raw",
    stringKeyAb,
    "PBKDF2",
    false,
    ["deriveKey", "deriveBits"]
  );

  var resp = await fetch(`${baseEndpointURL}/dta`, {
    headers: {
      Authorization: localStorage.getItem("tk"),
    },
    method: "POST",
  });
  var jsn = await resp.json();
  if (jsn.Message != "Success") {
    console.error("fetcherror");
  } else {
    var foldersArr = [];
    if (jsn.Folders) {
      var decoder = new TextDecoder();
      for (var v = 0; v < jsn.Folders.length; v++) {
        var keysalt = decode(jsn.Folders[v].Name).slice(0, 16);
        var usedClientKey = await deriveCryptoKey(importedClientKey, keysalt);
        var Fullname = decode(jsn.Folders[v].Name);
        var decryptedData = await decryptBlob(
          usedClientKey,
          Fullname.slice(16, 32),
          Fullname.slice(32)
        );
        foldersArr.push({
          name: decoder.decode(decryptedData),
          date: jsn.Folders[v].Date,
          id: jsn.Folders[v].Id,
          type: "folder",
          dir: jsn.Folders[v].Index,
          size:0
        });
      }
    }
    var filesArr = [];
    if (jsn.Files) {
      var decoder = new TextDecoder();
      for (var v = 0; v < jsn.Files.length; v++) {
        var keysalt = decode(jsn.Files[v].Name).slice(16, 32);
        var usedClientKey = await deriveCryptoKey(importedClientKey, keysalt);
        var Fullname = decode(jsn.Files[v].Name);
        var decryptedData = await decryptBlob(
          usedClientKey,
          Fullname.slice(0, 16),
          Fullname.slice(32)
        );
        filesArr.push({
          name: decoder.decode(decryptedData),
          size: parseInt(jsn.Files[v].Size),
          date: "2022 1 19",
          id: jsn.Files[v].Id,
          thumb:
            "https://i1.sndcdn.com/avatars-zUGIpyyW010rJFrc-rdl0PQ-t240x240.jpg",
          completed: true,
          dir: jsn.Files[v].Dir,
        });
      }
    }
    return [...foldersArr, ...filesArr];
  }
}
