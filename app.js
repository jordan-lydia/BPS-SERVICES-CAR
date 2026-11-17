(function () {
"use strict";
const $ = id => document.getElementById(id);
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const RATE = 2300;
const PR = [["Moins de 15 000 $",0,15000],["15 000 – 25 000 $",15000,25000],["25 000 – 40 000 $",25000,40000],["Plus de 40 000 $",40000,1e12]];
const TAGN = {n:"Nouveau", p:"Promo", x:"Premium", neuf:"Neuf"};
let db = null, V = [], S = {whatsapp:"243000000000", phone:"", email:""}, cur = "USD", demo = false;
let f = {make:"",model:"",price:"",type:"",steer:"",y1:"",y2:"",city:"",q:"",ref:"",tab:"all"};
let slidesData = []; // Pour le carrousel dynamique
let chartInstance = null; // Pour le graphique

const wa = t => "https://wa.me/" + String(S.whatsapp).replace(/\D/g,"") + "?text=" + encodeURIComponent(t);
const money = p => cur === "USD" ? "$" + Number(p).toLocaleString("en-US") : Math.round(p * RATE).toLocaleString("fr-FR") + " FC";
const norm = r => Object.assign({}, r, {ref: "BPS-" + String(r.ref_no).padStart(4,"0"), tags: r.tags || [], price: Number(r.price)});
const uniq = (k, list) => [...new Set((list || sale()).map(v => v[k]).filter(Boolean))].sort();
const sale = () => V.filter(v => v.mode === "vente" && v.available);
const rent = () => V.filter(v => v.mode === "location" && v.available);
const fill = (id, first, vals) => { $(id).innerHTML = "<option value=''>" + first + "</option>" + vals.map(v => "<option>" + esc(v) + "</option>").join(""); };

// ---------- Données ----------
async function load() {
  try {
    if (!window.supabase) throw new Error("bibliothèque Supabase absente");
    db = db || window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    
    // Suivi des visites (Insertion asynchrone)
    db.from("visits").insert({ page: "home" }).then();

    const [a, b, c] = await Promise.all([
      db.from("vehicles").select("*").order("created_at", {ascending:false}),
      db.from("settings").select("*").eq("id", 1).maybeSingle(),
      db.from("carousel").select("*").order("position", {ascending:true})
    ]);
    if (a.error) throw a.error;
    V = a.data.map(norm); 
    if (b.data) S = b.data; 
    if (c.data) slidesData = c.data;
    demo = false;
  } catch (e) { console.warn("Mode démo :", e.message || e); V = FALLBACK.map(norm); demo = true; }
  $("demo").hidden = !demo;
}

// ---------- Site public ----------
function match(v) {
  if (f.make && v.make !== f.make) return 0; if (f.model && v.model !== f.model) return 0;
  if (f.type && v.body_type !== f.type) return 0; if (f.steer && v.steering !== f.steer) return 0;
  if (f.city && v.city !== f.city) return 0;
  if (f.y1 && v.year < +f.y1) return 0; if (f.y2 && v.year > +f.y2) return 0;
  if (f.price) { const p = PR[+f.price]; if (v.price < p[1] || v.price >= p[2]) return 0; }
  if (f.q && (v.make + " " + v.model).toLowerCase().indexOf(f.q.toLowerCase()) < 0) return 0;
  if (f.ref && v.ref.toLowerCase() !== f.ref.toLowerCase()) return 0;
  if (f.tab !== "all" && !v.tags.includes(f.tab)) return 0; return 1;
}
function card(o) {
  const d = document.createElement("article"); d.className = "card";
  d.innerHTML = `<div class="pic">${o.tag ? `<span class="tag">${esc(o.tag)}</span>` : ""}${o.img ? `<img src="${esc(o.img)}" alt="${esc(o.title)}" loading="lazy">` : `<svg viewBox="0 0 400 130" aria-hidden="true"><use href="#car"/></svg>`}</div><div class="body"><h3>${esc(o.title)}</h3><div class="meta">${o.meta}</div><div class="price">${o.price}</div><a class="btn fill" target="_blank" rel="noopener" href="${esc(o.link)}">${esc(o.label)}</a></div>`;
  return d;
}
function renderStock() {
  const list = sale().filter(match), box = $("results"); box.innerHTML = "";
  $("count").textContent = list.length + " véhicule" + (list.length > 1 ? "s" : "") + " correspondent à votre recherche";
  if (!list.length) box.innerHTML = '<div class="empty">Aucun véhicule ne correspond. Réinitialisez les filtres ou passez une <a href="#commande" style="color:var(--blue);font-weight:600">commande sur mesure</a>.</div>';
  list.forEach(v => box.appendChild(card({
    title: v.make + " " + v.model, img: v.image_url, tag: TAGN[v.tags[0]] || "",
    meta: `Réf. ${esc(v.ref)}<br>${esc(v.year || "")} • ${v.mileage ? Number(v.mileage).toLocaleString("fr-FR") + " km" : "Neuf"} • ${esc(v.fuel || "")}<br>Direction ${esc((v.steering || "").toLowerCase())} • ${esc(v.city || "")}`,
    price: money(v.price), label: "Demander la facture",
    link: wa(`Bonjour, je souhaite une facture pour ${v.make} ${v.model} ${v.year || ""} (réf. ${v.ref})`)
  })));
  document.querySelectorAll("#tabs .chip").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.tab === f.tab)));
  renderChips();
}
function renderChips() {
  const s = sale();
  const mk = (id, items, key) => { const el = $(id); el.innerHTML = "";
    items.forEach(it => { const b = document.createElement("button"); b.type = "button"; b.className = "chip";
      b.innerHTML = esc(it.l) + " <i>(" + it.n + ")</i>"; b.setAttribute("aria-pressed", String(f[key] === it.v));
      b.onclick = () => { f[key] = f[key] === it.v ? "" : it.v; syncForm(); renderStock(); $("stock").scrollIntoView(); }; el.appendChild(b); }); };
  mk("byMake", uniq("make").map(m => ({l:m, v:m, n:s.filter(v => v.make === m).length})), "make");
  mk("byType", uniq("body_type").map(t => ({l:t, v:t, n:s.filter(v => v.body_type === t).length})), "type");
  mk("byPrice", PR.map((p, i) => ({l:p[0], v:String(i), n:s.filter(v => v.price >= p[1] && v.price < p[2]).length})), "price");
}
function models() { fill("fModel", "Tous", uniq("model", sale().filter(v => !f.make || v.make === f.make))); }
function syncForm() { models(); $("fMake").value = f.make; $("fModel").value = f.model; $("fPrice").value = f.price; $("fType").value = f.type; $("fSteer").value = f.steer; $("fY1").value = f.y1; $("fY2").value = f.y2; $("fCity").value = f.city; }
function renderRent() {
  const a = $("dFrom").value, b = $("dTo").value, days = a && b ? Math.round((new Date(b) - new Date(a)) / 864e5) + 1 : 0, box = $("rentals"); box.innerHTML = "";
  const list = rent(); if (!list.length) box.innerHTML = '<div class="empty">Aucun véhicule de location disponible pour le moment.</div>';
  list.forEach(v => {
    let p = money(v.price) + " / jour", t = `Bonjour, je souhaite louer : ${v.make} ${v.model} (${v.city})`;
    if (days > 0) { p += `<br><span class="tot">${days} j : ${money(v.price * days)}</span>`; t = `Bonjour, je souhaite louer : ${v.make} ${v.model} du ${a} au ${b} (${v.city}), total estimé ${money(v.price * days)}`; }
    else if (a && b) p += "<br><small>La date de fin doit suivre le début.</small>";
    box.appendChild(card({title:v.make + " " + v.model, img:v.image_url, tag:"Location", meta:`${esc(v.year || "")} • ${esc(v.fuel || "")}<br>Disponible à ${esc(v.city || "")}`, price:p, label:"Réserver", link:wa(t)}));
  });
}
function renderAll() {
  const s = sale(); $("cTotal").textContent = s.length; $("cNew").textContent = s.filter(v => v.tags.includes("n")).length;
  fill("fMake", "Toutes", uniq("make")); fill("fType", "Tous", uniq("body_type"));
  const y = uniq("year").reverse(); fill("fY1", "Min", y); fill("fY2", "Max", y);
  syncForm(); renderStock(); renderRent();
  $("ctWa").textContent = "+" + String(S.whatsapp).replace(/\D/g, "");
  $("ctPh").innerHTML = [S.phone, S.email].filter(Boolean).map(esc).join("<br>") || "Contactez-nous sur WhatsApp.";
  $("wa").href = $("waTop").href = $("waCt").href = wa("Bonjour BPS Business Car, j’aimerais des informations.");
}

