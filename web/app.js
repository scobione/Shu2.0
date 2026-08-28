const $=s=>document.querySelector(s);
const bridge="http://127.0.0.1:8765";
let firmware=null, patched=null;

function log(s){$("#log").textContent+=`[${new Date().toLocaleTimeString()}] ${s}\n`;$("#log").scrollTop=$("#log").scrollHeight}
async function api(path, opts={}) {
  const r=await fetch(bridge+path,{...opts,headers:{"Content-Type":"application/json",...(opts.headers||{})}});
  const data=await r.json().catch(()=>({ok:false,error:"Ungültige Bridge-Antwort"}));
  if(!r.ok||data.ok===false) throw new Error(data.error||`HTTP ${r.status}`);
  return data;
}
async function checkBridge(){
  try{const d=await api("/api/health");$("#status").textContent=`Bridge ${d.version}`;$("#status").className="pill ok";log("Local Bridge erreichbar.");return true}
  catch(e){$("#status").textContent="Bridge offline";$("#status").className="pill bad";log("Bridge nicht erreichbar: "+e.message);return false}
}
$("#bridgeBtn").onclick=checkBridge;

$("#fw").onchange=async e=>{
  const f=e.target.files[0]; firmware=f||null; $("#inspect").disabled=!f; $("#patch").disabled=!f;
  if(f) {$("#fwInfo").textContent=`${f.name} · ${f.size.toLocaleString("de-DE")} Bytes`;log("Firmware ausgewählt: "+f.name)}
};
$("#inspect").onclick=async()=>{
  if(!firmware)return;
  const b=await firmware.arrayBuffer();let h=await crypto.subtle.digest("SHA-256",b);
  let sha=[...new Uint8Array(h)].map(x=>x.toString(16).padStart(2,"0")).join("");
  $("#inspectOut").textContent=`SHA-256: ${sha}\nGröße: ${b.byteLength} Bytes\nHinweis: Hash allein bestätigt keine Mi5-Kompatibilität.`;
  log("Lokaler SHA-256 berechnet.");
};
$("#advanced").onchange=e=>$("#customPatches").disabled=!e.target.checked;

$("#patch").onclick=async()=>{
  if(!firmware)return;
  if(!await checkBridge())return;
  const fd=new FormData();fd.append("firmware",firmware);
  let speed=Number($("#speed").value), mss=Number($("#mss").value);
  let patches=[];
  if($("#advanced").checked) patches=$("#customPatches").value.split(",").map(x=>x.trim()).filter(Boolean);
  else {
    if($("#rfm").checked) patches.push("rfm");
    if($("#mssOn").checked) patches.push(`mss=${mss}`);
  }
  fd.append("model","mi5"); fd.append("patches",patches.join(","));
  try{
    const r=await fetch(bridge+"/api/patch",{method:"POST",body:fd});
    const d=await r.json(); if(!r.ok||!d.ok) throw new Error(d.error||"Patch fehlgeschlagen");
    patched=d.output; $("#patchOut").textContent=`Output: ${d.output}\nPatches: ${d.patches}\nModel: ${d.model}`;
    log("bw-patcher erfolgreich ausgeführt."); await loadPorts();
  }catch(e){$("#patchOut").textContent=e.message;log("Patch-Fehler: "+e.message)}
};

async function loadPorts(){
  try{const d=await api("/api/ports");$("#port").innerHTML='<option value="">Port auswählen …</option>';
  d.ports.forEach(p=>{let o=document.createElement("option");o.value=p.device;o.textContent=`${p.device} — ${p.description}`;$("#port").append(o)});
  log(`${d.ports.length} COM-Port(s) gefunden.`)}catch(e){log("Port-Suche: "+e.message)}
}
$("#ports").onclick=loadPorts;

$("#serialBtn").onclick=async()=>{
  if(!("serial" in navigator)){log("Web Serial wird von diesem Browser nicht unterstützt.");return}
  try{const p=await navigator.serial.requestPort();await p.open({baudRate:115200});log("Web Serial Port geöffnet. V3 nutzt ihn nur zur Browser-/Portprüfung.");await p.close()}catch(e){log("Web Serial: "+e.message)}
};

function updateFlash(){ $("#flash").disabled=!(patched && $("#port").value && $("#confirmModel").checked && $("#confirmFile").checked && $("#confirmGround").checked); }
["port","confirmModel","confirmFile","confirmGround"].forEach(id=>$( "#"+id).addEventListener("change",updateFlash));

$("#flash").onclick=async()=>{
  if(!patched)return;
  if(!confirm("Letzte Prüfung: Mi5-Controller identifiziert, Original gesichert und korrekte Firmware gewählt?"))return;
  try{
    const d=await api("/api/flash",{method:"POST",body:JSON.stringify({port:$("#port").value,firmware:patched,model:"mi5"})});
    $("#flashOut").textContent=d.output||"Flash-Aufruf abgeschlossen.";
    log("Flash-Prozess beendet. Prüfe den Rückgabestatus sorgfältig.");
  }catch(e){$("#flashOut").textContent=e.message;log("Flash-Fehler: "+e.message)}
};
checkBridge();
