export function randInt(min, max) {
  var Rbfr = window.crypto.getRandomValues(new Uint32Array(1));

  let randNum = Rbfr[0] / (0xffffffff + 1);

  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(randNum * (max - min + 1)) + min;
}

export function randString(length) {
  var rtnVal = "";
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  for (var i = 0; i < length; i++) {
    rtnVal += chars[randInt(0, 61)];
  }
  return rtnVal;
}
