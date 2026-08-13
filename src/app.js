const $ = (s) => document.querySelector(s);

const state = {
  device: null,
  firmware: null,
  supportedTarget: false
};

function log(message, type = "info") {
  const line = `[${new Date().toLocaleTimeString("de-DE")}] ${type.toUpperCase()}: ${message}`;
  $("#log").textContent += `${line}\n`;
  $("#log").scrollTop = $("#log").scrollHeight;
}

function setConnection(connected, name = "—") {
  $("#connDot").classList.toggle("on", connected);
  $("#connectionState").textContent = connected ? "Verbunden" : "Nicht verbunden";
  $("#deviceName").textContent = name;
}

function updateRange(input, output, unit) {
  const render = () => output.value = `${input.value} ${unit}`;
  input.addEventListener("input", render);
  render();
}
updateRange($("#speed"), $("#speedOut"), "km/h");
updateRange($("#startSpeed"), $("#startSpeedOut"), "km/h");

function browserCheck() {
  if (!("bluetooth" in navigator)) {
    $("#browserWarning").textContent =
      "Web Bluetooth ist in diesem Browser nicht verfügbar. Nutze einen kompatiblen Chromium-Browser mit Bluetooth-Unterstützung.";
    $("#browserWarning").classList.remove("hidden");
    $("#connectBtn").disabled = true;
    log("Web Bluetooth API nicht verfügbar.", "warn");
    return false;
  }
  return true;
}

async function connectBluetooth() {
  if (!browserCheck()) return;

  try {
    log("Bluetooth-Geräteauswahl wird geöffnet …");
    // Intentionally broad name filter: this is only a discovery connection.
    // No write characteristic is guessed or used.
    const device = await navigator.bluetooth.requestDevice({
      filters: [
        { namePrefix: "Xiaomi" },
        { namePrefix: "Mi Scooter" },
        { namePrefix: "Mijia" }
      ],
      optionalServices: []
    });

    state.device = device;
    setConnection(true, device.name || "Unbenannt");
    log(`Verbunden/ausgewählt: ${device.name || "Unbenannt"}.`);

    device.addEventListener("gattserverdisconnected", () => {
      setConnection(false);
      log("Bluetooth-Verbindung getrennt.", "warn");
    });

    // Xiaomi Scooter 5 is deliberately not treated as a verified BLE OTA target.
    const n = (device.name || "").toLowerCase();
    if (n.includes("scooter 5") || n.includes("electric scooter 5")) {
      log("Xiaomi 5 erkannt. BLE-Flash bleibt aus Sicherheitsgründen gesperrt.", "warn");
    }
  } catch (err) {
    if (err?.name === "NotFoundError") {
      log("Geräteauswahl abgebrochen.", "warn");
      return;
    }
    log(`${err?.name || "Fehler"}: ${err?.message || err}`, "error");
  }
}

async function verifyFirmware() {
  const file = $("#firmwareFile").files[0];
  if (!file) {
    $("#firmwareInfo").textContent = "Keine Firmware-Datei ausgewählt.";
    return;
  }

  const buffer = await file.arrayBuffer();
  const hash = await crypto.subtle.digest("SHA-256", buffer);
  const sha = [...new Uint8Array(hash)].map(b => b.toString(16).padStart(2, "0")).join("");

  state.firmware = { name: file.name, size: file.size, sha256: sha };
  $("#firmwareInfo").textContent =
`Datei: ${file.name}
Größe: ${file.size.toLocaleString("de-DE")} Bytes
SHA-256: ${sha}

Status: Hash berechnet. Das beweist NICHT, dass die Firmware zum Xiaomi 5 Controller passt.`;
  log(`Firmware-Hash berechnet: ${sha}`);
}

$("#connectBtn").addEventListener("click", connectBluetooth);
$("#verifyFirmware").addEventListener("click", verifyFirmware);

$("#saveProfile").addEventListener("click", () => {
  const profile = {
    model: "Xiaomi Electric Scooter 5",
    region: $("#region").value,
    maxSpeedKmh: Number($("#speed").value),
    startSpeedKmh: Number($("#startSpeed").value),
    verifyBeforeFlash: $("#verify").checked,
    createdAt: new Date().toISOString()
  };
  localStorage.setItem("scooter-lab-profile", JSON.stringify(profile));
  log(`Profil gespeichert: ${profile.region}, ${profile.maxSpeedKmh} km/h.`);
});

$("#clearLog").addEventListener("click", () => $("#log").textContent = "");

const saved = localStorage.getItem("scooter-lab-profile");
if (saved) {
  try {
    const p = JSON.parse(saved);
    $("#region").value = p.region ?? "EU";
    $("#speed").value = p.maxSpeedKmh ?? 20;
    $("#startSpeed").value = p.startSpeedKmh ?? 3;
    $("#verify").checked = p.verifyBeforeFlash !== false;
    $("#speed").dispatchEvent(new Event("input"));
    $("#startSpeed").dispatchEvent(new Event("input"));
    log("Gespeichertes Profil geladen.");
  } catch {
    localStorage.removeItem("scooter-lab-profile");
  }
}

browserCheck();
log("Scooter Lab gestartet.");
