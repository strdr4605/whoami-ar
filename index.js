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

let showHowToPlay = true;
function howToPlay() {
  if (!showHowToPlay) {
    return;
  }
  showHowToPlay = false;
  window.notie.force(
    {
      type: "info",
      text: `
      <h2>WHO AM I</h2>
      <h3>Augmented Reality edition</h3>
      <p>This is a multiplayer game.</p>
      <p>
        You can create or join a game.
        After your character was randomly selected you can show the Barcode to other players.
      </p>
      <h4>
        After all player have generated Barcodes, you can start asking
        <i>YES</i> or <i>NO</i> questions.
      </h4>
      <p>If answer to your question about the character is <b>YES</b> you can ask again.</p>
      <p>If answer is <b>NO</b> then next player asks questions.</p>
      <button onclick="showGameQRCode()">Show game QR code</button>
    `,
      position: "bottom",
    },
    () => {
      showHowToPlay = true;
    }
  );
}

function showGameQRCode() {
  window.notie.force({
    type: "info",
    text: `
      <h2>Let other players join by scanning the QR code</h2>
      <img id="app-url" src="app-url.png">
    `,
    position: "bottom",
  });
}

function createGame() {
  playerId = Math.floor(Math.random() * characters.length);
  window.notie.alert({
    type: "success",
    text: "<b>Character selected, click Show Barcode for others to join</b>",
    time: 5,
    position: "bottom",
  });
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
    window.notie.alert({
      type: "info",
      text: "<b>Scan other players Barcodes, then press 'Finish Scanning' button</b>",
      stay: true,
      position: "bottom",
    });
  } else {
    joinButton.innerHTML = "Join Game";
    joinButton.style = "color: black;";
    const remainingCharacters = characters
      .map((_, index) => index)
      .filter((id) => !idsInGame.has(id));
    playerId =
      remainingCharacters[
        Math.floor(Math.random() * remainingCharacters.length)
      ];
    window.notie.alert({
      type: "success",
      text: "<b>Character selected, show your Barcode to other players</b>",
      position: "bottom",
    });
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
