import { decode } from "base64-arraybuffer";

const baseEndpointURL = "https://crypithm.com/api";

async function decryptBlob(key, iv, binary) {
  var decdata = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: iv },
    key,
    binary
  );
  return decdata;
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
    var foldersArr=[];
    if (jsn.Folders) {
      var decoder = new TextDecoder();
      for(var v=0;v<jsn.Folders.length;v++){
        var keysalt = decode(jsn.Folders[v].Name).slice(0, 16);
        var usedClientKey = await crypto.subtle.deriveKey(
          {
            name: "PBKDF2",
            salt: keysalt,
            iterations: 100000,
            hash: "SHA-256",
          },
          importedClientKey,
          { name: "AES-GCM", length: 256 },
          false,
          ["decrypt"]
        );
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
          type: "folder"
        }); 
      }
    }
    var filesArr=[];
    if (jsn.Files) {
      var decoder = new TextDecoder();
      for(var v=0;v<jsn.Files.length;v++){
        var keysalt = decode(jsn.Files[v].Name).slice(16, 32);
        var usedClientKey = await crypto.subtle.deriveKey(
          {
            name: "PBKDF2",
            salt: keysalt,
            iterations: 100000,
            hash: "SHA-256",
          },
          importedClientKey,
          { name: "AES-GCM", length: 256 },
          false,
          ["decrypt"]
        );
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
        }); 
      }
    }
    return[...foldersArr, ...filesArr]
  }
}
