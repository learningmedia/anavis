import color from 'color';

function getContrastColor(col) {
  return color(col).light() ? '#000' : '#FFF';
}

function blobToBuffer(blob) {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.onload = function () {
      if (fileReader.error) {
        reject(fileReader.error);
      } else {
        resolve(fileReader.result);
      }
    };
    fileReader.readAsArrayBuffer(blob);
  });
}

export default {
  getContrastColor,
  blobToBuffer
};
