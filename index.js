const characters = [
  "red",
  "green",
  "blue",
  "white",
  "black",
  "yellow",
  "purple",
  "darkorange",
  "magenta",
];
/**
 * @type Set<number>
 */
const idsInGame = new Set();
let playerId;

const scene = document.getElementsByTagName("a-scene")[0];
const markers = characters.map((color, i) => {
  const marker = document.createElement("a-marker");
  marker.setAttribute("type", "barcode");
  marker.setAttribute("markerhandler", true);
  marker.setAttribute("value", i);
  marker.innerHTML = `<a-box position="0 0.5 0" color="${color}"></a-box`;
  return marker;
});
scene.prepend(...markers);

function createGame() {
  playerId = Math.floor(Math.random() * characters.length);
}

let scanning = false;
/**
 *
 * @param {HTMLElement} joinButton
 */
function joinGame(joinButton) {
  scanning = !scanning;
  if (scanning) {
    playerId = undefined;
    joinButton.innerHTML = "Finish Scanning";
    joinButton.style = "color: red;";
    idsInGame.clear();
  } else {
    joinButton.innerHTML = "Join Game";
    joinButton.style = "color: black;";
    const remainingCharacters = characters
      .map((_, index) => index)
      .filter((id) => !idsInGame.has(id));
    console.log({ remainingCharacters });
    playerId =
      remainingCharacters[
        Math.floor(Math.random() * remainingCharacters.length)
      ];
  }
}

const barcodeContainer = document.getElementById("barcode-container");
const barcodeImg = document.getElementById("barcode-img");
const barcodeWarning = document.getElementById("warning");

/**
 *
 * @param {HTMLElement} toggleBarcode
 */
function toggleBarcode(toggleBarcode) {
  barcodeContainer.classList.toggle("show-barcode");
  if (barcodeContainer.classList.contains("show-barcode")) {
    toggleBarcode.innerHTML = "Hide Barcode";
    if (playerId !== undefined) {
      barcodeImg.setAttribute("src", `barcodes/${playerId}.png`);
      barcodeImg.style = "display: block;";
      barcodeWarning.style = "display: none;";
    } else {
      barcodeImg.style = "display: none;";
      barcodeWarning.style = "display: block;";
    }
  } else {
    toggleBarcode.innerHTML = "Show Barcode";
  }
}

console.log({ AFRAME });

AFRAME.registerComponent("markerhandler", {
  init: function () {
    /**
     * @type HTMLElement
     */
    const marker = this.el;

    marker.addEventListener("markerFound", function () {
      const markerValue = marker.getAttribute("value");
      idsInGame.add(+markerValue);
    });
  },
});
