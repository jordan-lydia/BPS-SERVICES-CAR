var RATE=2300,WA="243000000000"; // RATE : 1 USD en FC (à ajuster). WA : numéro WhatsApp sans « + ».
var $=function(i){return document.getElementById(i)};
var V=ROWS.map(function(r,i){return{id:i+1,ref:"BPS-"+("000"+(i+1)).slice(-4),make:r[0],model:r[1],year:r[2],type:r[3],fuel:r[4],steer:r[5],price:r[6],km:r[7],city:r[8],tags:r[9].split(",")}});
var PR=[["Moins de 15 000 $",0,15000],["15 000 – 25 000 $",15000,25000],["25 000 – 40 000 $",25000,40000],["Plus de 40 000 $",40000,1e9]];
var f={make:"",model:"",price:"",type:"",steer:"",y1:"",y2:"",city:"",q:"",ref:"",tab:"all"},cur="USD";
function wa(t){return"https://wa.me/"+WA+"?text="+encodeURIComponent(t)}
function money(p){return cur==="USD"?"$"+p.toLocaleString("en-US"):Math.round(p*RATE).toLocaleString("fr-FR")+" FC"}
function uniq(k,list){return(list||V).map(function(v){return v[k]}).filter(function(x,i,a){return a.indexOf(x)===i}).sort()}
function fill(id,first,vals){$(id).innerHTML="<option value=''>"+first+"</option>"+vals.map(function(v){return"<option>"+v+"</option>"}).join("")}
function match(v){
 if(f.make&&v.make!==f.make)return 0;if(f.model&&v.model!==f.model)return 0;
 if(f.type&&v.type!==f.type)return 0;if(f.steer&&v.steer!==f.steer)return 0;if(f.city&&v.city!==f.city)return 0;
 if(f.y1&&v.year<+f.y1)return 0;if(f.y2&&v.year>+f.y2)return 0;
 if(f.price){var p=PR[+f.price];if(v.price<p[1]||v.price>=p[2])return 0}
 if(f.q&&(v.make+" "+v.model).toLowerCase().indexOf(f.q.toLowerCase())<0)return 0;
 if(f.ref&&v.ref.toLowerCase()!==f.ref.toLowerCase())return 0;
 if(f.tab!=="all"&&v.tags.indexOf(f.tab)<0)return 0;return 1}
function card(title,meta,price,tag,link,label){
 var d=document.createElement("div");d.className="card";
 d.innerHTML='<div class="pic">'+(tag?'<span class="tag"></span>':'')+'<svg viewBox="0 0 400 130" aria-hidden="true"><use href="#car"/></svg></div><div class="body"><h3></h3><div class="meta"></div><div class="price"></div><a class="btn" target="_blank" rel="noopener"></a></div>';
 if(tag)d.querySelector(".tag").textContent=tag;
 d.querySelector("h3").textContent=title;d.querySelector(".meta").innerHTML=meta;
 d.querySelector(".price").innerHTML=price;var a=d.querySelector("a");a.href=link;a.textContent=label;return d}
var TAGN={n:"Nouveau",p:"Promo",x:"Premium",neuf:"Neuf"};
function render(){
 var list=V.filter(match),box=$("results");box.innerHTML="";
 $("count").textContent=list.length+" véhicule"+(list.length>1?"s":"")+" correspondent à votre recherche";
 if(!list.length)box.innerHTML='<div class="empty">Aucun véhicule ne correspond. Réinitialisez les filtres ou passez une <a href="#commande" style="color:var(--g2)">commande sur mesure</a>.</div>';
 list.forEach(function(v){
  var tg=v.tags[0]?TAGN[v.tags[0]]:"";
  box.appendChild(card(v.make+" "+v.model,"Réf. "+v.ref+"<br>"+v.year+" • "+(v.km?v.km.toLocaleString("fr-FR")+" km":"Neuf")+" • "+v.fuel+"<br>Direction "+v.steer.toLowerCase()+" • "+v.city,money(v.price),tg,wa("Bonjour, je souhaite une facture pour "+v.make+" "+v.model+" "+v.year+" (réf. "+v.ref+")"),"Demander la facture"))});
 document.querySelectorAll("#tabs .chip").forEach(function(b){b.setAttribute("aria-pressed",String(b.dataset.tab===f.tab))});
 chips()}
