const ready = window.SUPABASE_URL && window.SUPABASE_ANON_KEY &&
  !window.SUPABASE_URL.includes("PASTE_") && !window.SUPABASE_ANON_KEY.includes("PASTE_");
const db = ready ? window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY) : null;
const $ = (id) => document.getElementById(id);
$("year").textContent = new Date().getFullYear();
$("menuToggle").addEventListener("click", () => $("mainNav").classList.toggle("open"));
document.querySelectorAll("#mainNav a").forEach(a => a.addEventListener("click", () => $("mainNav").classList.remove("open")));

function safeText(value=""){return String(value).replace(/[&<>"']/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function linkIf(url,label){return url ? `<a class="item-link" href="${safeText(url)}" target="_blank" rel="noopener">${label}</a>` : "";}
function showEmpty(id,msg){$(id).innerHTML=`<p class="empty-state">${msg}</p>`;}
async function loadPortfolio(){
  if(!db){$("aboutText").textContent="To display your saved details, connect your Supabase project in config.js. Setup instructions are in README.";return;}
  const {data,error}=await db.from("portfolio_items").select("*").order("created_at",{ascending:false});
  if(error){console.error(error);$("aboutText").textContent="Portfolio data could not be loaded. Please check the Supabase setup.";return;}
  const rows=data||[];
  const about=rows.find(x=>x.category==="about");
  if(about){$("aboutText").textContent=about.description||"";$("heroIntro").textContent=about.extra?.intro||about.description||"";$("heroName").textContent=about.extra?.name||"Rifka Rajab";$("heroRole").textContent=about.extra?.role||"Aspiring Analytics & Reporting Professional";}
  const skills=rows.filter(x=>x.category==="skill");
  $("skillsList").innerHTML=skills.length?skills.map(x=>`<span class="skill-pill">${safeText(x.title)}</span>`).join(""):'<p class="empty-state">Add your skills from the Admin Dashboard.</p>';
  const certs=rows.filter(x=>x.category==="certificate");
  $("certificationsList").innerHTML=certs.length?certs.map(x=>`<article class="item-card">${x.file_url?`<img src="${safeText(x.file_url)}" alt="${safeText(x.title)}">`:""}<div class="item-content"><h3>${safeText(x.title)}</h3><p>${safeText(x.description||"")}</p>${x.extra?.issuer?`<span class="tag">${safeText(x.extra.issuer)}</span>`:""}${linkIf(x.file_url,"View Certificate")}</div></article>`).join(""):'<p class="empty-state">Add your certificates from the Admin Dashboard.</p>';
  const projects=rows.filter(x=>x.category==="project");
  renderProjects(projects);
  const edu=rows.filter(x=>x.category==="education");
  $("educationList").innerHTML=edu.length?edu.map(x=>`<div class="education-item"><h3>${safeText(x.title)}</h3><p>${safeText(x.description||"")}</p><span class="tag">${safeText(x.extra?.year||"")}</span></div>`).join(""):'<p class="empty-state">Add your education from the Admin Dashboard.</p>';
  const contact=rows.find(x=>x.category==="contact");
  if(contact){$("contactText").textContent=contact.description||"";if(contact.extra?.email){$("emailLink").href=`mailto:${contact.extra.email}`;$("emailLink").hidden=false;}}
  const resume=rows.find(x=>x.category==="resume");
  if(resume?.file_url){$("resumeButton").href=resume.file_url;$("resumeButton").hidden=false;}
}
function renderProjects(projects){
  const active=document.querySelector(".filter.active")?.dataset.filter||"All";
  const list=active==="All"?projects:projects.filter(p=>(p.tech||"").toLowerCase().includes(active.toLowerCase()));
  $("projectsList").innerHTML=list.length?list.map(x=>`<article class="item-card">${x.file_url?`<img src="${safeText(x.file_url)}" alt="${safeText(x.title)} project screenshot">`:""}<div class="item-content"><h3>${safeText(x.title)}</h3><p>${safeText(x.description||"")}</p>${x.tech?`<div class="tags">${x.tech.split(",").map(t=>`<span class="tag">${safeText(t.trim())}</span>`).join("")}</div>`:""}${linkIf(x.extra?.github_url," View GitHub↗")}${linkIf(x.extra?.live_url,"Live Demo")}</div></article>`).join(""):'<p class="empty-state">No projects in this category yet.</p>';
}
document.querySelectorAll(".filter").forEach(b=>b.addEventListener("click",()=>{document.querySelectorAll(".filter").forEach(x=>x.classList.remove("active"));b.classList.add("active");if(db)db.from("portfolio_items").select("*").eq("category","project").then(({data})=>renderProjects(data||[]));}));
loadPortfolio();
