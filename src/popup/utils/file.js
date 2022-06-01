export default {
  getBase64ByBlob(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = function () {
        resolve(reader.result)
      }
      reader.readAsDataURL(blob)
    })
  },
}