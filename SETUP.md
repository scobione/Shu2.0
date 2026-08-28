# Scooter Lab V3 – Setup

## Was V3 macht

V3 ist eine Web-Oberfläche plus lokaler Python-Bridge.

- **bw-patcher** bleibt die eigentliche Firmware-Patch-Engine.
- **bw-flasher** bleibt die eigentliche UART-Flash-Engine.
- Der Browser macht UI, Datei-/Hash-Prüfung und Web-Serial-Port-Erkennung.
- Der lokale Bridge-Prozess startet die offiziellen Python-Module.

Das ist notwendig, weil eine reine GitHub-Pages-Webseite keine Python-Prozesse auf deinem PC starten darf.

## 1. Voraussetzungen

Windows 10/11:
- Python 3.10+
- USB-UART-Adapter passend zum Controller
- Chromium/Edge/Chrome für Web Serial
- Scooter sicher abgestellt

## 2. Upstream-Projekte installieren

PowerShell:

```powershell
git clone https://github.com/scooterteam/bw-patcher.git vendor/bw-patcher
git clone https://github.com/scooterteam/bw-flasher.git vendor/bw-flasher

py -m venv .venv
.\.venv\Scripts\Activate.ps1

py -m pip install --upgrade pip
py -m pip install -r vendor/bw-patcher/requirements.txt
py -m pip install -r vendor/bw-flasher/requirements.txt
py -m pip install -r bridge/requirements.txt

$env:PYTHONPATH="$PWD\vendor\bw-patcher;$PWD\vendor\bw-flasher"
```

## 3. Bridge starten

```powershell
$env:PYTHONPATH="$PWD\vendor\bw-patcher;$PWD\vendor\bw-flasher"
py bridge/server.py
```

Dann die `web/index.html` über einen lokalen HTTP-Server öffnen, z.B.:

```powershell
py -m http.server 8080 -d web
```

Browser:
`http://localhost:8080`

## 4. Wichtiger Punkt zu Firmware 2.5.3_0011.0013

Diese Versionsnummer ist in einem bw-flasher-Issue ausdrücklich dokumentiert; dort trat nach einem falschen Firmware-/Modell-Match Error 43 auf. Deshalb erzwingt V3 die Modellbestätigung und verwendet `mi5` als explizites Patcher-Ziel.

## 5. Patches

V3 gibt die ausgewählten Patch-Namen direkt an `bw-patcher` weiter.

Die genaue Patch-Verfügbarkeit ist abhängig von Mi5 + Firmwareversion. Wenn ein Patch vom Upstream-Patcher nicht unterstützt wird, wird der Vorgang abgebrochen und die Fehlermeldung angezeigt.

V3 erfindet keine Patchnamen und keine Firmware-Offsets.

## 6. Flash

Der Flash-Schritt wird ausschließlich an `bw-flasher` delegiert:

```text
python -m bwflasher --port COMx patched.bin
```

Die Bridge bindet nur an `127.0.0.1`.

## 7. Sicherheitsregeln

Vor dem Flash:
1. Original-Firmware sichern.
2. Modell-ID/Controller prüfen.
3. Firmware-Version prüfen.
4. Scooter nicht bewegen.
5. USB-Verbindung nicht unterbrechen.
6. Bei unbekanntem Fehler nicht erneut flashen, sondern Diagnose/Original-Firmware prüfen.

**Nicht automatisch auf 100 km/h flashen.** Die Oberfläche erlaubt bis 100 km/h als Profil-/Testwert, aber die tatsächliche zulässige Patch-Konfiguration kommt aus dem Upstream-Patcher für das konkrete Firmware-Image.
