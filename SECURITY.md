# Security notes

Do not add undocumented UUIDs, firmware offsets, signing bypasses, or guessed OTA commands.

A scooter firmware flasher should reject:
- unknown model/board
- unknown firmware target
- mismatched image metadata
- invalid checksum/hash
- unsupported bootloader
- disconnected/unstable transport

Never automatically write to BMS firmware. Battery-controller modifications can create serious hardware and fire hazards.
