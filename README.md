# Tuning Portal — Release

Professional UI foundation for a multi-device service portal.

## Flow
Bluetooth / Cable → E-Scooter / E-Bike → Brand → Model → Service.

Included:
- Xiaomi, Segway-Ninebot, NIU and Navee scooter catalog metadata
- Bosch → Smart System catalog metadata
- Web Bluetooth / Web Serial device selection where supported by the browser
- Local firmware SHA-256 inspection
- Multi-step safety wizard with warnings and 3-second countdowns
- Police Mode (local original/control profile)
- Reset/Original workflow (verification/preparation only)
- Separate firmware/original and firmware/patched directories
- GitHub static checks

## Important safety/technical scope

This public release does **not** contain proprietary manufacturer firmware/ISO/update
images, cryptographic keys, certificates, or undocumented flashing commands. It also does
not implement a speed/power unlock for Bosch Smart System or scooters.

The profile controls in the UI are intentionally non-flashing placeholders. A real
production adapter must use firmware you are legally entitled to use, verify the exact
hardware/firmware revision, create/verify a backup, and use documented or authorized
protocols.

### Local run

    python -m http.server 8080 -d web

Open `http://localhost:8080`.

Web Bluetooth/Web Serial normally require HTTPS or localhost.
