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
    if (jsn.Files.length > 0) {
      var FinrtnArray = [];
      var decoder = new TextDecoder();
      jsn.Files.map(async (elem, _) => {
        var keysalt = decode(elem.Name).slice(16, 32);
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
        var Fullname = decode(elem.Name);
        var decryptedData = await decryptBlob(
          usedClientKey,
          Fullname.slice(0, 16),
          Fullname.slice(32)
        );
        FinrtnArray.push({
          name: decoder.decode(decryptedData),
          size: parseInt(elem.Size),
          date: "2022 1 19",
          id: elem.Id,
          thumb:
            "https://i1.sndcdn.com/avatars-zUGIpyyW010rJFrc-rdl0PQ-t240x240.jpg",
          completed: true,
        });
      });
      return FinrtnArray;
    }
  }
}