function chips(){
 var base=V;
 function mk(id,items,key,val){var el=$(id);el.innerHTML="";items.forEach(function(it){
  var b=document.createElement("button");b.type="button";b.className="chip";b.innerHTML=it.l+" <i>("+it.n+")</i>";
  b.setAttribute("aria-pressed",String(f[key]===it.v));
  b.onclick=function(){f[key]=f[key]===it.v?"":it.v;sync();render();$("stock").scrollIntoView()};el.appendChild(b)})}
 mk("byMake",uniq("make").map(function(m){return{l:m,v:m,n:base.filter(function(v){return v.make===m}).length}}),"make");
 mk("byType",uniq("type").map(function(t){return{l:t,v:t,n:base.filter(function(v){return v.type===t}).length}}),"type");
 mk("byPrice",PR.map(function(p,i){return{l:p[0],v:String(i),n:base.filter(function(v){return v.price>=p[1]&&v.price<p[2]}).length}}),"price")}
function models(){fill("fModel","Tous",uniq("model",V.filter(function(v){return!f.make||v.make===f.make})))}
function sync(){models();$("fMake").value=f.make;$("fModel").value=f.model;$("fPrice").value=f.price;$("fType").value=f.type;$("fSteer").value=f.steer;$("fY1").value=f.y1;$("fY2").value=f.y2;$("fCity").value=f.city}
function rentals(){
 var a=$("dFrom").value,b=$("dTo").value,days=a&&b?Math.round((new Date(b)-new Date(a))/864e5)+1:0,box=$("rentals");box.innerHTML="";
 RENT.forEach(function(r){
  var p=money(r[2])+" / jour",link=wa("Bonjour, je souhaite louer : "+r[0]+" "+r[1]+" ("+r[3]+")");
  if(days>0){p+='<br><span class="tot">'+days+" j : "+money(r[2]*days)+"</span>";link=wa("Bonjour, je souhaite louer : "+r[0]+" "+r[1]+" du "+a+" au "+b+" ("+r[3]+"), total estimé "+money(r[2]*days))}
  else if(a&&b)p+="<br><small>La date de fin doit suivre le début.</small>";
  box.appendChild(card(r[0]+" "+r[1],"Disponible à "+r[3],p,"Location",link,"Réserver"))})}
// Initialisation
$("cTotal").textContent=V.length;$("cNew").textContent=V.filter(function(v){return v.tags.indexOf("n")>-1}).length;
fill("fMake","Toutes",uniq("make"));fill("fType","Tous",uniq("type"));
$("fPrice").innerHTML="<option value=''>Tous</option>"+PR.map(function(p,i){return"<option value='"+i+"'>"+p[0]+"</option>"}).join("");
var yrs=uniq("year").reverse();fill("fY1","Min",yrs);fill("fY2","Max",yrs);models();
function tick(){$("clock").textContent=new Date().toLocaleTimeString("fr-FR",{timeZone:"Africa/Lubumbashi",hour:"2-digit",minute:"2-digit"})}tick();setInterval(tick,30000);
$("cur").onchange=function(){cur=this.value;render();rentals()};
$("fMake").onchange=function(){f.make=this.value;f.model="";models()};
$("sf").onsubmit=function(e){e.preventDefault();f.make=$("fMake").value;f.model=$("fModel").value;f.price=$("fPrice").value;f.type=$("fType").value;f.steer=$("fSteer").value;f.y1=$("fY1").value;f.y2=$("fY2").value;f.city=$("fCity").value;render();$("stock").scrollIntoView()};
$("reset").onclick=function(){f={make:"",model:"",price:"",type:"",steer:"",y1:"",y2:"",city:"",q:"",ref:"",tab:"all"};setTimeout(function(){sync();render()})};
$("kw").onsubmit=function(e){e.preventDefault();f.q="";f.ref="";f[$("kwMode").value]=$("kwIn").value.trim();render();$("stock").scrollIntoView()};
document.querySelectorAll("[data-tab]").forEach(function(b){b.addEventListener("click",function(){f.tab=b.dataset.tab;render()})});
$("dFrom").onchange=$("dTo").onchange=rentals;
$("dFrom").min=$("dTo").min=new Date().toISOString().slice(0,10);
$("orderForm").onsubmit=function(e){e.preventDefault();window.open(wa("Commande sur mesure BPS Business Car\nNom : "+$("oName").value+"\nTéléphone : "+$("oTel").value+"\nVéhicule : "+$("oVeh").value+"\nBudget : "+$("oBud").value+" USD\nLivraison : "+$("oVille").value),"_blank","noopener")};
$("wa").href=$("waTop").href=wa("Bonjour BPS Business Car, j’aimerais des informations.");
render();rentals();
