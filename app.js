let DB=null;
const state={route:'home',category:null,entry:null,query:''};
const $=s=>document.querySelector(s);
const main=$('#main');
const favKey='ems-cog-favorites-v1', recentKey='ems-cog-recents-v1', themeKey='ems-cog-theme-v1';
const getFavs=()=>new Set(JSON.parse(localStorage.getItem(favKey)||'[]'));
const saveFavs=s=>localStorage.setItem(favKey,JSON.stringify([...s]));
const getRecents=()=>JSON.parse(localStorage.getItem(recentKey)||'[]');
const esc=s=>(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));

function setRoute(route, opts={}){state.route=route;Object.assign(state,opts);render();window.scrollTo({top:0,behavior:'instant'});}
function categoryName(n){return n.replace(/^\d+\s*/,'').replace(/\s*-/g,' - ');}
function findEntry(term){term=term.toLowerCase();return DB.entries.find(e=>e.title.toLowerCase().includes(term)||e.name.toLowerCase().includes(term));}
function pushRecent(id){let a=getRecents().filter(x=>x!==id);a.unshift(id);a=a.slice(0,8);localStorage.setItem(recentKey,JSON.stringify(a));}
function toggleFav(id){const s=getFavs();s.has(id)?s.delete(id):s.add(id);saveFavs(s);render();}
function listRows(items, query=''){
  const favs=getFavs();
  if(!items.length)return '<div class="empty">No matching protocols found.</div>';
  return `<div class="list">${items.map(e=>{
    let snip='';
    if(query){const low=e.text.toLowerCase(), q=query.toLowerCase();const i=low.indexOf(q);if(i>=0)snip=e.text.slice(Math.max(0,i-70),i+150).replace(/\s+/g,' ');}
    return `<div class="list-row"><button class="open" data-entry="${e.id}"><div class="code">${esc(e.code||'REFERENCE')}</div><div class="title">${esc(e.name)}</div><div class="meta">${esc(categoryName(e.category))} · p. ${e.page}${e.end_page>e.page?'–'+e.end_page:''}</div>${snip?`<div class="result-snippet">…${esc(snip)}…</div>`:''}</button><button class="fav-btn ${favs.has(e.id)?'on':''}" data-fav="${e.id}" aria-label="Favorite">★</button></div>`;
  }).join('')}</div>`;
}
function renderHome(){
 const quick=[['Cardiac Arrest, Adult','cardiac arrest'],['Atrial Fibrillation with RVR','atrial fibrillation'],['Sepsis','m-20: sepsis'],['Norepinephrine','norepinephrine bitartrate'],['Capacity Checklist','capacity checklist'],['Drug Formulary','00: overview']]
   .map(([label,term])=>{const e=findEntry(term);return e?`<button class="quick" data-entry="${e.id}"><b>${esc(label)}</b><span>Page ${e.page}</span></button>`:''}).join('');
 const recents=getRecents().map(id=>DB.entries.find(e=>e.id===id)).filter(Boolean).slice(0,4);
 main.innerHTML=`<section class="hero"><h2>EMS Protocol Reference</h2><p>Fast navigation, full-text search, favorites, and original PDF page access.</p></section><div class="notice"><b>Clinical-use notice:</b> This is a navigation/reference aid generated from the supplied COG. For patient-care decisions, verify the current protocol and medical direction in the source document.</div><div class="section-head"><h2>Quick access</h2></div><div class="quick-grid">${quick}</div>${recents.length?`<div class="section-head"><h2>Recent</h2></div>${listRows(recents)}`:''}<div class="section-head"><h2>Protocol sections</h2></div><div class="grid">${DB.categories.map(c=>`<button class="card" data-cat="${esc(c.name)}"><strong>${esc(categoryName(c.name))}</strong><span class="count">${c.count} items · p. ${c.page}</span></button>`).join('')}</div><div class="status">${DB.meta.entryCount} indexed references · ${DB.meta.sourcePages} source pages · Effective ${DB.meta.effective}</div>`;
}
function renderCategory(){
 const c=DB.categories.find(x=>x.name===state.category);if(!c)return setRoute('home');
 const items=DB.entries.filter(e=>e.category===c.name);
 main.innerHTML=`<button class="back" data-route="home">‹ Home</button><div class="section-head"><h2>${esc(categoryName(c.name))}</h2><span class="pill">${items.length} items</span></div>${listRows(items)}`;
}
function renderSearch(){
 let items=[];const q=state.query.trim();
 if(q){const terms=q.toLowerCase().split(/\s+/).filter(Boolean);items=DB.entries.map(e=>{const title=(e.title+' '+e.name).toLowerCase(), text=e.text.toLowerCase();let score=0;for(const t of terms){if(title.includes(t))score+=8;if(text.includes(t))score+=1;}return {e,score};}).filter(x=>x.score>0).sort((a,b)=>b.score-a.score||a.e.page-b.e.page).slice(0,80).map(x=>x.e);}
 main.innerHTML=`<div class="searchbox"><input id="searchInput" type="search" autocomplete="off" placeholder="Search protocol, drug, condition…" value="${esc(state.query)}"/><button id="clearSearch">×</button></div>${q?`<div class="section-head"><h2>${items.length} result${items.length===1?'':'s'}</h2></div>${listRows(items,q)}`:'<div class="empty">Try “sepsis”, “ketamine”, “refusal”, “ROSC”, or “stroke”.</div>'}`;
 const input=$('#searchInput');input.focus();input.setSelectionRange(input.value.length,input.value.length);input.addEventListener('input',()=>{state.query=input.value;renderSearch();});
}
function renderFavorites(){const favs=getFavs();const items=DB.entries.filter(e=>favs.has(e.id));main.innerHTML=`<div class="section-head"><h2>Favorites</h2><span class="pill">${items.length}</span></div>${items.length?listRows(items):'<div class="empty">Tap ★ on any protocol or medication to keep it here.</div>'}`;}
function renderEntry(){
 const e=DB.entries.find(x=>x.id===state.entry);if(!e)return setRoute('home');pushRecent(e.id);const favs=getFavs();
 main.innerHTML=`<button class="back" data-cat="${esc(e.category)}">‹ ${esc(categoryName(e.category))}</button><section class="protocol-header"><div class="code">${esc(e.code||'REFERENCE')}</div><h2>${esc(e.name)}</h2><span class="pill">Page ${e.page}${e.end_page>e.page?'–'+e.end_page:''}</span><span class="pill">${esc(categoryName(e.category))}</span><div class="actions"><button class="action" id="pdfBtn">Original PDF</button><button class="action" id="shareBtn">Share</button><button class="action" data-fav="${e.id}">${favs.has(e.id)?'★ Saved':'☆ Favorite'}</button></div></section><p class="source-note">Searchable text below is extracted from the PDF and may not reproduce flowcharts, tables, diagrams, or formatting exactly. Use “Original PDF” for the authoritative page layout.</p><article class="protocol-text">${esc(e.text)}</article>`;
 $('#pdfBtn').addEventListener('click',()=>window.open(`new_protocols.pdf#page=${e.page}`,'_blank'));
 $('#shareBtn').addEventListener('click',async()=>{const share={title:e.title,text:`${e.title} — COG 3.3 (EAST), page ${e.page}`};try{if(navigator.share)await navigator.share(share);else await navigator.clipboard.writeText(share.text);}catch(_){}});
}
function renderAbout(){main.innerHTML=`<section class="about-list"><h2>About this prototype</h2><p><b>${esc(DB.meta.title)}</b><br>${esc(DB.meta.organization)}<br>Effective ${esc(DB.meta.effective)} · ${DB.meta.sourcePages} pages</p><p>This installable web app is built entirely from the PDF you supplied. It adds section browsing, full-text search, favorites, recent items, quick links, dark mode, offline caching, and direct access to the original PDF.</p><p><b>Important:</b> the extracted text is for navigation and rapid reference. Protocol flowcharts and some visual elements may not extract completely, so the original PDF remains bundled with the app.</p><p><b>iPhone install:</b> publish this folder to an HTTPS site, open it in Safari, tap Share, then <i>Add to Home Screen</i>.</p></section>`;}
function render(){document.querySelectorAll('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.route===state.route));if(!DB){main.innerHTML=$('#loadingTpl').innerHTML;return;}if(state.route==='home')renderHome();else if(state.route==='category')renderCategory();else if(state.route==='search')renderSearch();else if(state.route==='favorites')renderFavorites();else if(state.route==='entry')renderEntry();else renderAbout();bindDynamic();}
function bindDynamic(){document.querySelectorAll('[data-route]').forEach(b=>b.onclick=()=>setRoute(b.dataset.route));document.querySelectorAll('[data-cat]').forEach(b=>b.onclick=()=>setRoute('category',{category:b.dataset.cat}));document.querySelectorAll('[data-entry]').forEach(b=>b.onclick=()=>setRoute('entry',{entry:b.dataset.entry}));document.querySelectorAll('[data-fav]').forEach(b=>b.onclick=e=>{e.stopPropagation();toggleFav(b.dataset.fav)});const c=$('#clearSearch');if(c)c.onclick=()=>{state.query='';renderSearch();};}

document.querySelectorAll('.nav-item').forEach(b=>b.addEventListener('click',()=>setRoute(b.dataset.route)));
$('#themeBtn').addEventListener('click',()=>{const cur=document.documentElement.dataset.theme==='dark'?'light':'dark';document.documentElement.dataset.theme=cur;localStorage.setItem(themeKey,cur)});
const storedTheme=localStorage.getItem(themeKey);if(storedTheme)document.documentElement.dataset.theme=storedTheme;

fetch('protocols.json').then(r=>r.json()).then(d=>{DB=d;render()}).catch(err=>{main.innerHTML=`<section class="center-card"><h2>Could not load protocol data</h2><p>${esc(String(err))}</p></section>`});
if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
render();
