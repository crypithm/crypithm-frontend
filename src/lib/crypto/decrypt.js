import { decode } from "base64-arraybuffer";
const mimeDB = require("mime-db");

const baseEndpointURL = "https://crypithm.com/api";
const megabyte = 1048576;

export async function decryptBlob(key, iv, binary) {
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

/**
 *
 * @param {string} key - localstorage key
 * @returns {{name:string,dir:string,id:string}} - object containing the requested folders' info
 */

export async function getFolders(key) {
  var encoder = new TextEncoder();
  var stringKeyAb = encoder.encode(key);
  var importedClientKey = await crypto.subtle.importKey(
    "raw",
    stringKeyAb,
    "PBKDF2",
    false,
    ["deriveKey", "deriveBits"]
  );
  var form = new FormData();
  form.append("action", "getOnlyFolder");
  var fetchData = await fetch(`${baseEndpointURL}/dta`, {
    headers: {
      Authorization: localStorage.getItem("tk"),
    },
    method: "POST",
    body: form,
  });
  var folderJson = await fetchData.json();
  if (folderJson.Message === "Success") {
    var data = [];
    for (var i = 0; i < folderJson.Folders.length; i++) {
      var dec = new TextDecoder();
      var keysalt = decode(folderJson.Folders[i].Name).slice(0, 16);
      var usedClientKey = await deriveCryptoKey(importedClientKey, keysalt);
      var Fullname = decode(folderJson.Folders[i].Name);
      var decryptedData = await decryptBlob(
        usedClientKey,
        Fullname.slice(16, 32),
        Fullname.slice(32)
      );
      data.push({
        name: dec.decode(decryptedData),
        dir: folderJson.Folders[i].Index,
        id: folderJson.Folders[i].Id,
      });
    }
    return data;
  }
}

/**
 *
 * @param {string} name - file name
 * @returns {string|false}
 */

export function getFileMime(name) {
  var Filemime;
  var re = /\.[^.\\/:*?"<>|\r\n]+$/;
  var ext = re.exec(name)[0];
  ext = ext ? ext.split(".")[1] : ext;
  var Filemime = false;
  Object.keys(mimeDB).forEach((value, _) => {
    try {
      if (mimeDB[value]["extensions"].indexOf(ext) !== -1) {
        Filemime = value;
      }
    } catch {}
  });
  return Filemime;
}

/**
 *
 * @param {string} id
 * @param {string} Filemime
 * @param {Function} updateStatus
 * @returns {Promise<string>} - blob url of file
 */
export async function getFileBlob(id, Filemime, updateStatus) {
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

  let dnStates = [];
  function updateLoadingState(index, size) {
    dnStates[index] = size;
    console.log(dnStates);
    let sum = 0;
    dnStates.forEach((itm) => (sum += itm));
    updateStatus((100 * sum) / fileDetailJSON.Size);
  }
  var intArr = [0, 1, 2, 3, 4];
  var loops = Math.floor(hmc / 5) + (hmc % 5 === 0 ? 0 : 1);
  for (var i = 0; i < loops; i++) {
    const promises = intArr.map(async (v) =>
      sendAndDownloadData(
        fileDetailJSON.Token,
        5242912 * (5 * i + v),
        5242912 * (5 * i + v + 1),
        fileKey,
        fileDetailJSON.Size,
        fileDetailJSON.Rqid,
        updateLoadingState,
        5 * i + v
      ).then((decData) => {
        var respAb = new Uint8Array(decData);
        totalBlobList[5 * i + v] = new Blob([respAb]);
      })
    );

    await Promise.all(promises);
  }

  var q = new Blob(totalBlobList, {
    type: Filemime ? Filemime : "application/octet-stream",
  });
  return URL.createObjectURL(q);
}

function calchunk(filelength) {
  var chunkcount;
  chunkcount = parseInt(filelength / (1024 * 1024 * 5));
  if (filelength % (1024 * 1024 * 5) > 0) {
    chunkcount = chunkcount + 1;
  }
  return chunkcount;
}

function sendAndDownloadData(
  token,
  startrange,
  endrange,
  fileKey,
  fileSize,
  subdomain,
  updateState,
  index
) {
  return new Promise((resolve, _) => {
    if (startrange > fileSize) {
      resolve();
    } else {
      var xhr = new XMLHttpRequest();
      xhr.open("POST", `https://${subdomain}.crypithm.com/download`);
      xhr.responseType = "arraybuffer";
      var form = new FormData();
      form.append("token", token);
      xhr.setRequestHeader("StartRange", startrange);
      xhr.setRequestHeader("EndRange", endrange);
      xhr.onprogress = (e) => {
        updateState(index, e.loaded);
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
    }
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
  window.User = jsn.Username;
  if (jsn.Message !== "Success") {
    console.error("fetcherror");
  } else {
    var foldersArr = [];
    if (jsn.Folders) {
      var decoder = new TextDecoder();
      for (var v = 0; v < jsn.Folders.length; v++) {
        try {
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
            size: 0,
          });
        } catch (e) {
          console.error(
            "An error occured while decrypting folder: " + jsn.Folders[v].Id
          );
        }
      }
    }
    var filesArr = [];
    if (jsn.Files) {
      var decoder = new TextDecoder();
      for (var v = 0; v < jsn.Files.length; v++) {
        try {
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
            thumb: "",
            completed: true,
            dir: jsn.Files[v].Dir,
          });
        } catch (e) {
          console.error(
            "An error occured while decrypting file: " + jsn.Files[v].Id
          );
        }
      }
    }
    return [...foldersArr, ...filesArr];
  }
}