// ---------- Carrousel ----------
let si = 0, timer = null;
function initCarousel() {
  const slidesContainer = $("slides");
  const dotsContainer = $("dots");
  slidesContainer.innerHTML = "";
  dotsContainer.innerHTML = "";
  
  if (!slidesData.length) {
    slidesData = [
      {id:1, title:"Véhicules neufs et d’occasion certifiés, disponibles dans le Grand Katanga.", image_url:""},
      {id:2, title:"Commande et importation sur mesure, livrées à Lubumbashi, Kolwezi et Likasi.", image_url:""},
      {id:3, title:"Location de véhicules toutes marques, courte ou longue durée.", image_url:""},
      {id:4, title:"Entreprendre • Persévérer • Innover • Réussir.", image_url:""}
    ];
  }

  slidesData.forEach((s, i) => {
    const d = document.createElement("div"); d.className = "slide";
    if (s.image_url) {
      d.style.backgroundImage = `url(${s.image_url})`;
    } else {
      d.style.background = `linear-gradient(135deg, #0a2540, #1565d8)`;
    }
    slidesContainer.appendChild(d);
    
    const b = document.createElement("button"); b.type = "button"; b.setAttribute("aria-label", "Diapositive " + (i + 1));
    b.onclick = () => { go(i); play(); }; dotsContainer.appendChild(b);
  });
  go(0);
  play();
}
function go(i) { 
  if (!slidesData.length) return;
  si = (i + slidesData.length) % slidesData.length;
  [...$("slides").children].forEach((e, k) => e.classList.toggle("on", k === si));
  [...$("dots").children].forEach((e, k) => e.setAttribute("aria-current", String(k === si)));
  $("cap").textContent = slidesData[si] ? slidesData[si].title : ""; 
}
function play() { clearInterval(timer); if (!matchMedia("(prefers-reduced-motion:reduce)").matches) timer = setInterval(() => go(si + 1), 5000); }
$("accueil").addEventListener("mouseenter", () => clearInterval(timer)); $("accueil").addEventListener("mouseleave", play);

