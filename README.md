# Scooter Lab

GitHub-ready Web-App für Diagnose, Profile und **sichere Prüfung** von Firmware-Dateien.

## Wichtiger Stand für Xiaomi Electric Scooter 5

Die App enthält absichtlich **keinen erfundenen Flash-Befehl** für den Xiaomi Electric Scooter 5.

Der aktuelle Open-Source-Stand, den dieses Projekt berücksichtigt, unterscheidet ältere Xiaomi/M365-Protokolle von neueren Brightway-Controllern. Für Brightway existieren Community-Projekte wie `bw-patcher` und `bw-flasher`, wobei `bw-flasher` ausdrücklich UART verwendet. Eine verifizierte Web-Bluetooth-OTA-Implementierung für den Xiaomi Electric Scooter 5 ist damit nicht belegt.

Deshalb kann diese Version:
- Web-Bluetooth-Geräteauswahl öffnen
- Verbindung/Disconnect erkennen
- Profile lokal speichern
- Firmware-Dateien auswählen
- SHA-256 lokal berechnen
- Xiaomi 5 als experimentelles Ziel markieren
- Flashen für Xiaomi 5 blockieren, solange kein verifiziertes BLE-OTA-Protokoll hinterlegt ist

Sie **sendet keine geratenen GATT-Write-Kommandos** und verhindert damit einen potenziell falschen Flash.

## Start

Für Web Bluetooth muss die Seite in einem sicheren Kontext laufen (`https` oder `localhost`).

Einfach lokal z.B. mit Python:

```bash
python3 -m http.server 8080
```

Dann Chromium/Chrome/Edge öffnen:

`http://localhost:8080`

## GitHub Pages

1. Repository anlegen.
2. Dateien hochladen.
3. Settings → Pages → Deploy from branch.
4. Branch `main`, Ordner `/root`.
5. Seite mit einem kompatiblen Chromium-Browser öffnen.

## Browser

Web Bluetooth ist browserabhängig. Wenn die API fehlt, zeigt die App einen Hinweis statt Fehler zu verschlucken.

## Sicherheitsprinzip

Bevor ein echter Xiaomi-5-Flasher implementiert wird, müssen mindestens folgende Punkte mit einem konkreten Controller/Firmwarestand belegt sein:

1. GATT Service UUID
2. RX/TX Characteristic UUIDs
3. Authentifizierung/Pairing
4. Bootloader/OTA-Handshake
5. Paketformat
6. Sequenznummern und ACKs
7. Checksumme/CRC
8. Image-/Board-ID
9. Firmware-Signatur/Integritätsprüfung
10. Recovery-/Abort-Verhalten

Ohne diese Informationen wäre ein "funktionierender" Flash-Code nur geraten.

## Quellen / weiterführend

- ScooterHacking Utility Wiki: https://wiki.scooterhacking.org/doku.php?id=shutility
- ScooterHacking CFW Builder: https://mi.cfw.sh/
- ScooterTeam Brightway Patcher/Flasher: https://github.com/scooterteam
- ScooterHacking Firmware Repository: https://github.com/scooterhacking/firmware

## Haftung

Nur eigene Geräte und kontrollierte Privatgelände verwenden. Firmware-Änderungen können Controller, Akku oder Scooter beschädigen. Keine Garantie auf Funktion oder Sicherheit.


## Warum nicht einfach 100 km/h flashen?

Die Oberfläche erlaubt bis 100 km/h als **Profil-/Testwert**, aber der Wert wird nicht an den Scooter übertragen.
Ein Speed-Limit ist keine reine UI-Einstellung: Motor, ESC, Batterie, Bremsen und Firmware müssen die Konfiguration unterstützen.
Ein blindes Schreiben von Bytes oder erfundenen GATT-Characteristics wäre ein reales Brick-Risiko.

Der aktuelle ScooterTeam-Stand nennt `bw-flasher` als **UART-Flasher** und `bw-patcher` als Brightway-Firmware-Patcher. Das Projekt macht daher bewusst keinen Fake-BLE-Flasher daraus.
