const scene = document.getElementsByTagName("a-scene")[0];

const markers = ["red", "green", "blue"].map((color, i) => {
  const marker = document.createElement("a-marker");
  marker.setAttribute("type", "barcode");
  marker.setAttribute("value", i);
  marker.innerHTML = `<a-box position="0 0.5 0" color="${color}"></a-box`;
  return marker;
});

const markerBtn = document.getElementById("barcodebtn");
const markerContainer = document.getElementById("barcodecontainer");
const markerImg = document.getElementById("barcodeimg");
markerBtn.onclick = () => {
  markerContainer.classList.toggle("show-marker");
  if (markerContainer.classList.contains("show-marker")) {
    markerImg.setAttribute(
      "src",
      `barcodes/${Math.floor(Math.random() * 3)}.png`
    );
  }
};

scene.prepend(...markers);