// ---------- Événements publics ----------
const tick = () => $("clock").textContent = new Date().toLocaleTimeString("fr-FR", {timeZone:"Africa/Lubumbashi", hour:"2-digit", minute:"2-digit"});
tick(); setInterval(tick, 30000);
$("cur").onchange = e => { cur = e.target.value; renderStock(); renderRent(); };
$("fMake").onchange = e => { f.make = e.target.value; f.model = ""; models(); };
$("sf").onsubmit = e => { e.preventDefault(); Object.assign(f, {make:$("fMake").value, model:$("fModel").value, price:$("fPrice").value, type:$("fType").value, steer:$("fSteer").value, y1:$("fY1").value, y2:$("fY2").value, city:$("fCity").value}); renderStock(); $("stock").scrollIntoView(); };
$("reset").onclick = () => { f = {make:"",model:"",price:"",type:"",steer:"",y1:"",y2:"",city:"",q:"",ref:"",tab:"all"}; setTimeout(() => { syncForm(); renderStock(); }); };
$("kw").onsubmit = e => { e.preventDefault(); f.q = ""; f.ref = ""; f[$("kwMode").value] = $("kwIn").value.trim(); renderStock(); $("stock").scrollIntoView(); };
document.querySelectorAll("#tabs [data-tab]").forEach(b => b.onclick = () => { f.tab = b.dataset.tab; renderStock(); });
$("dFrom").onchange = $("dTo").onchange = renderRent;
$("dFrom").min = $("dTo").min = new Date().toISOString().slice(0, 10);
$("orderForm").onsubmit = async e => {
  e.preventDefault();
  const o = {name:$("oName").value.trim(), phone:$("oTel").value.trim(), vehicle:$("oVeh").value.trim(), budget:+$("oBud").value, city:$("oVille").value};
  let saved = false;
  if (db && !demo) { const r = await db.from("orders").insert(o); saved = !r.error; }
  $("oMsg").textContent = saved ? "Demande enregistrée. Notre équipe vous répond sur WhatsApp." : "Ouverture de WhatsApp pour envoyer votre demande.";
  window.open(wa(`Commande sur mesure BPS Business Car\nNom : ${o.name}\nTéléphone : ${o.phone}\nVéhicule : ${o.vehicle}\nBudget : ${o.budget} USD\nLivraison : ${o.city}`), "_blank", "noopener");
  e.target.reset();
};

