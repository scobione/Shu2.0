const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const catalog = {
    scooter: {
        Xiaomi: [
            "Electric Scooter 4",
            "Electric Scooter 4 Pro (2nd Gen)",
            "Electric Scooter 4 Lite",
            "Electric Scooter 5",
            "Electric Scooter 5 Pro",
            "Electric Scooter 5 Max",
            "Electric Scooter 5 Elite",
            "4 Ultra"
        ],
        "Segway-Ninebot": ["MAX G2", "F2 Pro", "G2D", "GT2"],
        NIU: ["KQi2 Pro", "KQi3 Pro", "KQi Air"],
        Navee: ["V50", "V40 Pro", "ST3", "ST3 Pro"]
    },
    bike: {
        Bosch: ["Smart System"]
    }
};

let transport = "";
let type = "";
let brand = "";
let model = "";
let safetyStep = 0;
let timer = null;


/* =========================
   NAVIGATION
========================= */

function showScreen(id) {
    $$(".screen").forEach((screen) => {
        screen.classList.remove("active");
    });

    const target = document.getElementById(id);

    if (target) {
        target.classList.add("active");
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


function log(message) {
    const box = $("#log");

    if (!box) {
        return;
    }

    box.textContent +=
        `[${new Date().toLocaleTimeString()}] ${message}\n`;

    box.scrollTop = box.scrollHeight;
}


/* =========================
   BLUETOOTH / KABEL
   WICHTIGER FIX
========================= */

$$("[data-transport]").forEach((button) => {

    button.addEventListener("click", () => {

        transport = button.dataset.transport || "";

        const status = $("#status");

        if (status) {
            status.textContent = transport;
        }

        /*
         * Nach dem Klick direkt zur
         * Fahrzeugauswahl wechseln.
         */
        showScreen("vehicle");

        log(
            "Verbindung gewählt: " +
            transport
        );
    });

});


/* =========================
   FAHRZEUGTYP
========================= */

$$("[data-type]").forEach((button) => {

    button.addEventListener("click", () => {

        type = button.dataset.type || "";

        const brands = $("#brands");

        if (!brands) {
            return;
        }

        if (!catalog[type]) {
            log(
                "Unbekannte Geräteklasse: " +
                type
            );
            return;
        }

        brands.innerHTML = "";

        Object.keys(catalog[type]).forEach(
            (brandName) => {

                const card =
                    document.createElement("button");

                card.type = "button";
                card.className = "tile";

                card.innerHTML = `
                    <b>
                        ${escapeHtml(brandName)}
                    </b>

                    <small>
                        ${catalog[type][brandName].length}
                        Modelle
                    </small>
                `;

                card.addEventListener(
                    "click",
                    () => {

                        brand = brandName;

                        const models = $("#models");

                        if (!models) {
                            return;
                        }

                        models.innerHTML = "";

                        catalog[type][brandName]
                            .forEach(
                                (modelName) => {

                                    const modelCard =
                                        document.createElement(
                                            "button"
                                        );

                                    modelCard.type =
                                        "button";

                                    modelCard.className =
                                        "tile";

                                    modelCard.innerHTML = `
                                        <b>
                                            ${escapeHtml(
                                                modelName
                                            )}
                                        </b>

                                        <small>
                                            Auswählen
                                        </small>
                                    `;

                                    modelCard.addEventListener(
                                        "click",
                                        () => {

                                            model =
                                                modelName;

                                            if ($("#title")) {
                                                $("#title")
                                                    .textContent =
                                                    model;
                                            }

                                            if ($("#subtitle")) {
                                                $("#subtitle")
                                                    .textContent =
                                                    `${brand} · ${transport}`;
                                            }

                                            showScreen(
                                                "dashboard"
                                            );

                                            log(
                                                `Modell gewählt: ${brand} ${model}`
                                            );
                                        }
                                    );

                                    models.appendChild(
                                        modelCard
                                    );
                                }
                            );

                        showScreen("model");
                    }
                );

                brands.appendChild(card);
            }
        );

        showScreen("brand");
    });

});


/* =========================
   ZURÜCK BUTTONS
========================= */

$$(".back").forEach((button) => {

    button.addEventListener("click", () => {

        const active =
            $(".screen.active");

        if (!active) {
            showScreen("transport");
            return;
        }

        switch (active.id) {

            case "vehicle":
                showScreen("transport");
                break;

            case "brand":
                showScreen("vehicle");
                break;

            case "model":
                showScreen("brand");
                break;

            case "dashboard":
                showScreen("model");
                break;

            default:
                showScreen("transport");
        }

    });

});


/* =========================
   BLUETOOTH / USB
========================= */

$("#connect")?.addEventListener(
    "click",
    async () => {

        try {

            /*
             * BLUETOOTH
             */

            if (transport === "Bluetooth") {

                if (!navigator.bluetooth) {

                    log(
                        "Web Bluetooth wird von diesem Browser nicht unterstützt."
                    );

                    return;
                }

                log(
                    "Bluetooth-Geräteauswahl wird geöffnet..."
                );

                const device =
                    await navigator.bluetooth
                        .requestDevice({
                            acceptAllDevices: true
                        });

                const name =
                    device.name ||
                    "Unbekannt";

                if ($("#conn")) {

                    $("#conn").textContent =
                        "BLE: " + name;
                }

                log(
                    "Bluetooth-Gerät ausgewählt: " +
                    name
                );

                return;
            }


            /*
             * KABEL / SERIAL
             */

            if (transport === "Kabel") {

                if (!navigator.serial) {

                    log(
                        "Web Serial wird von diesem Browser nicht unterstützt."
                    );

                    return;
                }

                log(
                    "USB/Serial-Portauswahl wird geöffnet..."
                );

                await navigator.serial
                    .requestPort();

                if ($("#conn")) {

                    $("#conn").textContent =
                        "USB-Serial-Port ausgewählt";
                }

                log(
                    "Serial-Port ausgewählt."
                );

                return;
            }


            log(
                "Bitte zuerst Bluetooth oder Kabel auswählen."
            );

        } catch (error) {

            if (
                error &&
                error.name === "NotFoundError"
            ) {

                log(
                    "Geräteauswahl abgebrochen."
                );

            } else {

                log(
                    "Verbindungsfehler: " +
                    (
                        error?.message ||
                        error
                    )
                );
            }
        }

    }
);


/* =========================
   FIRMWARE DATEI PRÜFEN
========================= */

$("#file")?.addEventListener(
    "change",
    async (event) => {

        const file =
            event.target.files?.[0];

        if (!file) {
            return;
        }

        try {

            const buffer =
                await file.arrayBuffer();

            const digest =
                await crypto.subtle.digest(
                    "SHA-256",
                    buffer
                );

            const hash =
                [...new Uint8Array(digest)]
                    .map(
                        (byte) =>
                            byte
                                .toString(16)
                                .padStart(2, "0")
                    )
                    .join("");

            if ($("#info")) {

                $("#info").textContent =
                    `${file.name}\n` +
                    `${file.size.toLocaleString(
                        "de-DE"
                    )} Bytes\n` +
                    `SHA-256: ${hash}`;
            }

            log(
                "Firmware-Datei lokal geprüft."
            );

        } catch (error) {

            log(
                "Firmwareprüfung fehlgeschlagen: " +
                (
                    error?.message ||
                    error
                )
            );
        }
    }
);


/* =========================
   SICHERHEITS-WIZARD
========================= */

const safety = {

    flash: [

        [
            "⚠️ ACHTUNG!",
            "Ein Firmware-Service kann ein Gerät beschädigen. Verwende nur exakt passende, rechtmäßig bezogene Firmware."
        ],

        [
            "🏁 EINSATZBEREICH",
            "Bestätige den rechtlich zulässigen Einsatzbereich. Die Software macht eine unzulässige Konfiguration nicht legal."
        ],

        [
            "🔋 STROM & VERBINDUNG",
            "Stabile Stromversorgung sicherstellen und eine Verbindung während eines autorisierten Updates nicht trennen."
        ],

        [
            "🛑 LETZTE KONTROLLE",
            "Modell, Hardware-Version, Firmware und Verbindung ein letztes Mal prüfen."
        ]

    ],

    reset: [

        [
            "↩️ ORIGINAL WIEDERHERSTELLEN",
            "Nur eine verifizierte Original-Firmware für exakt dieses Gerät verwenden."
        ],

        [
            "💾 BACKUP PRÜFEN",
            "Ohne verifiziertes Backup nicht fortfahren."
        ],

        [
            "🔌 VERBINDUNG PRÜFEN",
            "Stabile Stromversorgung und Verbindung sicherstellen."
        ],

        [
            "✅ LETZTE KONTROLLE",
            "Modell und Firmware vor einer Wiederherstellung erneut prüfen."
        ]

    ],

    police: [

        [
            "🚓 POLICE MODE",
            "Police Mode stellt die Oberfläche auf ein Original-/Kontrollprofil."
        ],

        [
            "🔒 ÄNDERUNGEN GESPERRT",
            "Während Police Mode aktiv ist, werden Profiländerungen in dieser Oberfläche gesperrt."
        ],

        [
            "📋 GERÄTEINFORMATIONEN",
            "Modell, Verbindung und Firmwareinformationen bleiben sichtbar."
        ],

        [
            "✅ AKTIVIEREN",
            "Police Mode wird lokal in der Web-App aktiviert."
        ]

    ]

};


/* =========================
   WIZARD ÖFFNEN
========================= */

function openWizard(kind) {

    const modal = $("#modal");

    if (!modal) {
        return;
    }

    if (!safety[kind]) {
        console.error(
            "Unbekannter Wizard:",
            kind
        );

        return;
    }

    safetyStep = 0;

    modal.dataset.kind = kind;

    modal.classList.remove(
        "hidden"
    );

    renderWizard();
}


/* =========================
   WIZARD RENDERN
========================= */

function renderWizard() {

    const modal = $("#modal");

    if (!modal) {
        return;
    }

    const kind =
        modal.dataset.kind;

    const pages =
        safety[kind];

    if (!pages) {
        return;
    }

    const page =
        pages[safetyStep];

    if ($("#mstep")) {

        $("#mstep").textContent =
            `SICHERHEIT ${
                safetyStep + 1
            }/${pages.length}`;
    }


    if ($("#mcontent")) {

        $("#mcontent").innerHTML = `

            <h2>
                ${escapeHtml(page[0])}
            </h2>

            <p>
                ${escapeHtml(page[1])}
            </p>

            <p>
                Gerät:
                <b>
                    ${escapeHtml(
                        brand || "nicht gewählt"
                    )}
                    ${escapeHtml(
                        model || ""
                    )}
                </b>
                <br>

                Verbindung:
                <b>
                    ${escapeHtml(
                        transport ||
                        "nicht gewählt"
                    )}
                </b>
            </p>
        `;
    }


    const ack = $("#ack");
    const next = $("#mnext");

    if (ack) {
        ack.checked = false;
    }

    if (next) {
        next.disabled = true;
    }


    clearInterval(timer);

    let remaining = 3;

    if ($("#countdown")) {

        $("#countdown")
            .textContent =
            `Bitte ${remaining} Sekunden warten…`;
    }


    timer =
        setInterval(() => {

            remaining--;

            if ($("#countdown")) {

                $("#countdown")
                    .textContent =
                    remaining > 0
                        ? `Bitte ${remaining} Sekunden warten…`
                        : "Bereit";
            }


            if (remaining <= 0) {

                clearInterval(
                    timer
                );

                if (next && ack) {

                    next.disabled =
                        !ack.checked;
                }
            }

        }, 1000);


    if (ack) {

        ack.onchange = () => {

            if (
                next &&
                $("#countdown")?.textContent ===
                    "Bereit"
            ) {

                next.disabled =
                    !ack.checked;
            }

        };
    }
}


/* =========================
   WIZARD SCHLIESSEN
========================= */

function closeWizard() {

    clearInterval(timer);

    const modal =
        $("#modal");

    if (modal) {

        modal.classList.add(
            "hidden"
        );
    }
}


/* =========================
   SERVICE BUTTON
========================= */

$("#prepare")?.addEventListener(
    "click",
    () => {

        openWizard(
            "flash"
        );

    }
);


/* =========================
   RESET
========================= */

$("#reset")?.addEventListener(
    "click",
    () => {

        openWizard(
            "reset"
        );

    }
);


/* =========================
   POLICE MODE
========================= */

$("#police")?.addEventListener(
    "click",
    () => {

        openWizard(
            "police"
        );

    }
);


/* =========================
   MODAL BUTTONS
========================= */

$("#mclose")?.addEventListener(
    "click",
    () => {

        closeWizard();

    }
);


$("#mback")?.addEventListener(
    "click",
    () => {

        if (safetyStep > 0) {

            safetyStep--;

            renderWizard();

        } else {

            closeWizard();

        }

    }
);


/* =========================
   WEITER
========================= */

$("#mnext")?.addEventListener(
    "click",
    () => {

        const modal =
            $("#modal");

        if (!modal) {
            return;
        }

        const kind =
            modal.dataset.kind;

        const pages =
            safety[kind];

        if (!pages) {
            return;
        }


        if (
            safetyStep <
            pages.length - 1
        ) {

            safetyStep++;

            renderWizard();

            return;
        }


        closeWizard();


        if (kind === "police") {

            if ($("#profile")) {

                $("#profile")
                    .textContent =
                    "🚓 POLICE MODE · ORIGINAL";
            }

            log(
                "Police Mode aktiviert."
            );

        } else if (
            kind === "reset"
        ) {

            if ($("#profile")) {

                $("#profile")
                    .textContent =
                    "↩ ORIGINAL · WIEDERHERSTELLUNG VORBEREITET";
            }

            log(
                "Original-Wiederherstellung vorbereitet."
            );

        } else {

            log(
                "Sicherheitsprüfung abgeschlossen."
            );

        }

    }
);


/* =========================
   HTML SICHER MACHEN
========================= */

function escapeHtml(value) {

    return String(
        value ?? ""
    )
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        )
        .replaceAll(
            '"',
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );
}


/* =========================
   STARTUP CHECK
========================= */

console.log(
    "Tuning Portal app.js loaded successfully."
);