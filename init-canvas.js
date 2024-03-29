var canvas = new fabric.Canvas('canvas', {
  width: window.innerWidth,
  height: window.innerHeight,
  backgroundColor: 'gray'
});

var bgScaledWidth = 0;
var bgScaledHeight = 0;

function AddImage() {

    if (localStorage.getItem('ImageUrl')) {
      if (!confirm('Use previous background URL?')) {
        localStorage.removeItem('ImageUrl')
      }
    }

    let ImageUrl = localStorage.getItem('ImageUrl') || prompt("Add a Image URL", "https://archinect.imgix.net/uploads/gx/gxaluhao99e4xpmv.jpg?auto=compress%2Cformat")

    localStorage.setItem('ImageUrl', ImageUrl)
    if (canvas && ImageUrl) {
      fabric.Image.fromURL(ImageUrl, (oImg) => {
          const widthRatio = canvas.width / oImg.width
          const heightRatio = canvas.height / oImg.height
          const maxRatio = Math.max(widthRatio, heightRatio)
          if (heightRatio > widthRatio) {
            oImg.scale(maxRatio)
          } else {
            oImg.set({
              scaleX: widthRatio,
              scaleY: heightRatio,
            })
          }
          canvas.setBackgroundImage(oImg, canvas.renderAll.bind(canvas))
          bgScaledWidth = oImg.getScaledWidth()
          bgScaledHeight = oImg.getScaledHeight()
          canvas.renderAll()
      })
    }
}
