const STORAGE_KEY = "vibranza_2026_points";
const HOUSE_NAMES = ["Yellow House", "Blue House", "Red House", "Green House"];
const $ = (id) => document.getElementById(id);
function getResults() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { return []; } }
function saveResults(results) { localStorage.setItem(STORAGE_KEY, JSON.stringify(results)); }
function esc(value) { return String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
function totalFor(house, rows=getResults()) { return rows.filter(r=>r.house===house).reduce((sum,r)=>sum+Number(r.points||0),0); }
function renderDashboard() {
  const rows=getResults();
  const total=rows.reduce((s,r)=>s+Number(r.points||0),0);
  const stats=$("stats");
  if(stats) stats.innerHTML=`<article class="stat"><span>Recorded Results</span><strong>${rows.length}</strong></article><article class="stat"><span>Total Points Awarded</span><strong>${total}</strong></article><article class="stat"><span>Houses</span><strong>4</strong></article>`;
  const houses=$("houses");
  if(houses) houses.innerHTML=HOUSE_NAMES.map((h,i)=>`<button class="house-card house-${i}" data-house="${h}"><span>${h}</span><strong>${totalFor(h,rows)} <small>pts</small></strong><em>View participants →</em></button>`).join("");
  if(houses) houses.querySelectorAll("[data-house]").forEach(btn=>btn.addEventListener("click",()=>showHouse(btn.dataset.house)));
  const recent=$("recentRows");
  if(recent) recent.innerHTML=rows.slice().sort((a,b)=>(b.createdAt||"").localeCompare(a.createdAt||"")).slice(0,8).map(r=>`<tr><td>${esc(r.date||"—")}</td><td>${esc(r.event)}</td><td>${esc(r.house)}</td><td>${esc(r.participant)}</td><td>${esc(r.rank)}</td><td>${esc(r.points)}</td></tr>`).join("") || '<tr><td colspan="6" class="muted">No results recorded yet.</td></tr>';
}
function showHouse(house) {
  const section=$("houseDetails"); if(!section) return;
  const rows=getResults().filter(r=>r.house===house);
  const people={}; rows.forEach(r=>{const key=r.participant; if(!people[key]) people[key]={name:key,regNo:r.regNo||"",points:0,events:[]}; people[key].points+=Number(r.points||0); people[key].events.push(r.event);});
  section.innerHTML=`<h2>${esc(house)} — Participant Points</h2><div class="table-wrap"><table><thead><tr><th>Participant</th><th>Register No.</th><th>Events</th><th>Total Points</th></tr></thead><tbody>${Object.values(people).map(p=>`<tr><td>${esc(p.name)}</td><td>${esc(p.regNo||"—")}</td><td>${esc(p.events.join(", "))}</td><td><strong>${p.points}</strong></td></tr>`).join("")||'<tr><td colspan="4" class="muted">No participants recorded for this house.</td></tr>'}</tbody></table></div>`;
}
function renderAdmin() {
  const body=$("adminRows"); if(!body) return;
  const rows=getResults().slice().sort((a,b)=>(b.createdAt||"").localeCompare(a.createdAt||""));
  body.innerHTML=rows.map(r=>`<tr><td>${esc(r.date||"—")}</td><td>${esc(r.event)}</td><td>${esc(r.house)}</td><td>${esc(r.participant)}</td><td>${esc(r.regNo||"—")}</td><td>${esc(r.rank)}</td><td>${esc(r.points)}</td><td><button class="btn tiny" data-edit="${r.id}">Edit</button> <button class="btn tiny danger" data-delete="${r.id}">Delete</button></td></tr>`).join("");
  $("emptyAdmin").textContent=rows.length?"":"No results added yet.";
  body.querySelectorAll("[data-edit]").forEach(b=>b.addEventListener("click",()=>editResult(b.dataset.edit)));
  body.querySelectorAll("[data-delete]").forEach(b=>b.addEventListener("click",()=>deleteResult(b.dataset.delete)));
}
function clearForm() { const f=$("resultForm"); if(!f)return; f.reset(); $("resultId").value=""; $("formTitle").textContent="Add Result"; }
function editResult(id) {
  const r=getResults().find(x=>x.id===id); if(!r)return;
  $("resultId").value=r.id; ["event","house","participant","regNo","rank","points","date","remarks"].forEach(k=>$(k).value=r[k]??"");
  $("formTitle").textContent="Edit Result"; window.scrollTo({top:0,behavior:"smooth"});
}
function deleteResult(id) { if(!confirm("Delete this result?"))return; saveResults(getResults().filter(r=>r.id!==id)); renderAll(); }
function renderAll(){renderDashboard();renderAdmin();}
document.addEventListener("DOMContentLoaded",()=>{
  renderAll();
  const form=$("resultForm");
  if(form) form.addEventListener("submit",e=>{
    e.preventDefault();
    const id=$("resultId").value;
    const item={id:id||((crypto.randomUUID&&crypto.randomUUID())||String(Date.now())),event:$("event").value.trim(),house:$("house").value,participant:$("participant").value.trim(),regNo:$("regNo").value.trim(),rank:$("rank").value,points:Number($("points").value),date:$("date").value,remarks:$("remarks").value.trim(),createdAt:new Date().toISOString()};
    const rows=getResults(); const idx=rows.findIndex(r=>r.id===id);
    if(idx>=0){item.createdAt=rows[idx].createdAt;rows[idx]=item;}else rows.push(item);
    saveResults(rows);clearForm();renderAll();
  });
  $("cancelEdit")?.addEventListener("click",clearForm);
  $("exportCsv")?.addEventListener("click",()=>{
    const rows=getResults(); const fields=["date","event","house","participant","regNo","rank","points","remarks"];
    const csv=[fields.join(","),...rows.map(r=>fields.map(k=>'"'+String(r[k]??"").replace(/"/g,'""')+'"').join(","))].join("\r\n");
    const url=URL.createObjectURL(new Blob(["\ufeff"+csv],{type:"text/csv;charset=utf-8;"}));
    const a=document.createElement("a");a.href=url;a.download="vibranza-house-points.csv";a.click();URL.revokeObjectURL(url);
  });
});