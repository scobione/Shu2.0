# Scooter Lab V3

Web UI für den Brightway-Workflow des Xiaomi Electric Scooter 5 (Mi5).

Aktueller Zielstand:
- Modell: `mi5`
- vom Nutzer genannte Firmware: `2.5.3_0011.0013`

V3 nutzt die offiziellen Open-Source-Projekte von ScooterTeam als Engines:
- bw-patcher: https://github.com/scooterteam/bw-patcher
- bw-flasher: https://github.com/scooterteam/bw-flasher

Der Patcher unterstützt Mi5. Der Flasher arbeitet über UART. V3 baut darum einen lokalen Python-Bridge-Prozess zwischen Web-UI und den Upstream-Engines.

## Warum nicht nur GitHub Pages?

GitHub Pages kann HTML/JS ausliefern, aber keinen lokalen Python-Flasher starten. Daher:
Browser → localhost Bridge → bw-patcher/bw-flasher → USB-UART → Scooter.

## Lizenz

Die Upstream-Projekte haben eigene Lizenzen und bleiben separat. V3 enthält keine kopierten Upstream-Quellen; sie werden beim Setup aus den Original-Repositories installiert. Prüfe deren Lizenzbedingungen vor Weitergabe.

## Sicherheit

Firmware-Modifikation kann Controller und Scooter beschädigen. Falsches Modell/Firmware-Matching kann zu Fehlern führen. Upstream-Projekte warnen ausdrücklich vor diesen Risiken.