// ---------- Espace administrateur ----------
let isAdm = false, signup = false, editing = null;
const msg = (id, t) => { $(id).textContent = t; };
function showAdm() { $("aLogin").hidden = isAdm; $("aPanel").hidden = !isAdm; if (isAdm) { openTab("aDash"); renderAList(); renderCList(); } }
async function checkAdmin() {
  if (!db || demo) return;
  const {data:{session}} = await db.auth.getSession();
  if (!session) { isAdm = false; showAdm(); return; }
  const r = await db.rpc("claim_admin"); isAdm = !r.error && r.data === true;
  if (isAdm) $("aWho").textContent = "Connecté : " + session.user.email;
  else { msg("aErr", "Ce compte n’a pas les droits administrateur."); await db.auth.signOut(); }
  showAdm();
}
$("aMode").onclick = () => { signup = !signup; $("aSubmit").textContent = signup ? "Créer le compte" : "Se connecter"; $("aMode").textContent = signup ? "J’ai déjà un compte : me connecter" : "Première utilisation ? Créer le compte administrateur"; msg("aErr", ""); };
$("aLoginForm").onsubmit = async e => {
  e.preventDefault(); if (!db || demo) { msg("aErr", "Base de données injoignable."); return; }
  const c = {email:$("aMail").value.trim(), password:$("aPass").value};
  if (signup) { const r = await db.auth.signUp(c); if (r.error) { msg("aErr", r.error.message); return; }
    if (!r.data.session) { msg("aErr", "Compte créé. Confirmez votre email, puis connectez-vous."); return; } }
  else { const r = await db.auth.signInWithPassword(c); if (r.error) { msg("aErr", "Email ou mot de passe incorrect."); return; } }
  $("aPass").value = ""; msg("aErr", ""); await checkAdmin();
};
$("aLogout").onclick = async () => { await db.auth.signOut(); isAdm = false; showAdm(); };

function openTab(id) { 
  ["aDash","aVeh","aOrd","aCarr","aSet"].forEach(p => $(p).hidden = p !== id);
  document.querySelectorAll("#aTabs .chip").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.p === id)));
  if (id === "aDash") loadDashboard();
  if (id === "aOrd") loadOrders(); 
  if (id === "aCarr") renderCList();
  if (id === "aSet") { $("sWa").value = S.whatsapp || ""; $("sPh").value = S.phone || ""; $("sMail").value = S.email || ""; } 
}
document.querySelectorAll("#aTabs .chip").forEach(b => b.onclick = () => openTab(b.dataset.p));

// --- DASHBOARD LOGIC ---
async function loadDashboard() {
  if (!db || demo) return;
  
  // Stats
  const [vCount, oCount, visits, sold] = await Promise.all([
    db.from("vehicles").select("*", { count: 'exact', head: true }),
    db.from("orders").select("*", { count: 'exact', head: true }),
    db.from("visits").select("*", { count: 'exact', head: true }),
    db.from("vehicles").select("price").eq("mode", "vente").eq("sold", true)
  ]);

  $("statStock").textContent = vCount.count || 0;
  $("statOrders").textContent = oCount.count || 0;
  $("statVisits").textContent = visits.count || 0;
  
  const revenue = sold.data ? sold.data.reduce((acc, curr) => acc + Number(curr.price), 0) : 0;
  $("statRevenue").textContent = "$" + revenue.toLocaleString("en-US");

  // Chart
  const ctx = document.getElementById('salesChart').getContext('2d');
  if (chartInstance) chartInstance.destroy();
  
  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'],
      datasets: [{
        label: 'Revenus des ventes ($)',
        data: [12000, 19000, 15000, 25000, 22000, 30000], // Données fictives, à remplacer par une agrégation SQL
        borderColor: '#1565d8',
        backgroundColor: 'rgba(21, 101, 216, 0.1)',
        tension: 0.4,
        fill: true
      }]
    },
    options: { responsive: true, maintainAspectRatio: false }
  });
}

