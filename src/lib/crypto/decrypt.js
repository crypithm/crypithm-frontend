import { decode } from "base64-arraybuffer";
import {getMime, feed} from "../utils/codec"
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
  if (folderJson.Message == "Success") {
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

export function getFileMime(name) {
  var Filemime;
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
  return Filemime;
}
export async function startVidStream(id, updateVidSrc) {
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
  async function startVid(){
    var totalChunks = calchunk(fileDetailJSON.Size);
    var mediaSource = new MediaSource();
    var u=URL.createObjectURL(mediaSource)
    updateVidSrc(u);
    mediaSource.addEventListener('sourceopen', function() {
      if (mediaSource.sourceBuffers.length > 0) return;

      var webmcodec=['video/webm; codecs="opus,vp9"','video/webm; codecs="av01.2.23M.12"']
      
      var mp4codec='video/mp4; codecs="avc1.4D0029,mp4a.40.2"'
      var sourceBuffer = mediaSource.addSourceBuffer(webmcodec[0]
      );
     function startGettingVidBinary(i) {
        sendAndDownloadData(
          fileDetailJSON.Token,
          5242912 * i,
          5242912 * (i+1),
          fileKey,
          fileDetailJSON.Size
        ).then(function(data){
          sourceBuffer.appendBuffer(new Uint8Array(data));
            if (totalChunks - 1 === i) {
              sourceBuffer.addEventListener('updateend',function(){
                if (!sourceBuffer.updating && mediaSource.readyState === "open") {
                  mediaSource.endOfStream();
                }
              })
            }else{
            startGettingVidBinary(++i);
            }
        })

      }
      startGettingVidBinary(0);
    });
    mediaSource.addEventListener('sourceended',function(){
      console.log("sourceended")
    })
  }
  startVid()
}
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

  var intArr = [0, 1, 2, 3, 4];
  var loops = parseInt(hmc / 5) + (hmc % 5 == 0 ? 0 : 1);
  for (var i = 0; i < loops; i++) {
    const promises = intArr.map(async (v) =>
      sendAndDownloadData(
        fileDetailJSON.Token,
        5242912 * (5 * i + v),
        5242912 * (5 * i + v + 1),
        fileKey,
        fileDetailJSON.Size,
        updateStatus
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
  return URL.createObjectURL(q)
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
  updateStatus
) {
  return new Promise((resolve, _) => {
    if (startrange > fileSize) {
      resolve();
    } else {
      var xhr = new XMLHttpRequest();
      xhr.open("POST", `${baseEndpointURL}/download`);
      xhr.responseType = "arraybuffer";
      var form = new FormData();
      form.append("token", token);
      xhr.setRequestHeader("StartRange", startrange);
      xhr.setRequestHeader("EndRange", endrange);
      xhr.onprogress = (e) => {};
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
  if (jsn.Message != "Success") {
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
            thumb:
              "https://i1.sndcdn.com/avatars-zUGIpyyW010rJFrc-rdl0PQ-t240x240.jpg",
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
