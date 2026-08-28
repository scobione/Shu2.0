#!/usr/bin/env python3
"""
Local bridge for Scooter Lab V3.

It intentionally delegates firmware patching/flashing to the upstream
ScooterTeam command-line tools rather than reimplementing their protocol.
Install the upstream repositories locally before enabling real flashing.

Expected local commands:
  python -m bwpatcher mi5 INPUT OUTPUT PATCHES
  python -m bwflasher [--port COMx] OUTPUT

The bridge binds to 127.0.0.1 only.
"""
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse
from pathlib import Path
import subprocess, tempfile, json, os, shutil, sys, cgi, html

ROOT=Path(__file__).resolve().parent.parent
HOST="127.0.0.1"; PORT=8765

def run(cmd, timeout=600):
    p=subprocess.run(cmd,capture_output=True,text=True,timeout=timeout,cwd=str(ROOT))
    return p.returncode,p.stdout,p.stderr

class Handler(BaseHTTPRequestHandler):
    def send_json(self, code, data):
        raw=json.dumps(data,ensure_ascii=False).encode()
        self.send_response(code); self.send_header("Content-Type","application/json; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin","*"); self.send_header("Content-Length",str(len(raw))); self.end_headers(); self.wfile.write(raw)
    def do_OPTIONS(self):
        self.send_response(204); self.send_header("Access-Control-Allow-Origin","*")
        self.send_header("Access-Control-Allow-Methods","GET,POST,OPTIONS")
        self.send_header("Access-Control-Allow-Headers","Content-Type"); self.end_headers()
    def do_GET(self):
        path=urlparse(self.path).path
        if path=="/api/health": return self.send_json(200,{"ok":True,"version":"v3"})
        if path=="/api/ports":
            try:
                import serial.tools.list_ports
                ports=[{"device":p.device,"description":p.description} for p in serial.tools.list_ports.comports()]
                return self.send_json(200,{"ok":True,"ports":ports})
            except Exception as e: return self.send_json(500,{"ok":False,"error":str(e)})
        return self.send_json(404,{"ok":False,"error":"Not found"})
    def do_POST(self):
        path=urlparse(self.path).path
        if path=="/api/patch": return self.patch()
        if path=="/api/flash": return self.flash()
        return self.send_json(404,{"ok":False,"error":"Not found"})
    def patch(self):
        ctype=self.headers.get("content-type","")
        if "multipart/form-data" not in ctype: return self.send_json(400,{"ok":False,"error":"multipart/form-data required"})
        fs=cgi.FieldStorage(fp=self.rfile,headers=self.headers,environ={"REQUEST_METHOD":"POST","CONTENT_TYPE":ctype})
        model=fs.getfirst("model","")
        patches=fs.getfirst("patches","")
        if model!="mi5": return self.send_json(400,{"ok":False,"error":"Only mi5 is enabled in this V3 build."})
        if not patches: return self.send_json(400,{"ok":False,"error":"No patches selected."})
        if "firmware" not in fs: return self.send_json(400,{"ok":False,"error":"No firmware file."})
        upload=fs["firmware"]
        if not upload.filename.lower().endswith(".bin"): return self.send_json(400,{"ok":False,"error":"Only .bin firmware is accepted."})
        td=Path(tempfile.mkdtemp(prefix="scooterlab_"))
        try:
            inp=td/"original.bin"; out=td/"patched.bin"
            inp.write_bytes(upload.file.read())
            cmd=[sys.executable,"-m","bwpatcher","mi5",str(inp),str(out),patches]
            rc,stdout,stderr=run(cmd)
            if rc!=0: return self.send_json(500,{"ok":False,"error":"bw-patcher failed","stdout":stdout,"stderr":stderr})
            # Keep output under a server-managed temp directory and expose only a token path.
            return self.send_json(200,{"ok":True,"model":model,"patches":patches,"output":str(out),"stdout":stdout,"stderr":stderr})
        except FileNotFoundError:
            return self.send_json(500,{"ok":False,"error":"bw-patcher is not installed. See SETUP.md."})
        except Exception as e: return self.send_json(500,{"ok":False,"error":str(e)})
    def flash(self):
        try: data=json.loads(self.rfile.read(int(self.headers.get("content-length","0"))))
        except Exception: return self.send_json(400,{"ok":False,"error":"Invalid JSON"})
        if data.get("model")!="mi5": return self.send_json(400,{"ok":False,"error":"Only mi5 is enabled."})
        port=data.get("port"); fw=data.get("firmware")
        if not port or not fw: return self.send_json(400,{"ok":False,"error":"port and firmware required"})
        fwpath=Path(fw).resolve()
        if not fwpath.exists() or fwpath.suffix.lower()!=".bin": return self.send_json(400,{"ok":False,"error":"Firmware path invalid"})
        # Delegate protocol handling to upstream bw-flasher.
        cmd=[sys.executable,"-m","bwflasher","--port",port,str(fwpath)]
        try: rc,stdout,stderr=run(cmd,timeout=900)
        except FileNotFoundError: return self.send_json(500,{"ok":False,"error":"bw-flasher is not installed. See SETUP.md."})
        return self.send_json(200 if rc==0 else 500,{"ok":rc==0,"returncode":rc,"stdout":stdout,"stderr":stderr})
    def log_message(self,*args): pass

if __name__=="__main__":
    print(f"Scooter Lab V3 Bridge: http://{HOST}:{PORT}")
    ThreadingHTTPServer((HOST,PORT),Handler).serve_forever()