// --- CARROUSEL LOGIC ---
function renderCList() {
  const box = $("cList"); box.innerHTML = "";
  if (!slidesData.length) box.innerHTML = '<div class="row">Aucun slide.</div>';
  slidesData.forEach(s => {
    const r = document.createElement("div"); r.className = "row";
    r.innerHTML = `<span><b>${esc(s.title)}</b><br><small>${s.image_url ? "Image chargée" : "Pas d'image"}</small></span><span class="acts"><button class="btn sm" type="button">Modifier</button><button class="btn sm del" type="button">Supprimer</button></span>`;
    const [m, d] = r.querySelectorAll("button"); 
    m.onclick = () => editSlide(s); 
    d.onclick = () => delSlide(s); 
    box.appendChild(r);
  });
}
function editSlide(s) {
  $("cId").value = s.id; $("cTitle").value = s.title; 
  $("cSave").textContent = "Modifier le slide"; $("cCancel").hidden = false;
  msg("cMsg", "Modification du slide.");
}
$("cCancel").onclick = () => { $("cForm").reset(); $("cId").value = ""; $("cSave").textContent = "Ajouter le slide"; $("cCancel").hidden = true; msg("cMsg", ""); };
$("cForm").onsubmit = async e => {
  e.preventDefault(); $("cSave").disabled = true;
  try {
    const id = $("cId").value;
    const row = { title: $("cTitle").value.trim(), position: slidesData.length + 1 };
    const file = $("cImg").files[0];
    if (file) {
      const ext = file.name.split(".").pop();
      const path = `slide_${Date.now()}.${ext}`;
      const up = await db.storage.from("carousel").upload(path, file);
      if (up.error) throw up.error;
      row.image_url = db.storage.from("carousel").getPublicUrl(path).data.publicUrl;
    }
    if (id) { await db.from("carousel").update(row).eq("id", id); }
    else { await db.from("carousel").insert(row); }
    msg("cMsg", "Slide enregistré.");
    $("cForm").reset(); $("cId").value = ""; $("cSave").textContent = "Ajouter le slide"; $("cCancel").hidden = true;
    await load(); renderCList(); initCarousel();
  } catch (err) { msg("cMsg", "Erreur: " + err.message); }
  $("cSave").disabled = false;
};
async function delSlide(s) {
  if (!confirm("Supprimer ce slide ?")) return;
  await db.from("carousel").delete().eq("id", s.id);
  await load(); renderCList(); initCarousel();
}

// --- VEHICULES LOGIC ---
function renderAList() {
  const box = $("aList"); box.innerHTML = "";
  if (!V.length) box.innerHTML = '<div class="row">Aucun véhicule. Ajoutez-en un avec le formulaire.</div>';
  V.forEach(v => {
    const r = document.createElement("div"); r.className = "row" + (v.available ? "" : " off");
    r.innerHTML = `<span><b>${esc(v.ref)}</b> ${esc(v.make)} ${esc(v.model)} ${esc(v.year || "")}<br><small>${v.mode === "location" ? "Location" : "Vente"} • ${money(v.price)}${v.mode === "location" ? " / jour" : ""} • ${esc(v.city || "")}${v.available ? "" : " • masqué"}</small></span><span class="acts"><button class="btn sm" type="button">Modifier</button><button class="btn sm del" type="button">Supprimer</button></span>`;
    const [m, d] = r.querySelectorAll("button"); m.onclick = () => editVehicle(v); d.onclick = () => delVehicle(v); box.appendChild(r);
  });
}
function resetForm() { editing = null; $("aForm").reset(); $("aSave").textContent = "Ajouter le véhicule"; $("aCancel").hidden = true; }
function editVehicle(v) {
  editing = v; $("aModeV").value = v.mode; $("aMake").value = v.make; $("aModel").value = v.model; $("aYear").value = v.year || ""; $("aType").value = v.body_type || "SUV";
  $("aFuel").value = v.fuel || "Essence"; $("aSteer").value = v.steering || "Gauche"; $("aPrice").value = v.price; $("aKm").value = v.mileage || 0; $("aCity").value = v.city || "Lubumbashi";
  document.querySelectorAll("[name=aTag]").forEach(c => c.checked = v.tags.includes(c.value)); $("aAvail").checked = v.available; $("aDesc").value = v.description || "";
  $("aSave").textContent = "Enregistrer les modifications"; $("aCancel").hidden = false; msg("aMsg", "Modification de " + v.ref + ". Laissez la photo vide pour la conserver."); $("aForm").scrollIntoView();
}
$("aCancel").onclick = () => { resetForm(); msg("aMsg", ""); };
async function uploadPhoto(file) {
  if (file.size > 5 * 1024 * 1024) throw new Error("Photo trop lourde (5 Mo maximum).");
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, ""), path = crypto.randomUUID() + "." + ext;
  const r = await db.storage.from("vehicules").upload(path, file, {contentType:file.type, cacheControl:"31536000"}); if (r.error) throw r.error;
  return db.storage.from("vehicules").getPublicUrl(path).data.publicUrl;
}
const photoPath = url => url && url.includes("/vehicules/") ? decodeURIComponent(url.split("/vehicules/").pop()) : null;
async function reload() { await load(); renderAll(); renderAList(); }
$("aForm").onsubmit = async e => {
  e.preventDefault(); $("aSave").disabled = true; msg("aMsg", "Enregistrement…");
  try {
    const row = {mode:$("aModeV").value, make:$("aMake").value.trim(), model:$("aModel").value.trim(), year:+$("aYear").value || null, body_type:$("aType").value, fuel:$("aFuel").value, steering:$("aSteer").value,
      price:+$("aPrice").value, mileage:+$("aKm").value || 0, city:$("aCity").value, tags:[...document.querySelectorAll("[name=aTag]:checked")].map(c => c.value), available:$("aAvail").checked, description:$("aDesc").value.trim() || null};
    const file = $("aPhoto").files[0];
    if (file) { row.image_url = await uploadPhoto(file); if (editing) { const old = photoPath(editing.image_url); if (old) db.storage.from("vehicules").remove([old]); } }
    const r = editing ? await db.from("vehicles").update(row).eq("id", editing.id) : await db.from("vehicles").insert(row);
    if (r.error) throw r.error;
    msg("aMsg", editing ? "Véhicule modifié." : "Véhicule ajouté."); resetForm(); await reload();
  } catch (err) { msg("aMsg", "Erreur : " + (err.message || err)); }
  $("aSave").disabled = false;
};
async function delVehicle(v) {
  if (!confirm("Supprimer définitivement " + v.make + " " + v.model + " ?")) return;
  const r = await db.from("vehicles").delete().eq("id", v.id); if (r.error) { msg("aMsg", "Erreur : " + r.error.message); return; }
  const p = photoPath(v.image_url); if (p) db.storage.from("vehicules").remove([p]);
  msg("aMsg", "Véhicule supprimé."); await reload();
}

