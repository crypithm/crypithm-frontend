//only returns codec compatable with mediasource

const MP4Box = require("mp4box");
let fileData = new Uint8Array(0);

export async function feed(fileu8) {
  fileData = new Uint8Array(fileu8);
}

export async function getMime() {
  return new Promise((resolve, reject) => {
    if (fileData.length < 200) {
      if (fileData.length == 0) {
        throw new Error("No file in queue. use feed() before calling");
      } else {
        throw new Error("Data too small");
      }
    } else {
      var mediaInfo = window.MediaInfo;
      mediaInfo()
        .then((MediaInfoInstance) => {
          return MediaInfoInstance.analyzeData(
            () => fileData.byteLength,
            () => fileData
          );
        })
        .then((mediaInfoJSON) => {
          var parsableProps = ["video", "audio"];
          var vidExt = mediaInfoJSON["media"]["track"][0]["Format"];
          if (vidExt === "MPEG-4") {
            const abl = fileData.buffer;
            abl.fileStart = 0;
            var mp4boxfile = MP4Box.createFile();
            mp4boxfile.onError = console.error;
            mp4boxfile.onReady = function (info) {
              var codecArr = [];
              info["tracks"]
                .filter((elem) => parsableProps.indexOf(elem["type"]) !== -1)
                .forEach((val) => codecArr.push(val.codec));
              resolve(
                `${
                  info.mime.split("codecs=")[0]
                }codecs="${codecArr}";profiles=${
                  info.mime.split("profiles=")[1]
                }`
              );
            };
            mp4boxfile.appendBuffer(abl);
            mp4boxfile.flush();
          } else {
            var codecArr = [];
            mediaInfoJSON["media"]["track"]
              .filter(
                (elem) =>
                  parsableProps.indexOf(elem["@type"].toLowerCase()) !== -1
              )
              .forEach((val) => {
                codecArr.push(val.Format.toLowerCase());
              });
          }
          resolve(`video/${vidExt.toLowerCase()}; codecs=${codecArr}`);
        });
    }
  });
}
