import { heroes } from './assets.js';

const LOCAL_STORAGE_KEY = "pickedHeroes";
const PICKED_HEROES_TTL_IN_MS = 300000; // 5 minutes

/**
 * @type Set<number>
 */
const idsInGame = new Set();
let playerId;

/**
 * Gets heroes from localStorage that where picked already
 * @return {number[]} Array of ids
 */
function getPickedHeroes() {
  const pickedHeroes = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY));
  if (!pickedHeroes) {
    return [];
  }
  if (
    pickedHeroes.expireAt < Date.now() ||
    pickedHeroes.ids.length === heroes.length
  ) {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    return [];
  }
  return pickedHeroes.ids;
}

/**
 *
 * @param {number} id - playerId
 */
function setPlayerIdInPickedHeroes(id) {
  const pickedHeroes = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY));
  if (!pickedHeroes) {
    localStorage.setItem(
      LOCAL_STORAGE_KEY,
      JSON.stringify({
        expireAt: Date.now() + PICKED_HEROES_TTL_IN_MS,
        ids: [id],
      })
    );
  } else {
    pickedHeroes.ids = [...pickedHeroes.ids, id];
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(pickedHeroes));
  }
}

const scene = document.getElementsByTagName("a-scene")[0];
const markers = heroes.map((hero, i) => {
  const { rotation, scale, gltfModel, width, height, src } = hero;
  const marker = document.createElement("a-marker");
  marker.setAttribute("type", "barcode");
  marker.setAttribute("markerhandler", true);
  marker.setAttribute("value", i);
  if (src) {
    marker.innerHTML = `<a-image rotation="-90 0 0" width="${width}" height="${height}" src="${src}"></a-image>`;
  } else {
    const binScale = scale
      .split(" ")
      .map((n) => n * 2)
      .join(" ");
    marker.innerHTML = `<a-entity rotation="${rotation}" scale="${binScale}" gltf-model="${gltfModel}"></a-entity>`;
  }
  return marker;
});
scene.prepend(...markers);

let showHowToPlay = true;
function howToPlay() {
  if (!showHowToPlay) {
    return;
  }
  showHowToPlay = false;
  window.notie.select(
    {
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
    `,
      position: "bottom",
      choices: [
        {
          type: "success",
          text: "Show game QR code",
          handler: () => {
            showHowToPlay = true;
            showGameQRCode();
          },
        },
        {
          type: "neutral",
          text: "About",
          handler: () => {
            showHowToPlay = true;
            showAbout();
          },
        },
      ],
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

function showAbout() {
  window.notie.force({
    type: "info",
    text: `
      <p>This app was developed during BEST Hackathon 2021</p>
      <hr/>
      <p><b>Team:</b></p>
      <ul>
        <li><a href="http://strdr4605.github.io" target="_blank">Dragoș Străinu</a></li>
        <li><a href="https://www.behance.net/cazacucostel" target="_blank">Costel Cazacu</a></li>
        <li><a href="https://www.linkedin.com/in/chebac-grigore-378524223/" target="_blank">Grigore Chebac</a></li>
        <li><a href="https://www.instagram.com/kstaty.art/" target="_blank">Nikita Dobrovenco</a></li>
      </ul>
      <iframe
          src="https://ghbtns.com/github-btn.html?user=strdr4605&repo=whoami-ar&type=star&count=true"
          frameBorder="0"
          scrolling="0"
          width="110"
          height="20"
          title="GitHub"
        ></iframe>
    `,
    position: "bottom",
  });
}

async function promiseNotieConfirm(options) {
  return new Promise((resolve, reject) => {
    window.notie.confirm(options, resolve, reject);
  })
    .then(() => true)
    .catch(() => false);
}

const joinBtn = document.getElementById("join");

async function createGame() {
  if (playerId) {
    const shouldRestart = await promiseNotieConfirm({
      text: "<b>You have a character selected! Are you sure that you want to create a game?</b>",
      position: "bottom",
    });
    if (!shouldRestart) {
      return;
    }
  }

  const pickedHeroes = getPickedHeroes();
  const remainingCharacters = heroes
    .map((_, index) => index)
    .filter((id) => !pickedHeroes.includes(id));
  playerId =
    remainingCharacters[Math.floor(Math.random() * remainingCharacters.length)];
  setPlayerIdInPickedHeroes(playerId);

  window.notie.alert({
    type: "success",
    text: "<b>Character selected, show Barcode for others to join</b>",
    time: 5,
    position: "bottom",
  });

  // clean Join Button
  joinBtn.innerHTML = "Join Game";
  joinBtn.style = "color: white;";
  scanning = false;

  if (barcodeContainer.classList.contains("show-barcode")) {
    toggleBarcode(document.getElementById("barcodebtn"));
  }
}

let scanning = false;
/**
 *
 * @param {HTMLElement} joinButton
 */
async function joinGame(joinButton) {
  scanning = !scanning;
  if (scanning) {
    if (playerId) {
      const shouldRestart = await promiseNotieConfirm({
        text: "<b>You have a character selected! Are you sure that you want to start scanning?</b>",
        position: "bottom",
      });
      if (!shouldRestart) {
        scanning = false;
        return;
      }
    }

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

    if (barcodeContainer.classList.contains("show-barcode")) {
      toggleBarcode(document.getElementById("barcodebtn"));
    }
  } else {
    if (idsInGame.size === 0) {
      window.notie.alert({
        type: "error",
        text: "<b>No Barcodes scanned, try scanning other players Barcodes, or create a game.</b>",
        time: 5,
        position: "bottom",
      });
      scanning = true;
      return;
    }
    joinButton.innerHTML = "Join Game";
    joinButton.style = "color: white;";
    const pickedHeroes = getPickedHeroes();
    const remainingCharacters = heroes
      .map((_, index) => index)
      .filter((id) => !idsInGame.has(id) || !pickedHeroes.includes(id));
    playerId =
      remainingCharacters[
        Math.floor(Math.random() * remainingCharacters.length)
      ];
    setPlayerIdInPickedHeroes(playerId);

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
    toggleBarcode.innerHTML = '<img src="icons/reconnect-icon_camera.svg">';
    if (playerId !== undefined) {
      barcodeImg.setAttribute("src", `barcodes/${playerId}.png`);
      barcodeImg.style = "display: block;";
      barcodeWarning.style = "display: none;";
    } else {
      barcodeImg.style = "display: none;";
      barcodeWarning.style = "display: block;";
    }
  } else {
    toggleBarcode.innerHTML = '<img src="icons/reconnect-icon_barcode.svg">';
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
      if (scanning) {
        window.notie.alert({
          type: "success",
          text: "<b>Character scanned, scan other players Barcode or Finish scanning</b>",
          time: 5,
          position: "bottom",
        });
      }
    });
  },
});
