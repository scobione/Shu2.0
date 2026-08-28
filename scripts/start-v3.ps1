$ErrorActionPreference="Stop"
$root=Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $root
if (!(Test-Path ".venv\Scripts\python.exe")) {
  py -m venv .venv
  .\.venv\Scripts\python.exe -m pip install -r bridge\requirements.txt
}
if (!(Test-Path "vendor\bw-patcher") -or !(Test-Path "vendor\bw-flasher")) {
  Write-Host "Bitte zuerst SETUP.md Schritt 2 ausführen."
  exit 1
}
$env:PYTHONPATH="$root\vendor\bw-patcher;$root\vendor\bw-flasher"
Start-Process powershell -ArgumentList "-NoExit","-Command","Set-Location '$root'; `$env:PYTHONPATH='$root\vendor\bw-patcher;$root\vendor\bw-flasher'; py bridge/server.py"
py -m http.server 8080 -d web