// --- COMMANDES LOGIC ---
async function loadOrders() {
  const box = $("aOrders"); box.innerHTML = '<div class="row">Chargement…</div>';
  const r = await db.from("orders").select("*").order("created_at", {ascending:false});
  if (r.error) { box.innerHTML = '<div class="row">Erreur : ' + esc(r.error.message) + "</div>"; return; }
  box.innerHTML = r.data.length ? "" : '<div class="row">Aucune demande pour le moment.</div>';
  r.data.forEach(o => {
    const d = document.createElement("div"); d.className = "row";
    d.innerHTML = `<span><b>${esc(o.name)}</b> • ${esc(o.phone)}<br><small>${esc(o.vehicle)} • budget ${money(o.budget || 0)} • ${esc(o.city || "")} • ${new Date(o.created_at).toLocaleDateString("fr-FR")}</small></span><span class="acts"><a class="btn sm" target="_blank" rel="noopener" href="https://wa.me/${esc(String(o.phone).replace(/\D/g, ""))}">WhatsApp</a><button class="btn sm del" type="button">Supprimer</button></span>`;
    d.querySelector("button").onclick = async () => { if (confirm("Supprimer cette demande ?")) { await db.from("orders").delete().eq("id", o.id); loadOrders(); } };
    box.appendChild(d);
  });
}

// --- SETTINGS LOGIC ---
$("sForm").onsubmit = async e => {
  e.preventDefault(); const row = {id:1, whatsapp:$("sWa").value.trim(), phone:$("sPh").value.trim() || null, email:$("sMail").value.trim() || null};
  const r = await db.from("settings").upsert(row); if (r.error) { msg("sMsg", "Erreur : " + r.error.message); return; }
  S = row; renderAll(); msg("sMsg", "Paramètres enregistrés.");
};

// ---------- Démarrage ----------
(async function init() {
  const pr = $("fPrice"); pr.innerHTML = "<option value=''>Tous</option>" + PR.map((p, i) => `<option value="${i}">${p[0]}</option>`).join("");
  await load(); renderAll(); initCarousel(); showAdm();
  if (db && !demo) { await checkAdmin(); db.auth.onAuthStateChange(ev => { if (ev === "SIGNED_OUT") { isAdm = false; showAdm(); } }); }
})();
})();
