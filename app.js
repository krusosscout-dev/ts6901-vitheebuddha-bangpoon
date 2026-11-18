import * as Store from "./store.js";
(async () => {
/* เปิดเร็ว: ใช้สำเนาในเครื่องก่อน (ถ้ามี) แล้วค่อยอัปเดตจาก Firebase แบบเรียลไทม์ */
let CACHED = null, REMOTE = null;
try { CACHED = await Store.cachedSite(); } catch {}
if (!CACHED) { try { REMOTE = await Store.loadSite(); } catch (e) { console.warn("load site", e); } }
const FIRST = !CACHED && !REMOTE;
const RAW = CACHED || (REMOTE ? JSON.stringify(REMOTE) : await (await fetch("/seed.json", { cache: "no-cache" })).text());
let S = JSON.parse(RAW); S.img = S.img || {};
let SAVED = RAW;
const IMG = {};
if (!FIRST) { try { Object.assign(IMG, await Store.cachedImages(S.imgIds || [])); } catch {} }
let ROUTE = (() => { try { return location.hash || "#home"; } catch { return "#home"; } })();
function go(h) { if ($(".dv")) closeDoc(); if ($(".vp")) closeVid(); ROUTE = h; try { history.replaceState(null, "", h); } catch {} render(); scrollTo(0, 0); }

/* ---------- constants ---------- */
const IND = [
 ["ด้านกายภาพ", [["1.1","มีป้ายโรงเรียนวิถีพุทธ"],["1.2","มีพระพุทธรูปหน้าโรงเรียน"],["1.3","มีพระพุทธรูปประจำห้องเรียน"],["1.4","มีพุทธศาสนสุภาษิต วาทะธรรม พระราชดำรัสติดตามที่ต่าง ๆ"],["1.5","มีความสะอาด สงบ ร่มรื่น"],["1.6","มีห้องพระพุทธศาสนาหรือลานธรรม"],["1.7","ไม่มีสิ่งเสพติด เหล้า บุหรี่ 100%"]]],
 ["ด้านการเรียนการสอน", [["2.1","บริหารจิต เจริญปัญญา ก่อนเรียนเช้า–บ่าย ทั้งครูและนักเรียน"],["2.2","บูรณาการวิถีพุทธทุกกลุ่มสาระ และในวันสำคัญทางพระพุทธศาสนา"],["2.3","ครูพานักเรียนทำโครงงานคุณธรรม กิจกรรมจิตอาสาสัปดาห์ละ 1 ครั้ง"],["2.4","ครู ผู้บริหาร นักเรียนไปปฏิบัติศาสนกิจที่วัดเดือนละ 1 ครั้ง มีวัดเป็นแหล่งเรียนรู้"],["2.5","ครู ผู้บริหาร นักเรียนเข้าค่ายปฏิบัติธรรมอย่างน้อยปีละ 1 ครั้ง"]]],
 ["ด้านพฤติกรรมครู ผู้บริหาร และนักเรียน", [["3.1","รักษาศีล 5"],["3.2","ยิ้มง่าย ไหว้สวย กราบงาม"],["3.3","พิจารณาอาหารก่อนรับประทาน ไม่ดัง ไม่หก ไม่เหลือ"],["3.4","ประหยัด ออม ถนอมใช้ เงินและสิ่งของ"],["3.5","มีนิสัยใฝ่รู้ สู้สิ่งยาก"]]],
 ["ด้านการส่งเสริมวิถีพุทธ", [["4.1","ไม่มีอาหารขยะขายในโรงเรียน"],["4.2","ไม่ดุด่านักเรียน"],["4.3","ชื่นชมคุณความดีหน้าเสาธงทุกวัน"],["4.4","โฮมรูมสะท้อนความรู้สึก เช่น ความรู้สึกที่ได้ทำความดี"],["4.5","ครู ผู้บริหาร นักเรียนมีสมุดบันทึกความดี"],["4.6","ครู ผู้บริหาร นักเรียนสอบได้ธรรมศึกษาตรีเป็นอย่างน้อย"],["4.7","บริหารจิต เจริญปัญญา ก่อนการประชุมทุกครั้ง"],["4.8","มีพระมาสอนอย่างสม่ำเสมอ"]]],
 ["ด้านกิจกรรมประจำวันพระ", [["5.1","ใส่เสื้อขาวทุกคน"],["5.2","ทำบุญใส่บาตร ฟังเทศน์"],["5.3","รับประทานอาหารมังสวิรัติในมื้อกลางวัน"],["5.4","สวดมนต์แปล"]]],
];
const ALL = IND.flatMap(g => g[1]);
const TH_M = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];
const TH_MF = ["มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน","กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"];
const CATS = ["ข่าวกิจกรรม","วันสำคัญทางพระพุทธศาสนา","กิจกรรมวันพระ","ข่าวประชาสัมพันธ์","รางวัลและผลงาน"];
const LOTUS = '<svg width="44" height="30" viewBox="0 0 64 44" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="M32 4c6 8 6 18 0 28-6-10-6-20 0-28z"/><path d="M32 32c-4-9-11-15-20-17 1 9 9 16 20 17z"/><path d="M32 32c4-9 11-15 20-17-1 9-9 16-20 17z"/><path d="M32 32C24 27 12 26 4 30c8 5 19 5 28 2z"/><path d="M32 32c8-5 20-6 28-2-8 5-19 5-28 2z"/><path d="M14 40h36"/></svg>';

/* ---------- helpers ---------- */
const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const paras = s => String(s || "").split(/\n\s*\n|\n/).filter(x => x.trim()).map(p => `<p class="jt">${esc(p)}</p>`).join("");
const num = n => Number(n || 0).toLocaleString("th-TH");
const thDate = (iso, full) => { if (!iso) return "ไม่ระบุวันที่"; const [y, m, d] = iso.split("-").map(Number); return full ? `${d} ${TH_MF[m - 1]} ${y + 543}` : `${d} ${TH_M[m - 1]} ${String(y + 543).slice(2)}`; };
const today = () => { const d = new Date(); return new Date(d - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10); };
const safeUrl = u => /^https?:\/\//i.test(u || "") ? u : "";
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const img = id => (id && (S.img?.[id] || IMG[id])) || "";
const ls = { get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } }, set(k, v) { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, JSON.stringify(v)); } catch {} } };
function toast(t) { let el = $("#toast"); if (!el) { el = document.createElement("div"); el.id = "toast"; el.className = "toast"; document.body.appendChild(el); } el.textContent = t; el.hidden = false; clearTimeout(toast.t); toast.t = setTimeout(() => el.hidden = true, 2600); }
const byYear = arr => (arr || []).filter(x => !x.year || x.year === viewYear);
const sortDate = arr => [...arr].sort((a, b) => (b.date || "").localeCompare(a.date || ""));

/* ---------- editor state ---------- */
let canEdit = false, artifactApi = null, assetsApi = null, pendingPdf = null, pendingPop = "", dirty = false, viewYear = S.year;
const DRAFT_KEY = "wbp-draft";
const hash = s => { let h = 5381; for (let i = 0; i < s.length; i++) h = (h * 33 ^ s.charCodeAt(i)) >>> 0; return h; };
let BASE = hash(SAVED);
function markDirty() { dirty = true; ls.set(DRAFT_KEY, { base: BASE, s: S }); renderSaveBar(); }

/* ---------- derived ---------- */
function indEvidence(id) {
  const posts = sortDate(byYear(S.posts).filter(p => (p.inds || []).includes(id)));
  const d = (viewYear === S.year ? S.ind : S.indArchive?.[viewYear])?.[id] || {};
  let n = posts.length + (d.links || []).length;
  if (id === "2.3") n += byYear(S.projects).length;
  if (id === "4.8") n += byYear(S.dhamma).filter(x => x.type === "dekdee" && x.spType === "monk").length;
  if (d.text) n += 1;
  if ((d.photos || []).some(img)) n += 1;
  return { posts, d, n };
}
function money(p) {
  const es = p.entries || [];
  const inc = es.filter(e => e.kind === "income").reduce((s, e) => s + (+e.amount || 0), 0);
  const exp = es.filter(e => e.kind === "expense").reduce((s, e) => s + (+e.amount || 0), 0);
  return { inc, exp, profit: inc - exp, seed: +p.seed || 0 };
}

/* ---------- layout ---------- */
const NAV = [["home","หน้าแรก","หน้าแรก"],["about","เกี่ยวกับโรงเรียน","เกี่ยวกับเรา"],["people","ผู้บริหารและบุคลากร","บุคลากร"],["way","วิถีพุทธ 29 ประการ","วิถีพุทธ 29"],["bp","Best Practice","Best Practice"],["projects","โครงงานคุณธรรม","โครงงาน"],["dhamma","ธรรมะประจำสัปดาห์","ธรรมะ"],["plans","แผนการจัดการเรียนรู้","แผนการสอน"],["innov","นวัตกรรม","นวัตกรรม"],["news","ข่าวกิจกรรม","ข่าว"],["videos","วิดีโอกิจกรรม","วิดีโอ"],["docs","เอกสารเผยแพร่","เอกสาร"],["contact","ติดต่อเรา","ติดต่อ"]];
const SVG = {
  search: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
  menu: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
  arrow: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  up: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M12 19V5M6 11l6-6 6 6"/></svg>',
  chat: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 5h16v11H9l-5 4z"/></svg>',
  gear: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>',
};
const MENU = [
  ["home", "หน้าแรก"],
  ["ข้อมูลโรงเรียน", [["about", "ประวัติและวิสัยทัศน์"], ["people", "ผู้บริหารและบุคลากร"], ["contact", "ติดต่อโรงเรียน"]]],
  ["วิถีพุทธ", [["way", "อัตลักษณ์โรงเรียนวิถีพุทธ 29 ประการ"], ["bp", "Best Practice"], ["projects", "โครงงานคุณธรรม"], ["dhamma", "ธรรมะประจำสัปดาห์"], ["plans", "แผนการจัดการเรียนรู้"], ["innov", "นวัตกรรม"]]],
  ["ข่าวสาร", [["news", "ข่าวทั้งหมด", ""], ...CATS.map(c => ["news", c, c]), ["videos", "วิดีโอกิจกรรม"]]],
  ["docs", "เอกสารเผยแพร่"],
  ["contact", "ติดต่อเรา"],
];
const MENU_DEFAULT = () => MENU.map(m => Array.isArray(m[1]) ? { t: m[0], kids: m[1].map(([k, t, c]) => ({ t, u: "#" + k + (c ? ":" + c : "") })) } : { t: m[1], u: "#" + m[0] });
const menuItems = () => (S.menu && S.menu.length ? S.menu : MENU_DEFAULT());
function linkAttr(u, inDd) {
  u = String(u || "").trim(); let m;
  if ((m = u.match(/^#news:(.+)$/))) return `href="#news" data-cat="${esc(m[1])}"`;
  if (/^#[\w-]+$/.test(u)) return `href="${esc(u)}"${u === "#news" && inDd ? ' data-cat=""' : ""}`;
  if (safeUrl(u)) return `href="#web:${encodeURIComponent(u)}"`;
  return 'href="#home"';
}
const menuText = items => items.map(m => m.kids ? [m.t, ...m.kids.map(k => `- ${k.t} | ${k.u}`)].join("\n") : `${m.t} | ${m.u}`).join("\n");
function parseMenu(txt) {
  const out = [];
  txt.split("\n").map(l => l.trim()).filter(Boolean).forEach(l => {
    const kid = /^[-–•]\s*/.test(l); const [t, u] = l.replace(/^[-–•]\s*/, "").split("|").map(x => (x || "").trim());
    if (!t) return;
    if (kid) { const last = out[out.length - 1]; if (last) { if (!last.kids) { last.kids = last.u ? [{ t: last.t, u: last.u }] : []; delete last.u; } last.kids.push({ t, u: u || "#home" }); } }
    else out.push(u ? { t, u } : { t, kids: [] });
  });
  return out.filter(m => !m.kids || m.kids.length);
}
function webLabel(u) { for (const m of menuItems()) { if (m.u === u) return m.t; for (const k of m.kids || []) if (k.u === u) return k.t; } const l = (S.links || []).find(x => x.u === u); return l ? l.t : ""; }
function menuHTML() {
  const extra = pagesList().filter(p => p.inMenu);
  const base = menuItems(), used = JSON.stringify(base);
  const ex = extra.filter(p => !used.includes("#p-" + p.id));
  const M = ex.length ? [...base.slice(0, 4), { t: "หน้าเพิ่มเติม", kids: ex.map(p => ({ t: p.title, u: "#p-" + p.id })) }, ...base.slice(4)] : base;
  return M.map(m => m.kids
    ? `<div class="dd" data-group="${esc(m.t)}"><button class="dd-btn" type="button" aria-expanded="false">${esc(m.t)}</button><div class="dd-menu">${m.kids.map(k => `<a ${linkAttr(k.u, true)}>${esc(k.t)}${/^#/.test(k.u) ? "" : ' <span class="ext">↗</span>'}</a>`).join("")}</div></div>`
    : `<a ${linkAttr(m.u)}>${esc(m.t)}</a>`).join("");
}
const thaiDay = d => ["อาทิตย์","จันทร์","อังคาร","พุธ","พฤหัสบดี","ศุกร์","เสาร์"][d.getDay()];
let searchQ = "";
const thNum = s => String(s).replace(/[0-9]/g, d => "๐๑๒๓๔๕๖๗๘๙"[d]);
function setFs(v) { document.documentElement.classList.remove("fs-s", "fs-l"); if (v) document.documentElement.classList.add(v); ls.set("wbp-fs", v); document.querySelectorAll(".fsz button").forEach(b => b.setAttribute("aria-pressed", b.dataset.fs === v)); setTimeout(() => justifyAll(), 50); }
function setWatermarks() { const r = document.documentElement.style, a = img(S.school.logo), b = img(S.school.logo2) || a; r.setProperty("--wm1", a ? `url("${a}")` : "none"); r.setProperty("--wm2", b ? `url("${b}")` : "none"); }
function shell() {
  setWatermarks();
  const sc = S.school;
  const now = new Date();
  const fs = ls.get("wbp-fs", "");
  $("#app").innerHTML = `
  <div class="util"><div class="wrap"><span>วัน${thaiDay(now)}ที่ ${now.getDate()} ${TH_MF[now.getMonth()]} พ.ศ. ${now.getFullYear() + 543}</span>
    <span class="r">${sc.phone ? `<span>โทร ${esc(sc.phone)}</span>` : ""}${safeUrl(sc.facebook) ? `<a href="${esc(sc.facebook)}" target="_blank" rel="noopener">Facebook</a>` : ""}${canEdit ? `<a href="#admin">${SVG.gear} จัดการเว็บไซต์</a>` : ""}
    <span>ขนาดตัวอักษร <span class="fsz" role="group" aria-label="ขนาดตัวอักษร"><button data-fs="fs-s" aria-pressed="${fs === "fs-s"}">ก-</button><button data-fs="" aria-pressed="${!fs}">ก</button><button data-fs="fs-l" aria-pressed="${fs === "fs-l"}">ก+</button></span></span></span></div></div>
  <div class="mast"><div class="wrap">
    <a class="logo" href="#home"><span class="mark${img(sc.logo) ? " img" : ""}">${img(sc.logo) ? `<img src="${img(sc.logo)}" alt="ตราโรงเรียน">` : LOTUS}</span>${img(sc.logo2) ? `<span class="mark img m2"><img src="${img(sc.logo2)}" alt="ตราโรงเรียนวิถีพุทธ"></span>` : ""}<span><b>${esc(sc.name)}</b>${sc.nameEn ? `<span class="en">${esc(sc.nameEn)}</span>` : ""}<small>โรงเรียนวิถีพุทธ · ${esc(sc.areaFull || sc.area)}</small></span></a>
    <form class="msearch" id="searchF" role="search"><input id="searchIn" placeholder="ค้นหาข่าวและประกาศ" aria-label="ค้นหา" value="${esc(searchQ)}"><button type="submit" aria-label="ค้นหา">${SVG.search}</button></form>
  </div><div class="rule2"></div></div>
  <header class="site"><div class="wrap">
    <nav class="main" id="mainNav" aria-label="เมนูหลัก">${menuHTML()}</nav>
    <button class="menu-btn" id="menuBtn" aria-expanded="false" aria-controls="mainNav">${SVG.menu} เมนูหลัก</button>
  </div></header>
  <main id="view"></main>
  <footer><div class="wrap">
    <div>${[sc.logo, sc.logo2].some(img) ? `<div class="f-ems">${[sc.logo, sc.logo2].filter(img).map(x => `<span><img src="${img(x)}" alt=""></span>`).join("")}</div>` : ""}<div class="big">${esc(sc.name)}</div><p>${esc(sc.address)}</p><p>${esc(sc.areaFull || sc.area)}</p>${sc.code ? `<p>รหัสโรงเรียน ${esc(sc.code)}</p>` : ""}${sc.phone ? `<p>โทรศัพท์ ${esc(sc.phone)}</p>` : ""}${sc.email ? `<p>อีเมล ${esc(sc.email)}</p>` : ""}${safeUrl(sc.map) ? `<p><a href="${esc(sc.map)}" target="_blank" rel="noopener">แผนที่โรงเรียน ↗</a></p>` : ""}</div>
    <div><h4>เมนูหลัก</h4><ul>${NAV.slice(1).map(([k, t]) => `<li><a href="#${k}">${t}</a></li>`).join("")}</ul></div>
    <div><h4>หน่วยงานทางการศึกษา</h4><ul>${(S.links || []).filter(l => safeUrl(l.u)).map(l => `<li><a href="${esc(l.u)}" target="_blank" rel="noopener">${esc(l.t)} ↗</a></li>`).join("")}</ul></div>
  </div><div class="copy"><div class="wrap"><span>© ${now.getFullYear() + 543} ${esc(sc.name)} สงวนลิขสิทธิ์</span><span>โรงเรียนวิถีพุทธ · ${esc(sc.area)}</span></div></div></footer>
  <button class="totop" id="toTop" aria-label="กลับขึ้นด้านบน"><span class="tt-in">${SVG.up}</span></button>
  <div id="savebar"></div>`;
  $("#menuBtn").onclick = () => { const n = $("#mainNav"); n.classList.toggle("open"); $("#menuBtn").setAttribute("aria-expanded", n.classList.contains("open")); };
  document.querySelectorAll(".fsz button").forEach(b => b.onclick = () => setFs(b.dataset.fs));
  $("#mainNav").addEventListener("click", e => {
    const b = e.target.closest(".dd-btn");
    if (b) { const dd = b.parentElement, was = dd.classList.contains("open"); closeMenus(); if (!was) { dd.classList.add("open"); b.setAttribute("aria-expanded", "true"); } return; }
    const a = e.target.closest("a[data-cat]"); if (a) { newsCat = a.dataset.cat; searchQ = ""; if (ROUTE === "#news") render(); }
  });
  $("#searchF").onsubmit = e => { e.preventDefault(); searchQ = $("#searchIn").value.trim(); newsCat = ""; if (ROUTE === "#news") render(); else go("#news"); };
  $("#toTop").onclick = () => scrollTo({ top: 0, behavior: "smooth" });
  renderSaveBar();
}
function closeMenus() { document.querySelectorAll(".dd.open").forEach(d => { d.classList.remove("open"); d.querySelector(".dd-btn").setAttribute("aria-expanded", "false"); }); }
document.addEventListener("click", e => { if (!e.target.closest(".dd")) closeMenus(); });
document.addEventListener("keydown", e => { if (e.key === "Escape") closeMenus(); });
addEventListener("scroll", () => { const t = $("#toTop"); if (!t) return; const d = document.documentElement, max = d.scrollHeight - innerHeight; t.classList.toggle("show", d.scrollTop > 600); t.style.setProperty("--p", max > 0 ? Math.min(100, d.scrollTop / max * 100).toFixed(1) : 0); }, { passive: true });
try { const f = localStorage.getItem("wbp-fs"); if (f) document.documentElement.classList.add(JSON.parse(f)); } catch {}
function pageHead(title, sub, crumb) { return `<div class="page-hd"><div class="wrap"><div class="crumb"><a href="#home">หน้าแรก</a><span>/</span><span>${esc(crumb || title)}</span></div><h1>${esc(title)}</h1>${sub ? `<p>${esc(sub)}</p>` : ""}</div></div><!--SPLIT-->`; }
function emptyBox(t) { return `<div class="empty">${LOTUS}${t}</div>`; }
const isNew = p => p.date && (Date.now() - new Date(p.date).getTime()) < 7 * 864e5;
function postCard(p) {
  const ph = (p.photos || [])[0];
  return `<a class="card reveal" href="#post-${esc(p.id)}"><div class="ph">${img(ph) ? `<img src="${img(ph)}" alt="" loading="lazy">` : LOTUS}</div><div class="bd"><span class="meta"><span class="cat">${esc(p.cat || "ข่าวกิจกรรม")}</span> · ${thDate(p.date, true)}${isNew(p) ? `<span class="newb">ใหม่</span>` : ""}</span><h3>${esc(p.title)}</h3></div></a>`;
}
function yearPicker(id) { const ys = [...(S.years || [])].sort().reverse(); return ys.length > 1 ? `<label class="hint">ปีการศึกษา <select id="${id}">${ys.map(y => `<option ${y === viewYear ? "selected" : ""}>${y}</option>`).join("")}</select></label>` : ""; }
function bindYear(id) { const el = document.getElementById(id); if (el) el.onchange = e => { viewYear = e.target.value; render(); }; }
const QUOTES = [
  ["อตฺตา หิ อตฺตโน นาโถ", "ตนแลเป็นที่พึ่งแห่งตน"],
  ["วิริเยน ทุกฺขมจฺเจติ", "คนจะล่วงทุกข์ได้เพราะความเพียร"],
  ["สจฺจํ เว อมตา วาจา", "คำสัตย์แล เป็นวาจาไม่ตาย"],
  ["ปญฺญา โลกสฺมิ ปชฺโชโต", "ปัญญาเป็นแสงสว่างในโลก"],
  ["สุขา สงฺฆสฺส สามคฺคี", "ความพร้อมเพรียงของหมู่ ให้เกิดสุข"],
  ["ขนฺตี ปรมํ ตโป ตีติกฺขา", "ความอดทน คือความอดกลั้น เป็นตบะอย่างยิ่ง"],
  ["อปฺปมาโท อมตํ ปทํ", "ความไม่ประมาท เป็นทางไม่ตาย"],
];
/* ---------- views ---------- */
const QI = d => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const QUICK = [
  ["way", "อัตลักษณ์ ๒๙ ประการ", QI('<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="2.2"/><path d="M12 3.5v6.3M12 14.2v6.3M3.5 12h6.3M14.2 12h6.3M6 6l4.4 4.4M13.6 13.6 18 18M18 6l-4.4 4.4M10.4 13.6 6 18"/>')],
  ["bp", "Best Practice", QI('<path d="M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.4 6.8 19.1l1-5.8-4.3-4.1 5.9-.9z"/>')],
  ["projects", "โครงงานคุณธรรม", QI('<path d="M7 11V7a2 2 0 0 1 4 0v4M11 9V5a2 2 0 0 1 4 0v6M15 8a2 2 0 0 1 4 0v5a7 7 0 0 1-14 0v-2a2 2 0 0 1 4 0"/>')],
  ["dhamma", "ธรรมะประจำสัปดาห์", QI('<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5zM4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5"/>')],
  ["people", "ผู้บริหารและบุคลากร", QI('<circle cx="9" cy="8" r="3.2"/><path d="M3 20c.6-3.6 3-5.6 6-5.6s5.4 2 6 5.6"/><circle cx="17" cy="9" r="2.6"/><path d="M15.5 14.6c2.6-.4 4.9 1.3 5.5 4.4"/>')],
  ["docs", "เอกสารเผยแพร่", QI('<path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8z"/><path d="M14 3v5h5M8.5 13h7M8.5 16.5h7"/>')]];
const LINKI = '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 10 12 4l9 6M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20h18"/></svg>';
const V = {};
V.home = () => {
  const sc = S.school, posts = sortDate(byYear(S.posts));
  const ev = Object.fromEntries(ALL.map(([id]) => [id, indEvidence(id).n]));
  const have = Object.values(ev).filter(v => v > 0).length;
  const evts = (S.events || []).filter(e => (e.end || e.date) >= today()).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 4);
  const pj = byYear(S.projects);
  const st = sc.stats || {};
  const q = QUOTES[Math.floor(Date.now() / 864e5) % QUOTES.length];
  const hero = (sc.hero || []).filter(img);
  const capEms = [sc.logo, sc.logo2].filter(img).length ? `<span class="cap-ems">${[sc.logo, sc.logo2].filter(img).map(x => `<img src="${img(x)}" alt="">`).join("")}</span>` : "";
  const slides = [...hero.map(h => ({ hero: h })), ...posts.filter(p => img((p.photos || [])[0])).slice(0, 4)];
  const feat = posts[0], rest = posts.slice(1, 6);
  const info = [[st.students, "นักเรียน", "คน"], [st.teachers, "ครูและบุคลากร", "คน"], [have, "อัตลักษณ์ที่มีหลักฐาน", "จาก 29 ประการ"], [pj.length, "โครงงานคุณธรรม", "เรื่อง"]].filter(x => x[0] !== "" && x[0] != null);
  let sec = 0; const no = () => thNum(++sec);
  return `
  ${(() => { const items = [...(S.events || []).filter(e => (e.end || e.date) >= today()).sort((a, b) => a.date.localeCompare(b.date)).map(e => [`${thDate(e.date, true)}${e.time ? " เวลา " + e.time.replace(":", ".") + " น." : ""}`, e.title, "#news"]), ...posts.slice(0, 6).map(p => [thDate(p.date, true), p.title, "#post-" + p.id])];
    if (!items.length) return "";
    const one = items.map(([d, t, h]) => `<a href="${esc(h)}"><b>${esc(d)}</b> ${esc(t)}</a>`).join('<i aria-hidden="true">✦</i>');
    return `<div class="ticker"><div class="wrap"><span class="tk-l">ข่าวล่าสุด</span><div class="tk-w"><div class="tk-t">${one}<i aria-hidden="true">✦</i>${one}<i aria-hidden="true">✦</i></div></div></div></div>`; })()}
  <section class="hero"><div class="wrap grid">
    <div class="frame reveal"><div class="slider" id="slider">
      <div class="slide intro on"><div>${img(sc.logo) || img(sc.logo2) ? `<div class="ems">${[sc.logo, sc.logo2].filter(img).map(x => `<span><img src="${img(x)}" alt=""></span>`).join("")}</div>` : `<div class="em">${LOTUS}</div>`}<h2>${esc(sc.name)}</h2>${sc.motto ? `<p>${esc(sc.motto)}</p>` : ""}${(sc.virtues || []).length ? `<div class="vir">คุณธรรมอัตลักษณ์ · ${sc.virtues.map(v => `<span style="white-space:nowrap">${esc(v)}</span>`).join(" · ")}</div>` : ""}<div class="hero-btns"><a class="hb pri" href="#way">อัตลักษณ์ ๒๙ ประการ</a><a class="hb" href="#bp">Best Practice</a></div></div></div>
      ${slides.map(p => p.hero ? `<div class="slide"><img src="${img(p.hero)}" alt="ภาพบรรยากาศ${esc(sc.name)}" style="object-position:center 78%"><span class="cap">${capEms}<span><b>${esc(sc.name)}</b>${sc.motto ? `<small>${esc(sc.motto)}</small>` : ""}</span></span></div>` : `<a class="slide" href="#post-${esc(p.id)}"><img src="${img(p.photos[0])}" alt=""><span class="cap">${capEms}<span><small>${thDate(p.date, true)} · ${esc(p.cat || "")}</small><b>${esc(p.title)}</b></span></span></a>`).join("")}
      ${slides.length ? `<div class="sdots">${[0, ...slides.map((_, i) => i + 1)].map(i => `<button data-sl="${i}" aria-label="ภาพที่ ${i + 1}" aria-pressed="${i === 0}"></button>`).join("")}</div>` : ""}
    </div></div>
    <div class="notice reveal"><div class="box-hd">ประกาศและกิจกรรม<a href="#news">ทั้งหมด ›</a></div>
      <ul>${evts.map((e, i) => { const [y, m, d] = e.date.split("-").map(Number); return `<li><span class="dbox"><b>${d}</b><span>${TH_M[m - 1]} ${String(y + 543).slice(2)}</span></span><span><b>${esc(e.title)}</b>${e.time ? `<span class="meta">เวลา ${esc(e.time.replace(":", "."))} น.</span> ` : ""}${e.detail ? `<span class="meta">${esc(e.detail)}</span>` : ""}</span></li>`; }).join("")}
      ${posts.slice(0, Math.max(0, 4 - evts.length)).map(p => { const [y, m, d] = (p.date || today()).split("-").map(Number); return `<li><span class="dbox"><b>${d}</b><span>${TH_M[m - 1]} ${String(y + 543).slice(2)}</span></span><span><a href="#post-${esc(p.id)}" style="color:inherit;text-decoration:none"><b>${esc(p.title)}</b></a><span class="meta">${esc(p.cat || "")}</span></span></li>`; }).join("")}
      ${!evts.length && !posts.length ? `<li style="display:block" class="meta">ยังไม่มีประกาศ</li>` : ""}</ul></div>
  </div></section>

  ${(() => { const e = (S.events || []).filter(x => x.time && new Date(x.date + "T" + x.time + ":00+07:00").getTime() > Date.now()).sort((a, b) => a.date.localeCompare(b.date))[0];
    return e ? `<section class="wrap"><div class="cdband reveal"><div class="cd-t"><span class="cd-k">นับถอยหลัง</span><b>${esc(e.title)}</b><span>${thDate(e.date, true)} เวลา ${esc(e.time.replace(":", "."))} น.</span></div><div class="cdbox" id="cd" data-t="${esc(e.date)}T${esc(e.time)}"><div><b>–</b><span>วัน</span></div><div><b>–</b><span>ชั่วโมง</span></div><div><b>–</b><span>นาที</span></div><div><b>–</b><span>วินาที</span></div></div></div></section>` : ""; })()}
  <section class="wrap"><nav class="quick reveal" aria-label="บริการด่วน">${QUICK.map(([h, t, ic]) => `<a href="#${h}"><span class="qi">${ic}</span><b>${t}</b></a>`).join("")}</nav></section>
  ${homeVideos(no)}
  ${info.length ? `<section class="sec" style="padding-top:30px"><div class="wrap"><div class="st"><h2><span class="no">${no()}</span>ข้อมูลพื้นฐาน</h2><a href="#about">ข้อมูลโรงเรียน ›</a></div>
    <div class="info reveal">${info.map(([v, l, u]) => `<div><span>${l}</span><b data-count="${+v || 0}">${num(v)}</b><small>${u}</small></div>`).join("")}</div></div></section>` : ""}

  <section class="sec paper"><div class="wrap"><div class="st"><h2><span class="no">${no()}</span>อัตลักษณ์โรงเรียนวิถีพุทธ ๒๙ ประการ</h2><a href="#way">หลักฐานรายข้อ ›</a></div>
    <div class="score">
      <div class="sc-table reveal">${IND.map(([g, items]) => `<div class="sc-row"><div class="lbl">${esc(g)}</div><div class="cells">${items.map(([id, t]) => `<a class="cell ${ev[id] > 0 ? "on" : ""}" href="#way" title="${esc(id + " " + t)}">${id}</a>`).join("")}</div><div class="cnt">${items.filter(([id]) => ev[id] > 0).length}/${items.length}</div></div>`).join("")}</div>
      <div class="sc-side reveal"><div class="meta">เผยแพร่หลักฐานแล้ว</div><div class="big">${have}<small> / 29</small></div><div class="bar"><i id="scBar" style="width:0" data-w="${(have / 29 * 100).toFixed(1)}%"></i></div><div class="meta">ปีการศึกษา ${esc(viewYear)}</div>
        <div class="legend"><span><i class="on"></i>มีหลักฐานเผยแพร่</span><span><i></i>รอเผยแพร่</span></div>
        <p>ตัวชี้วัดตามแนวทางโรงเรียนวิถีพุทธของสำนักงานคณะกรรมการการศึกษาขั้นพื้นฐาน กดหมายเลขข้อเพื่อดูหลักฐาน</p></div>
    </div></div></section>

  <section class="sec"><div class="wrap"><div class="st"><h2><span class="no">${no()}</span>ข่าวประชาสัมพันธ์</h2><a href="#news">ข่าวทั้งหมด ›</a></div>
    ${feat ? `<div class="news"><a class="feature reveal" href="#post-${esc(feat.id)}"><div class="ph">${img((feat.photos || [])[0]) ? `<img src="${img(feat.photos[0])}" alt="">` : LOTUS}</div><div class="meta" style="margin-top:12px"><span class="cat">${esc(feat.cat || "ข่าวกิจกรรม")}</span> · ${thDate(feat.date, true)}${isNew(feat) ? `<span class="newb">ใหม่</span>` : ""}</div><h3>${esc(feat.title)}</h3></a>
      <ul class="nlist reveal">${rest.map(p => `<li><a href="#post-${esc(p.id)}"><span class="th">${img((p.photos || [])[0]) ? `<img src="${img(p.photos[0])}" alt="" loading="lazy">` : LOTUS}</span><span><span class="meta"><span class="cat">${esc(p.cat || "")}</span> · ${thDate(p.date)}</span><b>${esc(p.title)}</b></span></a></li>`).join("") || `<li class="meta" style="padding:12px 0">ข่าวอื่นจะแสดงที่นี่</li>`}</ul></div>`
      : emptyBox(`ยังไม่มีข่าวประชาสัมพันธ์ในปีการศึกษา ${esc(viewYear)}${canEdit ? ` · <a href="#admin">เพิ่มข่าว</a>` : ""}`)}
  </div></section>

  <section class="sec paper"><div class="wrap"><div class="st"><h2><span class="no">${no()}</span>สารจากผู้อำนวยการ</h2></div>
    <div class="dir reveal"><div class="portrait"><div class="pic">${img(dirPhoto()) ? `<img src="${img(dirPhoto())}" alt="${esc(sc.director?.name)}">` : "ภาพผู้อำนวยการ"}</div><div class="nm">${esc(sc.director?.name)}</div><div class="ps">ผู้อำนวยการ${esc(sc.name)}</div></div>
      <div>${sc.director?.message ? `<div class="letter">${paras(sc.director.message)}</div><div class="sign"><b>${esc(sc.director?.name)}</b><span>ผู้อำนวยการ${esc(sc.name)}</span></div>` : `<div class="empty" style="text-align:left">ส่วนนี้แสดงสารจากผู้อำนวยการ${canEdit ? ` · เพิ่มข้อความได้ที่ <a href="#admin">จัดการเว็บไซต์ › ข้อมูลโรงเรียน</a>` : ""}</div>`}</div></div>
  </div></section>

  <section class="sec"><div class="wrap"><div class="st"><h2><span class="no">${no()}</span>แนวปฏิบัติที่เป็นเลิศ (Best Practice)</h2><a href="#bp">รายละเอียด ›</a></div>
    <p style="margin:0 0 14px"><b style="font-family:var(--f-head);font-size:1.12em">${esc(S.bp?.title || "")}</b> <span class="meta">· บูรณาการหลัก${esc(S.bp?.dhamma || "")}</span></p>
    <div class="tw reveal"><table class="bp"><thead><tr><th>ขั้น</th><th>กระบวนการ</th><th>หลักธรรม</th><th>การดำเนินงาน</th></tr></thead><tbody>${(S.bp?.steps || []).map((s, i) => `<tr><td>${thNum(i + 1)}</td><td><b>${esc(s.title)}</b></td><td class="tr">${esc(s.truth)}</td><td>${esc(s.detail || "")}</td></tr>`).join("")}</tbody></table></div>
    <div class="bp-foot reveal"><div class="bp-media">${rotBox(S.bp?.photos, canEdit ? "เพิ่มภาพได้ที่ จัดการเว็บไซต์ › Best Practice" : "ภาพกิจกรรม Best Practice")}</div>${(S.bp?.results || []).length ? `<div class="rs-grid">${S.bp.results.map(r => `<div class="rs"><b>${esc(r.value)}</b><span>${esc(r.label)}</span></div>`).join("")}</div>` : ""}</div>
  </div></section>

  ${(() => { const ks = [...byYear(S.plans).map(x => [x, "plans"]), ...byYear(S.innovs).map(x => [x, "innov"])].sort((a, b) => String(b[0].date || "").localeCompare(String(a[0].date || ""))).slice(0, 4); return ks.length ? `<section class="sec"><div class="wrap"><div class="st"><h2><span class="no">${no()}</span>แผนการจัดการเรียนรู้และนวัตกรรม</h2><span class="st-links"><a href="#plans">แผนการสอน ›</a><a href="#innov">นวัตกรรม ›</a></span></div><div class="kcs">${ks.map(([x, k]) => kitCard(x, k)).join("")}</div></div></section>` : ""; })()}
  <section class="sec paper"><div class="wrap two">
    <div><div class="st"><h2><span class="no">${no()}</span>โครงงานคุณธรรม</h2><a href="#projects">ทั้งหมด ›</a></div>${pj.length ? pj.slice(0, 2).map(p => { const m = money(p); return `<article class="hc reveal">${rotBox(p.photos, canEdit ? "เพิ่มภาพได้ที่ จัดการเว็บไซต์ › โครงงานคุณธรรม" : "ภาพโครงงานจะแสดงที่นี่")}<div class="hc-bd"><span class="chip">${esc(p.dhamma)}</span><h3><a href="#projects">${esc(p.name)}</a></h3><p class="meta">${esc(p.target || "")}${p.students ? " · " + num(p.students) + " คน" : ""}</p>${p.summary ? `<p class="hc-sum">${esc(short(p.summary, 170))}</p>` : ""}${m.inc ? moneyCards(m) : ""}<div class="hc-ft"><a class="more" href="#projects">อ่านรายละเอียด ›</a>${docBtn(p.doc, "เล่มรายงาน · " + p.name)}${safeUrl(p.slides) ? `<a class="docb" href="${esc(p.slides)}" data-file="${esc(p.slides)}" data-ft="สไลด์นำเสนอ · ${esc(p.name)}">${SVG.arrow} สไลด์นำเสนอ</a>` : ""}</div></div></article>`; }).join("") : emptyBox("ยังไม่มีโครงงานในปีนี้")}</div>
    <div><div class="st"><h2><span class="no">${no()}</span>ธรรมะประจำสัปดาห์</h2><a href="#dhamma">ทั้งหมด ›</a></div>${(() => { const all = sortDate(byYear(S.dhamma)); return `<div class="dh-list">${(S.dhammaInfo || []).map(x => { const t = dhType(x.name), rec = all.filter(d => d.type === t), last = rec[0];
      return `<article class="hc hc-row reveal">${rotBox(rec.flatMap(d => d.photos || []), canEdit ? "เพิ่มภาพได้ที่ จัดการเว็บไซต์ › ธรรมะประจำสัปดาห์" : "ภาพกิจกรรมจะแสดงที่นี่")}<div class="hc-bd"><h3><a href="#dhamma">${esc(x.name)}</a></h3>${last ? `<p class="hc-last"><span>ล่าสุด ${thDate(last.date)}</span> ${esc(last.topic)}</p>` : ""}<p class="hc-sum">${esc(short(x.text, 130))}</p><div class="hc-ft"><a class="more" href="#dhamma">ดูบันทึกทั้งหมด ›</a>${docBtn(last?.doc)}</div></div></article>`; }).join("")}</div>`; })()}</div>
  </div></section>

  ${homePages(no)}
  <section class="wrap"><div class="quote reveal"><div class="k">พุทธศาสนสุภาษิตประจำวัน</div><div class="pali">${q[0]}</div><div class="th">${q[1]}</div></div></section>

  ${(() => { const ds = sortDate(byYear(S.docs)).slice(0, 4); return ds.length ? `<section class="sec"><div class="wrap"><div class="st"><h2><span class="no">${no()}</span>เอกสารเผยแพร่</h2><a href="#docs">ทั้งหมด ›</a></div><div class="dcs reveal">${ds.map(docCard).join("")}</div></div></section>` : ""; })()}
  <section class="sec"><div class="wrap"><div class="st"><h2><span class="no">${no()}</span>หน่วยงานทางการศึกษา</h2></div><div class="links2">${(S.links || []).filter(l => safeUrl(l.u)).map(l => `<a href="#web:${encodeURIComponent(l.u)}"><span class="lk-i">${LINKI}</span><span class="lk-t"><b>${esc(l.t)}</b><small>${esc(l.u.replace(/^https?:\/\//, "").replace(/\/$/, ""))}</small></span><span class="lk-a">${SVG.arrow}</span></a>`).join("")}</div></div></section>`;
};
function rotBox(ids, empty) {
  const ph = [...new Set(ids || [])].filter(img);
  return ph.length ? `<div class="ind-ph rot" data-gal>${ph.map((x, i) => `<img src="${img(x)}" alt="ภาพกิจกรรม ${i + 1}" data-zoom class="${i === 0 ? "on" : ""}">`).join("")}${ph.length > 1 ? `<span class="cnt">${ph.length} ภาพ</span><span class="dots">${ph.map((_, i) => `<i class="${i === 0 ? "on" : ""}"></i>`).join("")}</span>` : ""}</div>`
    : `<div class="ind-ph none rot">${LOTUS}<span>${empty || "ภาพกิจกรรมจะแสดงที่นี่"}</span></div>`;
}
const short = (t, n) => { t = String(t || "").replace(/\s+/g, " ").trim(); return t.length > n ? t.slice(0, n).replace(/\s\S*$/, "") + "…" : t; };
const docBtn = (u, t) => safeUrl(u) ? `<a class="docb" href="${esc(u)}" data-file="${esc(u)}" data-ft="${esc(t || "เอกสาร")}">${SVG.arrow} เปิดเอกสาร</a>` : "";
const dhType = name => /5\s*นาที/.test(name) ? "5min" : "dekdee";
function moneyCards(m, full) { return `<div class="mcards">${[[m.inc, "รายรับ"], [m.exp, "รายจ่าย"], [m.profit, "กำไรสุทธิ"], ...(full && m.seed ? [[m.seed, "เงินตั้งต้น"], [m.profit - m.seed, "คงเหลือหลังคืนทุน"]] : [])].map(([v, l]) => `<div><b>${num(v)}</b><span>${l} (บาท)</span></div>`).join("")}</div>`; }
const driveId = u => (String(u || "").match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?id=)([\w-]{20,})/) || [])[1] || "";
const DOCI = '<svg viewBox="0 0 24 24" width="44" height="44" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8z"/><path d="M14 3v5h5M8.5 13h7M8.5 16.5h7"/></svg>';
const fmtMB = b => (b / 1048576).toFixed(1) + " MB";
function pdfInfoHTML() { return pendingPdf ? `<span class="pdfchip">${DOCI}<span><b>${esc(pendingPdf.name || "เอกสาร.pdf")}</b><small>${pendingPdf.pages ? pendingPdf.pages + " หน้า · " : ""}${pendingPdf.size ? fmtMB(pendingPdf.size) : ""}</small></span><button type="button" class="btn sm" data-rmpdf>เอาออก</button></span>` : `<span class="hint">ยังไม่มีไฟล์</span>`; }
let pdfLibP = null;
function loadPdf() {
  if (window.pdfjsLib) return Promise.resolve(window.pdfjsLib);
  return pdfLibP = pdfLibP || new Promise((res, rej) => { const sc = document.createElement("script"); sc.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
    sc.onload = () => { const L = window.pdfjsLib; if (!L) return rej(new Error("pdf")); L.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js"; res(L); };
    sc.onerror = () => { pdfLibP = null; rej(new Error("pdf")); }; document.head.append(sc); });
}
const coverCache = {};
function docCard(d) {
  const cov = img((d.photos || [])[0]), did = driveId(d.url), can = d.file || did || safeUrl(d.url);
  return `<button type="button" class="dc" data-doc="${esc(d.id)}"${can ? "" : " disabled"}><span class="dc-cv"><span class="dc-ph">${DOCI}</span>${cov ? `<img src="${cov}" alt="">` : d.file ? `<img data-pdfcov="${esc(d.file.id)}" alt="" hidden>` : did ? `<img data-ext src="https://drive.google.com/thumbnail?id=${esc(did)}&sz=w600" alt="">` : ""}${d.cat ? `<span class="dc-cat">${esc(d.cat)}</span>` : ""}<span class="dc-eye">อ่านเอกสาร</span></span><span class="dc-bd"><b>${esc(d.title)}</b><small>${d.date ? thDate(d.date) : ""}${d.file?.pages ? ` · ${d.file.pages} หน้า` : ""}${d.file ? " · PDF" : did ? " · Google Drive" : ""}</small>${d.desc ? `<span class="dc-ds">${esc(d.desc)}</span>` : ""}</span></button>`;
}
async function paintCovers() {
  document.querySelectorAll(".dc-cv img[data-ext], .vc-cv img[data-ext], .hv img[data-ext], .rt-cv img[data-ext]").forEach(im => { im.onerror = () => im.remove(); });
  const ims = [...document.querySelectorAll("img[data-pdfcov]")]; if (!ims.length) return;
  let L; try { L = await loadPdf(); } catch { return; }
  for (const im of ims) { const id = im.dataset.pdfcov;
    try { if (!coverCache[id]) { const pdf = await L.getDocument("/_blob/" + id).promise, pg = await pdf.getPage(1), v0 = pg.getViewport({ scale: 1 }), v = pg.getViewport({ scale: 520 / v0.width }); const c = document.createElement("canvas"); c.width = v.width; c.height = v.height; await pg.render({ canvasContext: c.getContext("2d"), viewport: v }).promise; coverCache[id] = c.toDataURL("image/jpeg", .82); }
      document.querySelectorAll(`img[data-pdfcov="${id}"]`).forEach(x => { x.src = coverCache[id]; x.hidden = false; }); } catch {} }
}
let dvKey = null;
function closeDoc() { if (document.fullscreenElement) document.exitFullscreen().catch(() => {}); $(".dv")?.remove(); document.body.style.overflow = ""; if (dvKey) removeEventListener("keydown", dvKey); dvKey = null; }
async function openDoc(id) {
  const d = (S.docs || []).find(x => x.id === id); if (!d) return;
  closeDoc();
  const did = driveId(d.url), box = document.createElement("div"); box.className = "dv"; box.setAttribute("role", "dialog"); box.setAttribute("aria-label", d.title);
  box.innerHTML = `<div class="dv-bar"><span class="dv-t"><b>${esc(d.title)}</b><small id="dvInfo">${esc(d.cat || "")}</small></span><span class="dv-act"><button type="button" class="btn sm" data-full></button>${d.file ? `<button type="button" class="btn sm" id="dvDl" hidden>ดาวน์โหลด</button>` : ""}${safeUrl(d.url) ? `<a class="btn sm" href="${esc(d.url)}" target="_blank" rel="noopener">เปิดในแท็บใหม่ ↗</a>` : ""}<button type="button" class="dv-x" aria-label="ปิด">×</button></span></div><div class="dv-body"></div>`;
  document.body.append(box); document.body.style.overflow = "hidden";
  box.querySelector(".dv-x").onclick = closeDoc; box.addEventListener("click", e => { if (e.target === box) closeDoc(); });
  dvKey = e => { if (e.key === "Escape" && !document.fullscreenElement) closeDoc(); }; addEventListener("keydown", dvKey);
  fsButton(box);
  const body = box.querySelector(".dv-body");
  if (d.file) (async () => { let dl = null; try { dl = await window.claude?.use?.("downloads"); } catch {} const bt = $("#dvDl"); if (!dl || !bt) return; bt.hidden = false;
    bt.onclick = async () => { try { const blob = await (await fetch("/_blob/" + d.file.id)).blob(); const fn = (d.file.name && /\.pdf$/i.test(d.file.name) ? d.file.name : (d.title || "เอกสาร") + ".pdf").replace(/[\\/:*?"<>|]/g, " "); await dl.save({ filename: fn, data: blob }); } catch (er) { if (er?.code && er.code !== "declined") toast("ดาวน์โหลดไม่สำเร็จ"); } }; })();
  if (d.file) {
    body.innerHTML = `<p class="dv-msg">กำลังเปิดเอกสาร…</p>`;
    try { const L = await loadPdf(), pdf = await L.getDocument("/_blob/" + d.file.id).promise; if (!box.isConnected) return;
      body.innerHTML = ""; const info = $("#dvInfo"); if (info) info.textContent = `${d.cat ? d.cat + " · " : ""}${thNum(pdf.numPages)} หน้า`;
      const W = Math.min(900, body.clientWidth - 24), dpr = Math.min(2, devicePixelRatio || 1);
      const pages = []; for (let n = 1; n <= pdf.numPages; n++) { const c = document.createElement("canvas"); c.className = "dv-pg"; c.dataset.n = n; c.style.width = W + "px"; c.style.height = Math.round(W * 1.414) + "px"; body.append(c); pages.push(c); }
      const draw = async c => { if (c.dataset.done) return; c.dataset.done = 1; const pg = await pdf.getPage(+c.dataset.n), v0 = pg.getViewport({ scale: 1 }), v = pg.getViewport({ scale: W / v0.width * dpr }); c.width = v.width; c.height = v.height; c.style.height = Math.round(v.height / dpr) + "px"; await pg.render({ canvasContext: c.getContext("2d"), viewport: v }).promise; };
      const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { draw(en.target); io.unobserve(en.target); } }), { root: body, rootMargin: "600px 0px" });
      pages.forEach(c => io.observe(c));
    } catch { body.innerHTML = `<p class="dv-msg">เปิดเอกสารในหน้านี้ไม่ได้ ลองใหม่อีกครั้ง</p>`; }
  } else if (did) body.innerHTML = `<iframe src="https://drive.google.com/file/d/${esc(did)}/preview" title="${esc(d.title)}" allow="autoplay"></iframe>`;
  else if (safeUrl(d.url)) body.innerHTML = `<iframe src="${esc(d.url)}" title="${esc(d.title)}"></iframe>`;
}
document.addEventListener("click", e => { const b = e.target.closest("[data-doc]"); if (b && !b.disabled) { e.preventDefault(); openDoc(b.dataset.doc); } });
/* ---------- ไฟล์และสไลด์: แนบลิงก์ แล้วเปิดดูในเว็บไซต์ได้ทันที (ขยายเต็มจอได้) ---------- */
function fileInfo(u) {
  u = String(u || "").trim(); if (!safeUrl(u)) return null; let m;
  const th = id => `https://drive.google.com/thumbnail?id=${id}&sz=w800`;
  if ((m = u.match(/docs\.google\.com\/presentation\/d\/([\w-]{20,})/))) return { kind: "Google Slides", embed: `https://docs.google.com/presentation/d/${m[1]}/embed?start=false&loop=false&delayms=60000`, thumb: th(m[1]) };
  if ((m = u.match(/docs\.google\.com\/document\/d\/([\w-]{20,})/))) return { kind: "Google Docs", embed: `https://docs.google.com/document/d/${m[1]}/preview`, thumb: th(m[1]) };
  if ((m = u.match(/docs\.google\.com\/spreadsheets\/d\/([\w-]{20,})/))) return { kind: "Google Sheets", embed: `https://docs.google.com/spreadsheets/d/${m[1]}/preview`, thumb: th(m[1]) };
  if ((m = driveId(u))) return { kind: "Google Drive", embed: `https://drive.google.com/file/d/${m}/preview`, thumb: th(m) };
  if ((m = u.match(/canva\.com\/design\/([\w-]+)(?:\/([\w-]+))?/))) { const tk = m[2] && !/^(view|edit|watch)$/.test(m[2]) ? "/" + m[2] : ""; return { kind: "Canva", embed: `https://www.canva.com/design/${m[1]}${tk}/view?embed` }; }
  if (/\.(pptx?|docx?|xlsx?)(\?|#|$)/i.test(u)) return { kind: "Office", embed: `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(u)}` };
  if (/\.pdf(\?|#|$)/i.test(u)) return { kind: "PDF", embed: u };
  if (/^https:\/\/[^/]+\.(vercel\.app|netlify\.app|github\.io|pages\.dev|web\.app|firebaseapp\.com)(\/|$)/i.test(u)) return { kind: "สไลด์บนเว็บ", embed: u, live: true };
  return { kind: "ลิงก์", embed: u };
}
function fsButton(box) {
  const b = box.querySelector("[data-full]"); if (!b) return;
  const sync = () => { const on = document.fullscreenElement === box || box.classList.contains("dv-max"); b.textContent = on ? "ย่อหน้าจอ" : "⛶ ขยายเต็มจอ"; };
  b.onclick = async () => {
    if (document.fullscreenElement === box) { await document.exitFullscreen().catch(() => {}); box.classList.remove("dv-max"); }
    else if (box.classList.contains("dv-max")) box.classList.remove("dv-max");
    else { box.classList.add("dv-max"); try { await box.requestFullscreen?.(); } catch {} }
    sync();
  };
  box.addEventListener("fullscreenchange", () => { if (!document.fullscreenElement) box.classList.remove("dv-max"); sync(); });
  sync();
}
function openFile(url, title, sub) {
  const fi = fileInfo(url); if (!fi) return;
  closeDoc(); closeVid();
  const box = document.createElement("div"); box.className = "dv"; box.setAttribute("role", "dialog"); box.setAttribute("aria-modal", "true"); box.setAttribute("aria-label", title || "เอกสาร");
  box.innerHTML = `<div class="dv-bar"><span class="dv-t"><b>${esc(title || "เอกสาร")}</b><small>${esc(sub || fi.kind)}</small></span><span class="dv-act"><button type="button" class="btn sm" data-full></button><a class="btn sm" href="${esc(url)}" target="_blank" rel="noopener">เปิดในแท็บใหม่ ↗</a><button type="button" class="dv-x" aria-label="ปิด">×</button></span></div><div class="dv-body"><iframe src="${esc(fi.embed)}" title="${esc(title || "เอกสาร")}" allow="autoplay; fullscreen" allowfullscreen></iframe></div>`;
  document.body.append(box); document.body.style.overflow = "hidden";
  box.querySelector(".dv-x").onclick = closeDoc; box.addEventListener("click", e => { if (e.target === box) closeDoc(); });
  dvKey = e => { if (e.key === "Escape" && !document.fullscreenElement) closeDoc(); }; addEventListener("keydown", dvKey);
  const fr = box.querySelector("iframe"); fr.addEventListener("load", () => { try { fr.focus(); fr.contentWindow.focus(); } catch {} });
  fsButton(box); thaify(box);
}
document.addEventListener("click", e => { const a = e.target.closest("[data-file]"); if (a && !a.disabled) { e.preventDefault(); openFile(a.dataset.file, a.dataset.ft || "", a.dataset.fsub || ""); } });
const RI = {
  file: QI('<path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8z"/><path d="M14 3v5h5M8.5 13h7M8.5 16.5h7"/>'),
  slides: QI('<rect x="3" y="4" width="18" height="12" rx="1.5"/><path d="M12 16v4M8 20h8M7 8h6M7 11h10"/>'),
  video: QI('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m10 9 5 3-5 3z"/>'),
};
function resTile(u, label, ic, title) {
  if (ic === "video") { const vi = vidInfo(u); if (!vi) return ""; return `<button type="button" class="rt" data-vurl="${esc(u)}" data-vt="${esc(title + " · " + label)}"><span class="rt-cv"><span class="dc-ph">${RI.video}</span>${vi.thumb ? `<img data-ext src="${esc(vi.thumb)}" alt="" loading="lazy">` : ""}<span class="dc-eye">เล่นวิดีโอ</span></span><span class="rt-bd"><b>${esc(label)}</b><small>${esc(vi.kind)}</small></span></button>`; }
  const fi = fileInfo(u); if (!fi) return "";
  return `<button type="button" class="rt" data-file="${esc(u)}" data-ft="${esc(title + " · " + label)}" data-fsub="${esc(fi.kind)}"><span class="rt-cv"><span class="dc-ph">${RI[ic]}</span>${fi.thumb ? `<img data-ext src="${esc(fi.thumb)}" alt="" loading="lazy">` : fi.live ? `<iframe class="rt-live" src="${esc(u)}" loading="lazy" tabindex="-1" aria-hidden="true" title=""></iframe>` : ""}<span class="dc-eye">เปิดดู</span></span><span class="rt-bd"><b>${esc(label)}</b><small>${esc(fi.kind)}</small></span></button>`;
}
/* สไลด์ฝังในหน้า: เลื่อนดู/กดเปลี่ยนสไลด์ได้เลยโดยไม่ต้องกดเปิด และขยายเต็มจอได้ */
function slideBox(u, title) {
  const fi = fileInfo(u); if (!fi) return "";
  return `<div class="sb"><div class="sb-bar"><span class="sb-t"><b>สไลด์นำเสนอ</b><small>${esc(fi.kind)} · เลื่อนดูได้ในกรอบนี้</small></span><span class="dv-act"><button type="button" class="btn sm" data-sbfull="${esc(u)}" data-ft="${esc(title + " · สไลด์นำเสนอ")}">⛶ ขยายเต็มจอ</button><a class="btn sm" href="${esc(u)}" target="_blank" rel="noopener">เปิดในแท็บใหม่ ↗</a></span></div><div class="sb-frame"><iframe src="${esc(fi.embed)}" title="สไลด์นำเสนอ ${esc(title)}" loading="lazy" allow="autoplay; fullscreen" allowfullscreen></iframe></div></div>`;
}
document.addEventListener("click", async e => {
  const b = e.target.closest("[data-sbfull]"); if (!b) return; e.preventDefault();
  const box = b.closest(".sb");
  if (document.fullscreenElement === box) { await document.exitFullscreen().catch(() => {}); return; }
  if (box?.requestFullscreen) { try { await box.requestFullscreen(); const fr = box.querySelector("iframe"); try { fr.focus(); fr.contentWindow.focus(); } catch {} return; } catch {} }
  openFile(b.dataset.sbfull, b.dataset.ft || "สไลด์นำเสนอ");
});
document.addEventListener("fullscreenchange", () => document.querySelectorAll("[data-sbfull]").forEach(b => { b.textContent = document.fullscreenElement === b.closest(".sb") ? "ย่อหน้าจอ" : "⛶ ขยายเต็มจอ"; }));
const resRow = tiles => { const t = tiles.filter(Boolean); return t.length ? `<div class="rts">${t.join("")}</div>` : ""; };
const nameKey = n => String(n || "").replace(/^(นาย|นางสาว|นาง|ว่าที่\s*ร\.?ต\.?\s*|ครู)\s*/, "").replace(/\s+/g, "");
function teacherPic(x) {
  if (img(x.tphoto)) return img(x.tphoto);
  const k = nameKey(x.teacher); if (!k) return "";
  const p = (S.people || []).find(p => nameKey(p.name) === k); return p ? img((p.photos || [])[0]) : "";
}
const KIT = {
  plans: { coll: "plans", name: "แผนการจัดการเรียนรู้", file: "แผนการจัดการเรียนรู้", who: "ครูผู้สอน", empty: "ยังไม่มีแผนการจัดการเรียนรู้" },
  innov: { coll: "innovs", name: "นวัตกรรม", file: "เล่มนวัตกรรม", who: "เจ้าของนวัตกรรม", empty: "ยังไม่มีนวัตกรรม" },
};
function kitHTML(x, k) {
  const K = KIT[k], tp = teacherPic(x), ph = (x.photos || []).filter(img);
  return `<article class="panel kit" id="k-${esc(x.id)}"><div class="kit-hd">
    ${x.teacher || tp ? `<figure class="kit-tc"><span class="kit-ph">${tp ? `<img src="${tp}" alt="${esc(x.teacher || "")}">` : LOTUS}</span><figcaption><b>${esc(x.teacher || "")}</b><small>${K.who}</small></figcaption></figure>` : ""}
    <div class="kit-tx">${x.subject ? `<span class="chip">${esc(x.subject)}</span>` : ""}<h2>${esc(x.title)}</h2><p class="meta">${[x.grade, x.dhamma ? "บูรณาการหลัก" + x.dhamma : "", x.date ? thDate(x.date, true) : ""].filter(Boolean).map(esc).join(" · ")}</p>${x.desc ? `<div class="prose">${paras(x.desc)}</div>` : ""}</div></div>
    ${slideBox(x.slides, x.title)}
    ${resRow([resTile(x.file, K.file, "file", x.title), resTile(x.video, "วิดีโอ", "video", x.title)])}
    ${ph.length ? `<h3 class="kit-h">ภาพกิจกรรม</h3><div class="gallery">${ph.map(i => `<img src="${img(i)}" alt="" loading="lazy" data-zoom>`).join("")}</div>` : ""}
  </article>`;
}
function kitCard(x, k) {
  const tp = teacherPic(x), cov = img((x.photos || [])[0]);
  return `<a class="kc reveal" href="#${k}" data-kit="${esc(x.id)}"><span class="kc-cv">${cov ? `<img src="${cov}" alt="" loading="lazy">` : `<span class="dc-ph">${RI[k === "plans" ? "file" : "slides"]}</span>`}<span class="kc-type">${KIT[k].name}</span></span><span class="kc-bd">${tp ? `<img class="kc-tp" src="${tp}" alt="">` : ""}<span><b>${esc(x.title)}</b><small>${esc(x.teacher || x.subject || "")}</small></span></span></a>`;
}
document.addEventListener("click", e => { const a = e.target.closest("[data-kit]"); if (!a) return; const id = a.dataset.kit; setTimeout(() => { const el = document.getElementById("k-" + id); if (el) el.scrollIntoView({ behavior: "smooth", block: "start" }); }, 350); });
const kitPage = k => () => {
  const K = KIT[k], xs = sortDate(byYear(S[K.coll]));
  return pageHead(K.name, k === "plans" ? "แผนการสอนที่บูรณาการหลักธรรม พร้อมสไลด์และภาพกิจกรรม" : "นวัตกรรมของครู พร้อมเล่ม สไลด์ และภาพกิจกรรม") + `<section class="band"><div class="wrap">
    <div class="filters">${yearPicker(k === "plans" ? "plYear" : "inYear")}</div>
    ${xs.length ? xs.map(x => kitHTML(x, k)).join("") : `<div class="empty">${K.empty}ในปีการศึกษา ${esc(viewYear)}${canEdit ? ` · เพิ่มได้ที่ <a href="#admin">จัดการเว็บไซต์ › ${K.name}</a>` : ""}</div>`}
  </div></section>`;
};
/* ---------- วิดีโอ: แนบลิงก์ แล้วเปิดดูในเว็บไซต์ได้ทันที ---------- */
function vidInfo(u) {
  u = String(u || "").trim(); if (!safeUrl(u)) return null; let m;
  if ((m = u.match(/(?:youtube\.com\/(?:watch\?(?:[^#]*&)?v=|shorts\/|live\/|embed\/)|youtu\.be\/)([\w-]{11})/)))
    return { kind: "YouTube", embed: `https://www.youtube-nocookie.com/embed/${m[1]}?autoplay=1&rel=0&playsinline=1`, thumb: `https://i.ytimg.com/vi/${m[1]}/hqdefault.jpg`, tall: /shorts\//.test(u) };
  if ((m = driveId(u))) return { kind: "Google Drive", embed: `https://drive.google.com/file/d/${m}/preview`, thumb: `https://drive.google.com/thumbnail?id=${m}&sz=w800` };
  if (/(?:facebook\.com|fb\.watch)\//.test(u) && /(?:\/videos?\/|\/watch|\/reel|fb\.watch|\/share\/[vr]\/)/.test(u))
    return { kind: "Facebook", embed: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(u)}&show_text=false&autoplay=true&width=1280`, tall: /\/reel/.test(u) };
  if ((m = u.match(/tiktok\.com\/@[^/]+\/video\/(\d+)/))) return { kind: "TikTok", embed: `https://www.tiktok.com/embed/v2/${m[1]}`, tall: true };
  if ((m = u.match(/vimeo\.com\/(?:video\/)?(\d+)/))) return { kind: "Vimeo", embed: `https://player.vimeo.com/video/${m[1]}?autoplay=1` };
  if (/\.(mp4|webm|ogv|ogg|mov)(\?|#|$)/i.test(u)) return { kind: "วิดีโอ", file: u };
  return null;
}
const PLAY = '<svg viewBox="0 0 64 64" width="64" height="64" aria-hidden="true"><circle cx="32" cy="32" r="30" fill="rgba(158,18,25,.9)" stroke="#fff" stroke-width="3"/><path d="M26 20v24l19-12z" fill="#fff"/></svg>';
const VIDI = '<svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m10 9 5 3-5 3z"/></svg>';
const playerHTML = (vi, title) => vi.file ? `<video src="${esc(vi.file)}" controls autoplay playsinline preload="metadata"></video>` : `<iframe src="${esc(vi.embed)}" title="${esc(title || "วิดีโอ")}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>`;
function vidCard(v) {
  const vi = vidInfo(v.url), cov = img((v.photos || [])[0]);
  return `<button type="button" class="vc" data-vid="${esc(v.id)}"${vi ? "" : " disabled"}><span class="vc-cv"><span class="vc-ph">${VIDI}</span>${cov ? `<img src="${cov}" alt="">` : vi?.thumb ? `<img data-ext src="${esc(vi.thumb)}" alt="" loading="lazy">` : ""}<span class="vc-play">${PLAY}</span>${vi ? `<span class="vc-src">${esc(vi.kind)}</span>` : ""}</span><span class="vc-bd"><b>${esc(v.title)}</b><small>${v.date ? thDate(v.date) : ""}</small>${v.desc ? `<span class="vc-ds">${esc(v.desc)}</span>` : ""}</span></button>`;
}
let vpKey = null;
function closeVid() { $(".vp")?.remove(); document.body.style.overflow = ""; if (vpKey) removeEventListener("keydown", vpKey); vpKey = null; }
function openVid(url, title, sub) {
  const vi = vidInfo(url); if (!vi) return false;
  closeVid(); closeDoc();
  const box = document.createElement("div"); box.className = "vp" + (vi.tall ? " tall" : ""); box.setAttribute("role", "dialog"); box.setAttribute("aria-modal", "true"); box.setAttribute("aria-label", title || "วิดีโอ");
  box.innerHTML = `<div class="vp-in"><div class="dv-bar"><span class="dv-t"><b>${esc(title || "วิดีโอ")}</b><small>${esc(sub || vi.kind)}</small></span><span class="dv-act"><a class="btn sm" href="${esc(url)}" target="_blank" rel="noopener">เปิดใน ${esc(vi.kind)} ↗</a><button type="button" class="dv-x" aria-label="ปิด">×</button></span></div><div class="vp-frame">${playerHTML(vi, title)}</div></div>`;
  document.body.append(box); document.body.style.overflow = "hidden";
  box.querySelector(".dv-x").onclick = closeVid; box.addEventListener("click", e => { if (e.target === box || e.target.classList.contains("vp-in")) closeVid(); });
  vpKey = e => { if (e.key === "Escape") closeVid(); }; addEventListener("keydown", vpKey);
  thaify(box); return true;
}
document.addEventListener("click", e => {
  const b = e.target.closest("[data-vid]"); if (b && !b.disabled) { e.preventDefault(); const v = [...(S.videos || []), ...(S.posts || []).map(p => ({ ...p, url: p.video }))].find(x => x.id === b.dataset.vid); if (v) openVid(v.url, v.title, v.date ? thDate(v.date) : ""); return; }
  const a = e.target.closest("[data-vurl]"); if (a) { e.preventDefault(); openVid(a.dataset.vurl, a.dataset.vt || "", ""); }
});
/* หน้าแรก: วิดีโอใหญ่เล่นได้ในหน้าแรกเลย + รายการคลิปอื่นด้านข้าง */
const vidThumb = v => { const vi = vidInfo(v.url), cov = img((v.photos || [])[0]); return cov ? `<img src="${cov}" alt="">` : vi?.thumb ? `<img data-ext src="${esc(vi.thumb)}" alt="" loading="lazy">` : ""; };
const hvPoster = v => { const vi = vidInfo(v.url); return `<button type="button" class="hv-poster" data-hvplay="${esc(v.id)}" aria-label="เล่นวิดีโอ ${esc(v.title)}"><span class="vc-ph">${VIDI}</span>${vidThumb(v)}<span class="vc-play">${PLAY}</span>${vi ? `<span class="vc-src">${esc(vi.kind)}</span>` : ""}<span class="hv-cap"><b>${esc(v.title)}</b><small>${v.date ? thDate(v.date, true) : ""}${v.desc ? " · " + esc(v.desc) : ""}</small></span></button>`; };
function homeVideos(no) {
  const vs = sortDate(byYear(S.videos)).filter(v => vidInfo(v.url));
  if (!vs.length) return canEdit ? `<section class="sec"><div class="wrap"><div class="st"><h2><span class="no">${no()}</span>วิดีโอกิจกรรม</h2></div>${emptyBox(`ยังไม่มีวิดีโอ · <a href="#admin">เพิ่มได้ที่ จัดการเว็บไซต์ › วิดีโอ</a> (ส่วนนี้ผู้ชมจะเห็นเมื่อมีวิดีโอแล้ว)`)}</div></section>` : "";
  const rest = vs.slice(1, 5);
  return `<section class="sec"><div class="wrap"><div class="st"><h2><span class="no">${no()}</span>วิดีโอกิจกรรม</h2><a href="#videos">ทั้งหมด ›</a></div>
    <div class="hv${rest.length ? "" : " one"} reveal"><div class="hv-main" id="hvMain">${hvPoster(vs[0])}</div>${rest.length ? `<div class="hv-list">${vs.slice(0, 5).map((v, i) => `<button type="button" class="hv-it${i ? "" : " on"}" data-hv="${esc(v.id)}"><span class="hv-th"><span class="vc-ph">${VIDI}</span>${vidThumb(v)}<i>▶</i></span><span class="hv-tx"><b>${esc(v.title)}</b><small>${v.date ? thDate(v.date) : ""} · ${esc(vidInfo(v.url).kind)}</small></span></button>`).join("")}</div>` : ""}</div></div></section>`;
}
function playHome(id) {
  const v = (S.videos || []).find(x => x.id === id), vi = v && vidInfo(v.url), box = $("#hvMain"); if (!vi || !box) return;
  if (vi.tall) { openVid(v.url, v.title, v.date ? thDate(v.date) : ""); return; }
  box.innerHTML = `<div class="vp-frame">${playerHTML(vi, v.title)}</div><div class="hv-now"><span><b>${esc(v.title)}</b><small>${v.date ? thDate(v.date, true) : ""}</small></span><a href="${esc(v.url)}" target="_blank" rel="noopener">เปิดใน ${esc(vi.kind)} ↗</a></div>`;
  thaify(box);
  document.querySelectorAll(".hv-it").forEach(b => b.classList.toggle("on", b.dataset.hv === id));
}
document.addEventListener("click", e => {
  const a = e.target.closest("[data-hvplay]"); if (a) { e.preventDefault(); playHome(a.dataset.hvplay); return; }
  const b = e.target.closest("[data-hv]"); if (b) { e.preventDefault(); playHome(b.dataset.hv); if (innerWidth < 900) $("#hvMain")?.scrollIntoView({ behavior: "smooth", block: "center" }); }
});
const vidSec = (list, more) => list.length ? `<div class="vcs reveal">${list.map(vidCard).join("")}</div>` : "";
let popTried = false;
const POPSET = { mourn: { title: "เสด็จสู่สวรรคาลัย", sub: "น้อมสำนึกในพระมหากรุณาธิคุณตราบนิจนิรันดร์", b1t: "ลงนามถวายความอาลัย", gray: true },
  gold: { title: "ทรงพระเจริญ", sub: "ด้วยเกล้าด้วยกระหม่อม ขอเดชะ", b1t: "ลงนามถวายพระพร", gray: false } };
document.addEventListener("change", e => { const t = e.target; if (!(t.matches && t.matches('#popForm [data-k="theme"]'))) return;
  const f = t.form, to = POPSET[t.value === "gold" ? "gold" : "mourn"], from = POPSET[t.value === "gold" ? "mourn" : "gold"];
  ["title", "sub", "b1t"].forEach(k => { const el = f.querySelector(`[data-k="${k}"]`); if (!el.value.trim() || el.value.trim() === from[k]) el.value = to[k]; });
  f.querySelector('[data-k="gray"]').checked = to.gray; });
function readPop(f) { const q = k => { const el = f.querySelector(`[data-k="${k}"]`); return el.type === "checkbox" ? el.checked : el.value.trim(); };
  return { on: q("on"), theme: q("theme"), start: q("start"), end: q("end"), photo: pendingPop, title: q("title"), sub: q("sub"), sign: q("sign"), b1t: q("b1t"), b1u: q("b1u"), gray: q("gray") }; }
function inRange(p) { const t = today(); return !((p.start && t < p.start) || (p.end && t > p.end)); }
function applyGray() { const p = S.popup || {}; document.documentElement.classList.toggle("gray", !!(p.on && p.gray && inRange(p))); }
function closePop(k) { $(".pop")?.remove(); document.body.style.overflow = ""; if (k) try { sessionStorage.setItem(k, "1"); } catch {} }
function showPop(force, data) {
  const p = data || S.popup || {}; if (!force && (!p.on || !inRange(p))) return;
  const k = "wbp-pop-" + hash(JSON.stringify(p)); if (!force) { try { if (sessionStorage.getItem(k)) return; } catch {} }
  closePop(); const ph = img(p.photo);
  const el = document.createElement("div"); el.className = "pop " + (p.theme === "gold" ? "gold" : "mourn"); el.setAttribute("role", "dialog"); el.setAttribute("aria-modal", "true"); el.setAttribute("aria-label", p.title || "ประกาศ");
  el.innerHTML = `<div class="pop-card"><button type="button" class="pop-x" aria-label="ปิด">×</button>${ph ? `<div class="pop-img"><img src="${ph}" alt="${esc(p.title || "")}"></div>` : ""}<div class="pop-bd">${p.title ? `<h2>${esc(p.title)}</h2>` : ""}${p.sub ? `<p class="pop-sub">${esc(p.sub)}</p>` : ""}<div class="pop-orn" aria-hidden="true"><i></i><span>✦</span><i></i></div>${p.sign ? `<p class="pop-sign">${esc(p.sign)}</p>` : ""}<b class="pop-sch">${esc(S.school.name)}</b><div class="pop-btns">${safeUrl(p.b1u) ? `<a class="pb1" href="${esc(p.b1u)}" target="_blank" rel="noopener">${p.theme === "gold" ? "✦" : "🎗"} ${esc(p.b1t || POPSET[p.theme === "gold" ? "gold" : "mourn"].b1t)}</a>` : ""}<button type="button" class="pb2">เข้าสู่เว็บไซต์</button></div></div></div>`;
  document.body.append(el); document.body.style.overflow = "hidden";
  const done = () => closePop(force ? null : k);
  el.querySelector(".pop-x").onclick = done; el.querySelector(".pb2").onclick = done; el.addEventListener("click", e => { if (e.target === el) done(); });
  thaify(el);
}
const SPARK = `<span class="spk" aria-hidden="true">${[[6,12,0],[90,8,1.2],[14,62,2.1],[94,55,.6],[48,4,1.7],[72,88,2.6],[28,90,.9]].map(([x, y, d]) => `<i style="left:${x}%;top:${y}%;animation-delay:${d}s"></i>`).join("")}</span>`;
const PGROUPS = ["ผู้บริหาร", "พระสงฆ์ที่ปรึกษา", "ครูผู้รับผิดชอบโครงการ", "ครูและบุคลากร", "นักเรียนแกนนำ"];
const PERSON = '<svg viewBox="0 0 64 80" width="64" height="80" fill="currentColor" aria-hidden="true"><circle cx="32" cy="26" r="14"/><path d="M6 78c2-17 13-27 26-27s24 10 26 27z"/></svg>';
const dirPhoto = () => S.school.director?.photo || ((S.people || []).find(p => p.group === "ผู้บริหาร" && img((p.photos || [])[0]))?.photos || [])[0] || "";
function personCard(p, lead) {
  const ph = img((p.photos || [])[0]);
  return `<figure class="pc${lead ? " lead" : ""}"><span class="pc-g">${lead ? "★ " : ""}${esc(lead ? (p.role && p.role.startsWith("ผู้อำนวยการ") ? "ผู้อำนวยการโรงเรียน" : p.group) : (p.group || "ครูและบุคลากร"))}</span><div class="pc-ph">${ph ? `<img src="${ph}" alt="${esc(p.name)}" data-zoom>` : PERSON}</div><figcaption><b>${esc(p.name).replace(/^(นางสาว|นาง|นาย|พระอธิการ)/, "$1\u200B")}</b><i class="pc-line" aria-hidden="true"></i><span>${esc(p.role || "")}</span></figcaption></figure>`;
}
function peopleSec(compact) {
  const ps = [...(S.people || [])].sort((a, b) => (+a.order || 99) - (+b.order || 99));
  if (!ps.length) return "";
  const groups = PGROUPS.map(g => [g, ps.filter(p => (p.group || "ครูและบุคลากร") === g)]).filter(x => x[1].length);
  return `<div class="ppl bgC reveal"><div class="ppl-k">${esc(S.school.name)}</div>${(() => { const lead = groups.filter(x => x[0] === "ผู้บริหาร").flatMap(x => x[1]), rest = groups.filter(x => x[0] !== "ผู้บริหาร").flatMap(x => x[1]);
    return (lead.length ? `<h2 class="ppl-h">ผู้บริหารสถานศึกษา</h2><div class="ppl-lead">${lead.map(p => personCard(p, true)).join("")}</div>` : "") + (rest.length ? `<h2 class="ppl-h">คณะผู้ขับเคลื่อนโรงเรียนวิถีพุทธ</h2><div class="ppl-grid">${rest.map(p => personCard(p)).join("")}</div>` : ""); })()}${canEdit ? `<p class="ppl-edit"><a href="#admin">เพิ่มหรือแก้ไขรายชื่อและภาพ ได้ที่ จัดการเว็บไซต์ › บุคลากร</a></p>` : ""}</div>`;
}
V.people = () => pageHead("ผู้บริหารและบุคลากร", `${S.school.name} ปีการศึกษา ${viewYear}`) + `<section class="band"><div class="wrap">${peopleSec() || emptyBox(`ยังไม่มีรายชื่อบุคลากร${canEdit ? ` · <a href="#admin">เพิ่มได้ที่ จัดการเว็บไซต์ › บุคลากร</a>` : ""}`)}</div></section>`;
V.web = u => {
  const url = safeUrl(u) ? u : "", lbl = webLabel(u) || url.replace(/^https?:\/\//, "").split("/")[0] || "ลิงก์ภายนอก";
  const vi = vidInfo(url);
  if (vi) return pageHead(lbl, `วิดีโอจาก ${vi.kind} · ดูได้ทันทีในเว็บไซต์โรงเรียน`, "วิดีโอ") + `<section class="band"><div class="wrap"><div class="vp-page${vi.tall ? " tall" : ""}"><div class="vp-frame">${playerHTML(vi, lbl)}</div></div><p class="meta" style="margin-top:10px;text-align:center"><a href="${esc(url)}" target="_blank" rel="noopener">เปิดใน ${esc(vi.kind)} ↗</a></p></div></section>`;
  return pageHead(lbl, "เปิดดูภายในเว็บไซต์โรงเรียน", "ลิงก์ภายนอก") + `<section class="band"><div class="wrap">${url ? `<div class="webv"><div class="webv-bar"><span class="webv-dots"><i></i><i></i><i></i></span><span class="webv-url no-th">${esc(url)}</span><a class="btn sm" href="${esc(url)}" target="_blank" rel="noopener">เปิดในแท็บใหม่ ↗</a></div><iframe src="${esc(url)}" title="${esc(lbl)}" referrerpolicy="no-referrer"></iframe></div><p class="meta" style="margin-top:10px">บางเว็บไซต์ไม่อนุญาตให้แสดงซ้อนในเว็บอื่น ถ้าหน้าด้านบนว่าง ให้กด “เปิดในแท็บใหม่”</p>` : emptyBox("ลิงก์ไม่ถูกต้อง")}</div></section>`;
};
V.about = () => {
  const sc = S.school;
  return pageHead("เกี่ยวกับโรงเรียน", `${sc.name} ${sc.address}`) + `<section class="band"><div class="wrap ${sc.history || sc.vision || (sc.mission || []).length ? "two" : "about-one"}">
    <div class="prose">${sc.history ? `<h2 style="margin-bottom:8px">ประวัติโรงเรียน</h2>${paras(sc.history)}` : ""}
      ${sc.vision ? `<h2 style="margin:18px 0 8px">วิสัยทัศน์</h2>${paras(sc.vision)}` : ""}
      ${(sc.mission || []).length ? `<h2 style="margin:18px 0 8px">พันธกิจ</h2><ol>${sc.mission.map(m => `<li>${esc(m)}</li>`).join("")}</ol>` : ""}
      <h2 style="margin:18px 0 8px">คุณธรรมอัตลักษณ์</h2><div class="virtues" style="margin:0">${(sc.virtues || []).map(v => `<span class="chip" style="font-size:15px;padding:3px 14px">${esc(v)}</span>`).join(" ")}</div>
      ${!sc.history && !sc.vision ? `<p class="meta" style="margin-top:16px">${canEdit ? "เพิ่มประวัติและวิสัยทัศน์ได้ที่ จัดการเว็บไซต์ › ข้อมูลโรงเรียน" : ""}</p>` : ""}</div>
    ${(S.people || []).length ? `<div class="panel"><h2 style="margin-bottom:10px">ข้อมูลสถานศึกษา</h2><table class="t"><tbody>${sc.code ? `<tr><td>รหัสโรงเรียน</td><td>${esc(sc.code)}</td></tr>` : ""}<tr><td>สังกัด</td><td>${esc(sc.areaFull || sc.area)}</td></tr><tr><td>ที่ตั้ง</td><td>${esc(sc.address)}</td></tr></tbody></table></div>` : `<div class="panel"><h2 style="margin-bottom:10px">ผู้บริหารและผู้รับผิดชอบ</h2><table class="t"><tbody>
      <tr><td>ผู้อำนวยการ</td><td>${esc(sc.director?.name)}</td></tr>
      ${sc.coordinator ? `<tr><td>ครูผู้รับผิดชอบโครงการ</td><td>${esc(sc.coordinator)}</td></tr>` : ""}
      ${sc.monk ? `<tr><td>พระสงฆ์ที่ปรึกษา</td><td>${esc(sc.monk)}</td></tr>` : ""}
      ${sc.code ? `<tr><td>รหัสโรงเรียน</td><td>${esc(sc.code)}</td></tr>` : ""}
      <tr><td>สังกัด</td><td>${esc(sc.area)}</td></tr></tbody></table></div>`}
  </div>${(S.people || []).length ? `<div class="wrap" style="margin-top:26px"><div class="ppl bgC ppl-mini reveal"><h2 class="ppl-h">ผู้บริหารสถานศึกษา</h2><div class="ppl-lead">${(S.people || []).filter(p => p.group === "ผู้บริหาร").map(p => personCard(p, true)).join("")}</div><p style="text-align:center;margin:22px 0 0"><a class="hb pri" href="#people">ดูผู้บริหารและบุคลากรทั้งหมด ›</a></p></div></div>` : ""}</section>`;
};
V.way = () => {
  const showLv = S.school.showLevels;
  return pageHead("วิถีพุทธ 29 ประการ", `อัตลักษณ์โรงเรียนวิถีพุทธตามแนวทางของสำนักงานคณะกรรมการการศึกษาขั้นพื้นฐาน พร้อมหลักฐานการดำเนินงานปีการศึกษา ${viewYear}`) + `<section class="band"><div class="wrap">
    <div class="filters">${yearPicker("wayYear")}${showLv && S.school.selfScore ? `<span class="chip ok" style="font-size:14px">ผลประเมินตนเองร้อยละ ${esc(S.school.selfScore)}</span>` : ""}</div>
    ${IND.map(([g, items]) => `<div class="igrp"><h2>${esc(g)} (${items.length} ประการ)</h2>${items.map(([id, t]) => {
      const { posts, d, n } = indEvidence(id);
      const photos = [...new Set([...(d.photos || []), ...posts.flatMap(p => p.photos || [])])].filter(img);
      const extra = [];
      if (id === "2.3") byYear(S.projects).forEach(p => extra.push(`<a href="#projects">โครงงาน ${esc(p.name)}</a>`));
      if (id === "4.8" || id === "2.1") { const c = byYear(S.dhamma).filter(x => x.type === "dekdee").length; if (c) extra.push(`<a href="#dhamma">เด็กดีมีธรรมะ ${c} ครั้ง</a>`); }
      const ph = photos.length ? `<div class="ind-ph" data-gal>${photos.map((x, i) => `<img src="${img(x)}" alt="ภาพหลักฐานข้อ ${id} ภาพที่ ${i + 1}" loading="lazy" data-zoom class="${i === 0 ? "on" : ""}">`).join("")}${photos.length > 1 ? `<span class="cnt">${photos.length} ภาพ</span><span class="dots">${photos.map((_, i) => `<i class="${i === 0 ? "on" : ""}"></i>`).join("")}</span>` : ""}</div>` : `<div class="ind-ph none">${LOTUS}<span>ยังไม่มีภาพหลักฐาน</span></div>`;
      return `<div class="ind reveal" id="i-${id.replace(".", "-")}">${ph}<div class="ind-bd"><div class="no">${id}</div><div><h3>${esc(t)} ${n ? `<span class="chip ok">มีหลักฐาน</span>` : `<span class="chip gray">รอเผยแพร่</span>`} ${showLv && d.level ? `<span class="chip">ระดับ ${esc(d.level)}</span>` : ""}</h3>
        ${d.text ? `<div class="prose" style="margin-top:4px">${paras(d.text)}</div>` : ""}
        <div class="ev">${(d.links || []).filter(l => safeUrl(l.u)).map(l => `<a href="${esc(l.u)}" target="_blank" rel="noopener">${esc(l.t || "เอกสาร")} ↗</a>`).join("")}${posts.slice(0, 4).map(p => `<a href="#post-${esc(p.id)}">${esc(p.title)}</a>`).join("")}${extra.join("")}</div>
        </div></div></div>`;
    }).join("")}</div>`).join("")}</div></section>`;
};
V.bp = () => {
  const b = S.bp || {};
  return pageHead("Best Practice", b.title) + `<section class="band"><div class="wrap">
    <div class="two" style="margin-bottom:26px"><div class="prose"><h2 style="margin-bottom:8px">ที่มาและความสำคัญ</h2>${paras(b.problem)}</div>
      <div class="panel"><table class="t"><tbody><tr><td>หลักธรรม</td><td>${esc(b.dhamma)}</td></tr>${b.owner ? `<tr><td>เจ้าของผลงาน</td><td>${esc(b.owner)}</td></tr>` : ""}${b.award ? `<tr><td>รางวัล</td><td>${esc(b.award)}</td></tr>` : ""}${safeUrl(b.doc) ? `<tr><td>เอกสาร</td><td><a href="${esc(b.doc)}" target="_blank" rel="noopener">เปิดรายงานฉบับเต็ม ↗</a></td></tr>` : ""}</tbody></table></div></div>
    <h2 style="margin-bottom:12px">${(b.steps || []).length} กระบวนการ</h2>
    <div class="steps">${(b.steps || []).map((s, i) => `<div class="step"><div class="n">${i + 1}</div><h3>${esc(s.title)}</h3><div class="t">${esc(s.truth)}</div>${s.detail ? `<p class="meta jt" style="margin:6px 0 0">${esc(s.detail)}</p>` : ""}</div>`).join("")}</div>
    ${(b.results || []).length ? `<h2 style="margin:28px 0 12px">ผลการดำเนินงาน</h2><div class="stats" style="margin-top:0">${b.results.map(r => `<div><b>${esc(r.value)}</b><span>${esc(r.label)}</span></div>`).join("")}</div>` : ""}
    ${(b.photos || []).filter(img).length ? `<div class="gallery">${b.photos.filter(img).map(p => `<img src="${img(p)}" alt="" loading="lazy" data-zoom>`).join("")}</div>` : ""}
  </div></section>`;
};
V.projects = () => {
  const ps = byYear(S.projects);
  return pageHead("โครงงานคุณธรรม", "โครงงานที่นักเรียนคิด วางแผน และลงมือทำเอง โดยใช้หลักธรรมนำการแก้ปัญหา") + `<section class="band"><div class="wrap">
    <div class="filters">${yearPicker("pjYear")}</div>
    ${ps.length ? ps.map(p => { const m = money(p); const es = sortDate(p.entries || []);
      return `<article class="panel pjx" style="margin-bottom:20px"><div class="pjx-top">${rotBox(p.photos, canEdit ? "เพิ่มภาพได้ที่ จัดการเว็บไซต์ › โครงงานคุณธรรม" : "ภาพโครงงาน")}<div><span class="chip">${esc(p.dhamma)}</span><h2>${esc(p.name)}</h2>${p.virtue ? `<p class="meta" style="margin:4px 0 0">คุณธรรม: ${esc(p.virtue)}</p>` : ""}${resRow([resTile(p.doc, "เล่มรายงานโครงงาน", "file", p.name), resTile(p.video, "วิดีโอ", "video", p.name)])}</div></div>
        ${slideBox(p.slides, p.name)}
        ${p.summary ? `<div class="prose">${paras(p.summary)}</div>` : ""}
        <table class="t"><tbody>${p.target ? `<tr><td>กลุ่มเป้าหมาย</td><td>${esc(p.target)}${p.students ? ` · ${num(p.students)} คน` : ""}</td></tr>` : ""}${p.leaders ? `<tr><td>แกนนำ</td><td>${esc(p.leaders)}</td></tr>` : ""}${p.teacher ? `<tr><td>ครูที่ปรึกษา</td><td>${esc(p.teacher)}</td></tr>` : ""}</tbody></table>
        ${m.inc || m.exp ? moneyCards(m, true) : ""}
        ${es.filter(e => e.kind === "activity").length ? `<h3 style="margin:14px 0 6px">บันทึกกิจกรรม</h3><ul class="list">${es.filter(e => e.kind === "activity").map(e => `<li><time>${thDate(e.date)}</time><span>${esc(e.detail)}</span></li>`).join("")}</ul>` : ""}
</article>`; }).join("") : `<div class="empty">ยังไม่มีโครงงานในปีการศึกษา ${esc(viewYear)}</div>`}
  </div></section>`;
};
V.dhamma = () => {
  const rows = sortDate(byYear(S.dhamma));
  const hrs = t => rows.filter(d => d.type === "dekdee" && d.term === t).reduce((s, d) => s + (+d.hours || 0), 0);
  return pageHead("ธรรมะประจำสัปดาห์", "กิจกรรมที่ทำต่อเนื่องทุกสัปดาห์ เพื่อให้นักเรียนนำหลักธรรมไปใช้ในชีวิตจริง") + `<section class="band"><div class="wrap">
    <div class="two" style="margin-bottom:24px">${(S.dhammaInfo || []).map(x => `<div class="panel"><h2>${esc(x.name)}</h2><p style="margin:6px 0 0">${esc(x.text)}</p></div>`).join("")}</div>
    <div class="filters">${yearPicker("dhYear")}${rows.length ? `<span class="chip">เด็กดีมีธรรมะ ภาคเรียน 1: ${num(hrs("1"))} ชม. · ภาคเรียน 2: ${num(hrs("2"))} ชม.</span>` : ""}</div>
    ${rows.length ? `<div class="panel tw"><table class="t"><thead><tr><th>วันที่</th><th>กิจกรรม</th><th>หัวข้อ / หลักธรรม</th><th>ผู้สอน</th><th>ข้อคิดของนักเรียน</th></tr></thead><tbody>${rows.map(d => `<tr><td style="white-space:nowrap">${thDate(d.date)}</td><td>${d.type === "dekdee" ? "เด็กดีมีธรรมะ" : "5 นาที มีปัญญา"}</td><td><b>${esc(d.topic)}</b>${d.group ? `<div class="meta">${esc(d.group)}</div>` : ""}</td><td>${esc(d.speaker)}</td><td>${esc(d.summary)}${docBtn(d.doc)}${(d.photos || []).filter(img).length ? `<div class="thumbs">${d.photos.filter(img).map(x => `<img src="${img(x)}" alt="" loading="lazy" data-zoom>`).join("")}</div>` : ""}</td></tr>`).join("")}</tbody></table></div>` : `<div class="empty">ยังไม่มีบันทึกในปีการศึกษา ${esc(viewYear)}</div>`}
  </div></section>`;
};
let newsCat = "";
V.news = () => {
  const list = sortDate(byYear(S.posts)).filter(p => (!newsCat || p.cat === newsCat) && (!searchQ || (p.title + " " + (p.body || "")).toLowerCase().includes(searchQ.toLowerCase())));
  return pageHead("ข่าวกิจกรรม", "ข่าวสารและภาพกิจกรรมวิถีพุทธของโรงเรียน") + `<section class="band"><div class="wrap">
    ${searchQ ? `<p class="meta" style="margin:0 0 12px">ผลการค้นหา “${esc(searchQ)}” ${list.length} รายการ · <a href="#news" id="clrQ">ล้างการค้นหา</a></p>` : ""}<div class="filters" id="catF"><button data-c="" aria-pressed="${!newsCat}">ทั้งหมด</button>${CATS.map(c => `<button data-c="${esc(c)}" aria-pressed="${newsCat === c}">${esc(c)}</button>`).join("")}${yearPicker("nwYear")}</div>
    ${list.length ? `<div class="cards">${list.map(postCard).join("")}</div>` : emptyBox("ยังไม่มีข่าวในหมวดนี้")}</div></section>`;
};
V.post = id => {
  const p = (S.posts || []).find(x => x.id === id);
  if (!p) return pageHead("ไม่พบข่าว", "ข่าวนี้อาจถูกลบแล้ว", "ข่าวกิจกรรม") + `<section class="band"><div class="wrap"><a class="btn" href="#news">กลับไปหน้าข่าว</a></div></section>`;
  return pageHead(p.title, `${thDate(p.date, true)} · ${p.cat || "ข่าวกิจกรรม"}`, "ข่าวกิจกรรม") + `<section class="band"><div class="wrap">
    ${vidInfo(p.video) ? `<div class="vinl">${vidCard({ ...p, url: p.video, desc: "" })}</div>` : ""}<div class="prose">${paras(p.body)}</div>
    ${(p.inds || []).length ? `<div class="ev" style="display:flex;gap:6px;flex-wrap:wrap;margin:10px 0">${p.inds.map(i => `<a class="chip" href="#way" style="text-decoration:none">อัตลักษณ์ข้อ ${esc(i)}</a>`).join("")}</div>` : ""}
    ${(p.photos || []).filter(img).length ? `<div class="gallery">${p.photos.filter(img).map(x => `<img src="${img(x)}" alt="" loading="lazy" data-zoom>`).join("")}</div>` : ""}
    <p style="margin-top:24px"><a class="btn" href="#news">← ข่าวทั้งหมด</a></p></div></section>`;
};
V.docs = () => {
  const ds = sortDate(byYear(S.docs));
  return pageHead("เอกสารเผยแพร่", "รายงาน แผนการจัดการเรียนรู้ และเอกสารวิถีพุทธของโรงเรียน") + `<section class="band"><div class="wrap">
    <div class="filters">${yearPicker("dcYear")}</div>
    ${ds.length ? `<div class="dcs">${ds.map(docCard).join("")}</div>` : `<div class="empty">ยังไม่มีเอกสารเผยแพร่${canEdit ? ` · เพิ่มได้ที่ <a href="#admin">จัดการเว็บไซต์ › เอกสาร</a>` : ""}</div>`}
  </div></section>`;
};
V.plans = kitPage("plans");
V.innov = kitPage("innov");
V.videos = () => {
  const vs = sortDate(byYear(S.videos));
  return pageHead("วิดีโอกิจกรรม", "คลิปกิจกรรมโรงเรียนวิถีพุทธ กดดูได้ทันทีในเว็บไซต์") + `<section class="band"><div class="wrap">
    <div class="filters">${yearPicker("vdYear")}</div>
    ${vs.length ? vidSec(vs) : `<div class="empty">ยังไม่มีวิดีโอ${canEdit ? ` · เพิ่มได้ที่ <a href="#admin">จัดการเว็บไซต์ › วิดีโอ</a>` : ""}</div>`}
  </div></section>`;
};
V.contact = () => {
  const sc = S.school;
  const copyRow = (label, v) => v ? `<tr><td>${label}</td><td><span>${esc(v)}</span> <button class="btn sm" data-copy="${esc(v)}">คัดลอก</button></td></tr>` : "";
  return pageHead("ติดต่อเรา", sc.name) + `<section class="band"><div class="wrap two">
    <div class="panel"><table class="t"><tbody><tr><td>ที่อยู่</td><td>${esc(sc.address)}</td></tr>${copyRow("โทรศัพท์", sc.phone)}${copyRow("อีเมล", sc.email)}
      ${safeUrl(sc.facebook) ? `<tr><td>Facebook</td><td><a href="${esc(sc.facebook)}" target="_blank" rel="noopener">เปิดเพจ ↗</a></td></tr>` : ""}
      ${safeUrl(sc.map) ? `<tr><td>แผนที่</td><td><a href="${esc(sc.map)}" target="_blank" rel="noopener">เปิดใน Google Maps ↗</a></td></tr>` : ""}</tbody></table></div>
    <div class="panel"><h3>${esc(sc.name)}</h3><p class="meta">${esc(sc.area)}</p><p>${esc(sc.director?.name)}<br><span class="meta">ผู้อำนวยการ</span></p></div>
  </div></section>`;
};

/* ---------- admin ---------- */
let admTab = "posts", editId = null, pending = [], pendingT = "";
const ADM = [["pages","หน้าและเนื้อหา"],["posts","ข่าวและกิจกรรม"],["ind","อัตลักษณ์ 29"],["projects","โครงงานคุณธรรม"],["dhamma","ธรรมะประจำสัปดาห์"],["bp","Best Practice"],["plans","แผนการสอน"],["innov","นวัตกรรม"],["videos","วิดีโอ"],["docs","เอกสารเผยแพร่"],["events","ปฏิทินกิจกรรม"],["school","ข้อมูลโรงเรียน"],["people","บุคลากร"],["menu","เมนูหลัก"],["popup","หน้าต่างวันสำคัญ"],["side","เมนู E-Service"],["years","ปีการศึกษา"]];
function F(k, label, type = "text", opt = {}) { return { k, label, type, ...opt }; }
const SPECS = {
  posts: [F("date","วันที่","date"),F("cat","หมวด","select",{opts:CATS}),F("title","หัวข้อข่าว","text",{wide:1}),F("body","รายละเอียด","textarea",{wide:1}),F("video","ลิงก์วิดีโอ (ถ้ามี) YouTube / Facebook / Google Drive / TikTok","url",{wide:1}),F("photos","ภาพกิจกรรม","photos",{wide:1}),F("inds","อัตลักษณ์ที่เกี่ยวข้อง (ข่าวนี้จะไปแสดงเป็นหลักฐานในหน้าวิถีพุทธ 29 ประการ)","inds",{wide:1})],
  projects: [F("name","ชื่อโครงงาน","text",{wide:1}),F("dhamma","หลักธรรม"),F("virtue","คุณธรรมที่พัฒนา"),F("target","กลุ่มเป้าหมาย"),F("students","จำนวนนักเรียน","number"),F("teacher","ครูที่ปรึกษา"),F("seed","เงินตั้งต้น (บาท)","number"),F("leaders","แกนนำนักเรียน","text",{wide:1}),F("summary","สรุปโครงงาน (ปัญหา วิธีแก้ ผลที่เกิด)","textarea",{wide:1}),F("entries","บันทึกกิจกรรมและบัญชี: บรรทัดละรายการ วันที่ | กิจกรรม/รายรับ/รายจ่าย | รายละเอียด | จำนวนเงิน","entries",{wide:1}),F("doc","ลิงก์เล่มรายงานโครงงาน (Google Drive / Google Docs / PDF ตั้งค่าทุกคนที่มีลิงก์ดูได้)","url",{wide:1}),F("slides","ลิงก์สไลด์นำเสนอ (Google Slides / Canva / Google Drive)","url",{wide:1}),F("video","ลิงก์วิดีโอ (ถ้ามี)","url",{wide:1}),F("photos","ภาพโครงงาน (ขึ้นหมุนอัตโนมัติที่หน้าแรก)","photos",{wide:1})],
  dhamma: [F("type","กิจกรรม","select",{opts:[["dekdee","เด็กดีมีธรรมะ"],["5min","5 นาที มีปัญญา"]]}),F("date","วันที่","date"),F("term","ภาคเรียน","select",{opts:["1","2"]}),F("hours","ชั่วโมง","number"),F("topic","หัวข้อ / หลักธรรม","text",{wide:1}),F("speaker","ผู้สอน / ผู้พูด"),F("spType","ผู้สอนเป็น","select",{opts:[["monk","พระสงฆ์"],["teacher","ครู"],["student","นักเรียน"]]}),F("group","ชั้น / กลุ่ม"),F("summary","ข้อคิดที่นักเรียนสรุปได้","textarea",{wide:1}),F("doc","ลิงก์เอกสาร เช่น สมุดบันทึกกลุ่มที่สแกนไว้ใน Google Drive","url",{wide:1}),F("photos","ภาพกิจกรรม (ขึ้นหมุนอัตโนมัติที่หน้าแรก)","photos",{wide:1})],
  docs: [F("title","ชื่อเอกสาร","text",{wide:1}),F("cat","หมวด","select",{opts:["รายงาน","แผนการจัดการเรียนรู้","โครงงานคุณธรรม","Best Practice","คำสั่ง / ประกาศ","อื่น ๆ"]}),F("date","วันที่","date"),F("desc","คำอธิบายสั้น ๆ (ถ้ามี)","text",{wide:1}),F("file","ไฟล์ PDF (อัปโหลดแล้วเปิดอ่านในเว็บได้ทันที)","pdf",{wide:1}),F("url","หรือ ลิงก์ Google Drive (ตั้งค่า ทุกคนที่มีลิงก์ดูได้)","url",{wide:1}),F("photos","ภาพปก (ไม่ใส่ก็ได้ ระบบใช้หน้าแรกของ PDF)","photos",{wide:1})],
  plans: [F("title","ชื่อแผน / เรื่อง","text",{wide:1}),F("subject","กลุ่มสาระ / วิชา"),F("grade","ชั้น / กลุ่มเป้าหมาย"),F("dhamma","หลักธรรมที่บูรณาการ"),F("date","วันที่","date"),F("teacher","ครูผู้สอน"),F("tphoto","ภาพครูผู้สอน (ไม่ใส่ก็ได้ ถ้าชื่อตรงกับหน้าบุคลากร ระบบใช้ภาพจากหน้าบุคลากรให้)","photo1",{wide:1}),F("desc","คำอธิบายสั้น ๆ","textarea",{wide:1}),F("file","ลิงก์ไฟล์แผนการจัดการเรียนรู้ (Google Drive / Google Docs / PDF ตั้งค่าทุกคนที่มีลิงก์ดูได้)","url",{wide:1}),F("slides","ลิงก์สไลด์นำเสนอ (Google Slides / Canva / Google Drive)","url",{wide:1}),F("video","ลิงก์วิดีโอ (ถ้ามี)","url",{wide:1}),F("photos","ภาพกิจกรรม","photos",{wide:1})],
  innov: [F("title","ชื่อนวัตกรรม","text",{wide:1}),F("subject","ประเภทนวัตกรรม"),F("grade","ชั้น / กลุ่มเป้าหมาย"),F("dhamma","หลักธรรมที่บูรณาการ"),F("date","วันที่","date"),F("teacher","เจ้าของนวัตกรรม"),F("tphoto","ภาพเจ้าของนวัตกรรม (ไม่ใส่ก็ได้ ถ้าชื่อตรงกับหน้าบุคลากร ระบบใช้ภาพจากหน้าบุคลากรให้)","photo1",{wide:1}),F("desc","คำอธิบายสั้น ๆ","textarea",{wide:1}),F("file","ลิงก์ไฟล์เล่มนวัตกรรม (Google Drive / Google Docs / PDF ตั้งค่าทุกคนที่มีลิงก์ดูได้)","url",{wide:1}),F("slides","ลิงก์สไลด์นำเสนอ (Google Slides / Canva / Google Drive)","url",{wide:1}),F("video","ลิงก์วิดีโอ (ถ้ามี)","url",{wide:1}),F("photos","ภาพกิจกรรม","photos",{wide:1})],
  videos: [F("title","ชื่อวิดีโอ","text",{wide:1}),F("date","วันที่","date"),F("url","ลิงก์วิดีโอ: YouTube / Facebook / Google Drive / TikTok / Vimeo (ตั้งค่าให้ทุกคนดูได้)","url",{wide:1}),F("desc","คำอธิบายสั้น ๆ (ถ้ามี)","text",{wide:1}),F("photos","ภาพปก (ไม่ใส่ก็ได้ YouTube และ Google Drive ใช้ภาพปกจากคลิปให้อัตโนมัติ)","photos",{wide:1})],
  people: [F("name","ชื่อ–นามสกุล","text",{wide:1}),F("role","ตำแหน่ง / หน้าที่ (เช่น ผู้อำนวยการโรงเรียน, ครูผู้รับผิดชอบโครงการโรงเรียนวิถีพุทธ)","text",{wide:1}),F("group","กลุ่ม","select",{opts:PGROUPS}),F("order","ลำดับการแสดง (ตัวเลขน้อยขึ้นก่อน)","number"),F("photos","ภาพบุคคล (ใช้ภาพแรก แนะนำภาพแนวตั้ง หน้าตรง)","photos",{wide:1})],
  events: [F("title","ชื่อกิจกรรม","text",{wide:1}),F("date","วันเริ่ม (หน้าแรกนับถอยหลังถึงวันนี้)","date"),F("time","เวลาเริ่ม (ใช้นับถอยหลัง)","time"),F("end","วันสิ้นสุด (ถ้ามี)","date"),F("detail","รายละเอียดสั้น ๆ","text",{wide:1})],
};
const COLL = { people: "people", posts: "posts", projects: "projects", dhamma: "dhamma", docs: "docs", videos: "videos", plans: "plans", innov: "innovs", events: "events" };
const NEWOBJ = { people: () => ({ group: "ครูและบุคลากร" }), posts: () => ({ date: today(), cat: CATS[0] }), projects: () => ({}), dhamma: () => ({ type: "dekdee", date: today(), term: "2", hours: 1, spType: "monk" }), docs: () => ({ date: today(), cat: "รายงาน" }), videos: () => ({ date: today() }), plans: () => ({ date: today() }), innov: () => ({ date: today() }), events: () => ({ date: today() }) };
function fieldHTML(f, o) {
  const v = o[f.k];
  const w = f.wide ? ' class="f wide"' : ' class="f"';
  if (f.type === "textarea") return `<label${w}>${esc(f.label)}<textarea data-k="${f.k}">${esc(v || "")}</textarea></label>`;
  if (f.type === "select") return `<label${w}>${esc(f.label)}<select data-k="${f.k}">${f.opts.map(op => { const [val, t] = Array.isArray(op) ? op : [op, op]; return `<option value="${esc(val)}" ${String(v ?? "") === String(val) ? "selected" : ""}>${esc(t)}</option>`; }).join("")}</select></label>`;
  if (f.type === "inds") return `<div${w}><span>${esc(f.label)}</span><div class="ichips" data-k="${f.k}" data-type="inds">${ALL.map(([id, t]) => `<label title="${esc(t)}"><input type="checkbox" value="${id}" ${(v || []).includes(id) ? "checked" : ""}>${id}</label>`).join("")}</div></div>`;
  if (f.type === "photo1") { pendingT = v || ""; return `<div${w}><span>${esc(f.label)}</span><div class="phs" id="pht"></div><label class="btn sm" style="justify-self:start;margin-top:6px">เลือกภาพ<input type="file" accept="image/*" id="phtIn" hidden></label></div>`; }
  if (f.type === "photos") { pending = [...(v || [])]; return `<div${w}><span>${esc(f.label)}</span><div class="phs" id="phs"></div><label class="btn sm" style="justify-self:start;margin-top:6px">เพิ่มภาพ<input type="file" accept="image/*" multiple id="phIn" hidden></label><span class="hint">ระบบย่อภาพให้อัตโนมัติ เลือกเฉพาะภาพที่ดีที่สุด 3–8 ภาพต่อข่าว</span></div>`; }
  if (f.type === "pdf") { pendingPdf = v || null; return `<div${w}><span>${esc(f.label)}</span><div id="pdfInfo" class="pdfinfo">${pdfInfoHTML()}</div>${assetsApi ? `<label class="btn sm" style="justify-self:start;margin-top:6px">เลือกไฟล์ PDF<input type="file" accept="application/pdf" id="pdfIn" hidden></label><span class="hint">ไฟล์ไม่เกิน 20 MB</span>` : `<span class="hint">ใส่ลิงก์ Google Drive ในช่องถัดไป (ระบบเปิดอ่านในเว็บได้ทันที)</span>`}</div>`; }
  if (f.type === "entries") return `<label${w}>${esc(f.label)}<textarea data-k="${f.k}" style="min-height:120px;font-variant-numeric:tabular-nums">${esc((v || []).map(e => [e.date || "-", { income: "รายรับ", expense: "รายจ่าย", activity: "กิจกรรม" }[e.kind] || "กิจกรรม", e.detail, e.kind === "activity" ? "" : e.amount].join(" | ")).join("\n"))}</textarea><span class="hint">ตัวอย่าง: 2026-11-10 | รายรับ | ขายพวงกุญแจ 20 ชิ้น | 400 · ไม่ทราบวันที่ใส่ -</span></label>`;
  return `<label${w}>${esc(f.label)}<input type="${f.type}" data-k="${f.k}" value="${esc(v ?? "")}"></label>`;
}
function readFields(box, spec, base) {
  const o = { ...base };
  for (const f of spec) {
    const el = box.querySelector(`[data-k="${f.k}"]`);
    if (f.type === "photos") { o[f.k] = [...pending]; continue; }
    if (f.type === "photo1") { o[f.k] = pendingT; continue; }
    if (f.type === "pdf") { o[f.k] = pendingPdf; continue; }
    if (!el) continue;
    if (f.type === "inds") o[f.k] = [...el.querySelectorAll("input:checked")].map(x => x.value);
    else if (f.type === "number") o[f.k] = el.value === "" ? "" : +el.value;
    else if (f.type === "entries") o[f.k] = el.value.split("\n").map(l => l.split("|").map(x => x.trim())).filter(a => a[0] || a[2]).map(([d, k, det, amt], i) => ({ id: "e" + i, date: /^\d{4}-\d\d-\d\d$/.test(d) ? d : "", kind: k === "รายรับ" ? "income" : k === "รายจ่าย" ? "expense" : "activity", detail: det || "", amount: +String(amt || "").replace(/,/g, "") || 0 }));
    else o[f.k] = el.value.trim();
  }
  return o;
}
function paintPhotos() { const t = $("#pht"); if (t) t.innerHTML = img(pendingT) ? `<figure><img src="${img(pendingT)}" alt=""><button type="button" data-rmpt aria-label="ลบภาพ">×</button></figure>` : `<span class="hint">ยังไม่มีภาพ</span>`;
  const b = $("#phs"); if (!b) return; b.innerHTML = pending.map((id, i) => img(id) ? `<figure><img src="${img(id)}" alt=""><button type="button" data-rmph="${i}" aria-label="ลบภาพ">×</button></figure>` : "").join("") || `<span class="hint">ยังไม่มีภาพ</span>`; }
function compress(file, png) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => { const im = new Image(); im.onload = () => { const max = png ? 600 : 1280, k = Math.min(1, max / Math.max(im.width, im.height)); const c = document.createElement("canvas"); c.width = Math.round(im.width * k); c.height = Math.round(im.height * k); c.getContext("2d").drawImage(im, 0, 0, c.width, c.height); res(png ? c.toDataURL("image/png") : c.toDataURL("image/jpeg", 0.7)); }; im.onerror = rej; im.src = r.result; };
    r.onerror = rej; r.readAsDataURL(file);
  });
}
async function addPhotos(files) {
  for (const f of files) { try { const d = await compress(f); const id = "i" + uid(); S.img = S.img || {}; S.img[id] = d; pending.push(id); } catch { toast("อ่านภาพไม่ได้: " + f.name); } }
  paintPhotos();
}
function listAdmin(kind) {
  const coll = COLL[kind], items = sortDate((S[coll] || []).filter(x => !x.year || x.year === viewYear));
  const label = x => x.title || x.name || x.topic || "(ไม่มีชื่อ)";
  const cur = editId ? (S[coll] || []).find(x => x.id === editId) : null;
  const obj = cur || NEWOBJ[kind]();
  return `<div class="sh" style="margin-bottom:10px"><h2>${ADM.find(a => a[0] === kind)[1]} · ปีการศึกษา ${esc(viewYear)}</h2><button class="btn sm" data-new>+ เพิ่มใหม่</button></div>
    <ul class="rowlist">${items.length ? items.map(x => `<li class="${x.id === editId ? "sel" : ""}"><span><b>${esc(label(x))}</b><div class="meta">${x.date ? thDate(x.date) : ""}${x.cat ? " · " + esc(x.cat) : ""}</div></span><span><button class="btn sm" data-edit="${esc(x.id)}">แก้ไข</button> <button class="btn sm" data-del="${esc(x.id)}">ลบ</button></span></li>`).join("") : `<li><span class="meta">ยังไม่มีรายการ</span></li>`}</ul>
    <div class="panel"><h3 style="margin-bottom:10px">${cur ? "แก้ไขรายการ" : "เพิ่มรายการใหม่"}</h3><form class="form" id="admForm">${SPECS[kind].map(f => fieldHTML(f, obj)).join("")}<div class="wide" style="display:flex;gap:8px"><button class="btn pri" type="submit">${cur ? "บันทึกการแก้ไข" : "เพิ่มรายการ"}</button>${cur ? `<button class="btn" type="button" data-new>ยกเลิก</button>` : ""}</div></form></div>`;
}
function admBody() {
  if (admTab === "pages") return pagesAdmin();
  if (COLL[admTab]) return listAdmin(admTab);
  if (admTab === "ind") {
    const id = ALL.some(a => a[0] === editId) ? editId : "1.1";
    const d = S.ind?.[id] || {}; pending = [...(d.photos || [])];
    return `<div class="sh" style="margin-bottom:10px"><h2>อัตลักษณ์ 29 ประการ</h2></div>
      <div class="panel"><form class="form" id="indForm">
        <label class="f wide">เลือกข้อ<select id="indSel">${ALL.map(([k, t]) => `<option value="${k}" ${k === id ? "selected" : ""}>${k} ${esc(t)}</option>`).join("")}</select></label>
        <label class="f">ระดับประเมินตนเอง<select data-k="level"><option value="">ไม่ระบุ</option>${[5,4,3,2,1].map(n => `<option ${String(d.level) === String(n) ? "selected" : ""}>${n}</option>`).join("")}</select></label>
        <label class="f wide">คำอธิบายการดำเนินงานของโรงเรียน (แสดงบนเว็บไซต์)<textarea data-k="text">${esc(d.text || "")}</textarea></label>
        <label class="f wide">ลิงก์หลักฐาน: บรรทัดละรายการ ชื่อเอกสาร | ลิงก์<textarea data-k="links">${esc((d.links || []).map(l => `${l.t} | ${l.u}`).join("\n"))}</textarea></label>
        <div class="f wide"><span>ภาพหลักฐาน</span><div class="phs" id="phs"></div><label class="btn sm" style="justify-self:start;margin-top:6px">เพิ่มภาพ<input type="file" accept="image/*" multiple id="phIn" hidden></label></div>
        <div class="wide"><button class="btn pri" type="submit">บันทึกข้อ ${id}</button> <span class="hint">ข่าวที่เลือกข้อนี้จะแสดงเป็นหลักฐานโดยอัตโนมัติ</span></div>
      </form></div>`;
  }
  if (admTab === "bp") {
    const b = S.bp || {}; pending = [...(b.photos || [])];
    return `<div class="sh" style="margin-bottom:10px"><h2>Best Practice</h2></div><div class="panel"><form class="form" id="bpForm">
      <label class="f wide">ชื่อผลงาน<input data-k="title" value="${esc(b.title)}"></label>
      <label class="f">หลักธรรม<input data-k="dhamma" value="${esc(b.dhamma)}"></label><label class="f">เจ้าของผลงาน<input data-k="owner" value="${esc(b.owner)}"></label>
      <label class="f">รางวัล<input data-k="award" value="${esc(b.award)}"></label><label class="f">ลิงก์รายงานฉบับเต็ม<input data-k="doc" type="url" value="${esc(b.doc)}"></label>
      <label class="f wide">ที่มาและความสำคัญ<textarea data-k="problem">${esc(b.problem)}</textarea></label>
      <label class="f wide">กระบวนการ: บรรทัดละขั้น ชื่อขั้น | หลักธรรม | รายละเอียด<textarea data-k="steps" style="min-height:130px">${esc((b.steps || []).map(s => [s.title, s.truth, s.detail].join(" | ")).join("\n"))}</textarea></label>
      <label class="f wide">ผลการดำเนินงาน: บรรทัดละรายการ ตัวชี้วัด | ผล<textarea data-k="results">${esc((b.results || []).map(r => `${r.label} | ${r.value}`).join("\n"))}</textarea></label>
      <div class="f wide"><span>ภาพประกอบ</span><div class="phs" id="phs"></div><label class="btn sm" style="justify-self:start;margin-top:6px">เพิ่มภาพ<input type="file" accept="image/*" multiple id="phIn" hidden></label></div>
      <div class="wide"><button class="btn pri" type="submit">บันทึก</button></div></form></div>`;
  }
  if (admTab === "school") {
    const s = S.school; pending = [...(s.hero || [])];
    return `<div class="sh" style="margin-bottom:10px"><h2>ข้อมูลโรงเรียน</h2></div><div class="panel"><form class="form" id="scForm">
      <label class="f">ชื่อโรงเรียน<input data-k="name" value="${esc(s.name)}"></label><label class="f">ชื่อภาษาอังกฤษ / ข้อความใต้ชื่อ<input data-k="nameEn" value="${esc(s.nameEn)}" placeholder="เช่น WAT BANGPUN SCHOOL"></label><label class="f wide">สังกัด (ชื่อเต็ม แสดงใต้ชื่อโรงเรียน)<input data-k="areaFull" value="${esc(s.areaFull)}"></label><label class="f">สังกัด<input data-k="area" value="${esc(s.area)}"></label><label class="f">รหัสโรงเรียน<input data-k="code" value="${esc(s.code)}"></label>
      <label class="f wide">ที่อยู่<input data-k="address" value="${esc(s.address)}"></label>
      <label class="f">โทรศัพท์<input data-k="phone" value="${esc(s.phone)}"></label><label class="f">อีเมล<input data-k="email" value="${esc(s.email)}"></label><label class="f">ลิงก์ Facebook<input data-k="facebook" type="url" value="${esc(s.facebook)}"></label><label class="f">ลิงก์ Google Maps<input data-k="map" type="url" value="${esc(s.map)}"></label><label class="f">ลิงก์ LINE (ปุ่มลอย)<input data-k="line" type="url" value="${esc(s.line)}" placeholder="https://line.me/..."></label><label class="f"><span><input type="checkbox" data-k="mourning" ${s.mourning ? "checked" : ""}> แสดงริบบิ้นไว้ทุกข์มุมขวาบน</span></label>
      <label class="f wide">คำขวัญ / ข้อความใต้ชื่อโรงเรียน<input data-k="motto" value="${esc(s.motto)}"></label>
      <label class="f wide">ข้อความแนะนำโรงเรียนในหน้าแรก<textarea data-k="intro">${esc(s.intro)}</textarea></label>
      <label class="f wide">คุณธรรมอัตลักษณ์ (บรรทัดละข้อ)<textarea data-k="virtues">${esc((s.virtues || []).join("\n"))}</textarea></label>
      <label class="f wide">ประวัติโรงเรียน<textarea data-k="history">${esc(s.history)}</textarea></label>
      <label class="f wide">วิสัยทัศน์<textarea data-k="vision">${esc(s.vision)}</textarea></label>
      <label class="f wide">พันธกิจ (บรรทัดละข้อ)<textarea data-k="mission">${esc((s.mission || []).join("\n"))}</textarea></label>
      <label class="f">ผู้อำนวยการ<input data-k="dname" value="${esc(s.director?.name)}"></label><label class="f">ครูผู้รับผิดชอบโครงการ<input data-k="coordinator" value="${esc(s.coordinator)}"></label><label class="f">พระสงฆ์ที่ปรึกษา<input data-k="monk" value="${esc(s.monk)}"></label>
      <label class="f wide">สารจากผู้อำนวยการ<textarea data-k="dmsg">${esc(s.director?.message)}</textarea></label>
      <label class="f">จำนวนนักเรียน<input type="number" data-k="students" value="${esc(s.stats?.students)}"></label><label class="f">ครูและบุคลากร<input type="number" data-k="teachers" value="${esc(s.stats?.teachers)}"></label><label class="f">ห้องเรียน<input type="number" data-k="classes" value="${esc(s.stats?.classes)}"></label><label class="f">ปี พ.ศ. ที่ก่อตั้ง<input type="number" data-k="founded" value="${esc(s.stats?.founded)}"></label>
      <label class="f">ผลประเมินตนเอง 29 ประการ (ร้อยละ)<input data-k="selfScore" value="${esc(s.selfScore)}"></label>
      <label class="f"><span><input type="checkbox" data-k="showLevels" ${s.showLevels ? "checked" : ""}> แสดงระดับประเมินตนเองบนเว็บไซต์</span></label>
      <div class="f"><span>ตราโรงเรียน</span><div class="phs">${img(s.logo) ? `<img src="${img(s.logo)}" alt="">` : ""}</div><label class="btn sm" style="justify-self:start">เลือกภาพ<input type="file" accept="image/*" id="logoIn" hidden></label></div><div class="f"><span>ตราโรงเรียนวิถีพุทธ (แสดงคู่กัน)</span><div class="phs">${img(s.logo2) ? `<img src="${img(s.logo2)}" alt="">` : ""}</div><label class="btn sm" style="justify-self:start">เลือกภาพ<input type="file" accept="image/*" id="logo2In" hidden></label></div>
      <div class="f"><span>ภาพผู้อำนวยการ</span><div class="phs">${img(s.director?.photo) ? `<img src="${img(s.director.photo)}" alt="">` : ""}</div><label class="btn sm" style="justify-self:start">เลือกภาพ<input type="file" accept="image/*" id="dirIn" hidden></label></div>
      <div class="f wide"><span>ภาพหน้าแรก (ทุกภาพหมุนเป็นสไลด์ มีตราโรงเรียนเล็ก ๆ ที่แถบล่าง · สไลด์ต้อนรับเป็นสีแดงล้วนเพื่อให้ตราเด่น)</span><div class="phs" id="phs"></div><label class="btn sm" style="justify-self:start;margin-top:6px">เพิ่มภาพ<input type="file" accept="image/*" multiple id="phIn" hidden></label><span class="hint">ใช้ภาพแนวนอน เช่น ภาพมุมกว้างโรงเรียน นักเรียนทำกิจกรรม 1–5 ภาพ</span></div>
      <div class="wide"><button class="btn pri" type="submit">บันทึกข้อมูลโรงเรียน</button></div></form></div>`;
  }
  if (admTab === "popup") {
    const p = S.popup || {}; pendingPop = p.photo || "";
    return `<div class="sh" style="margin-bottom:10px"><h2>หน้าต่างวันสำคัญ</h2></div><div class="panel"><p class="hint" style="margin:0 0 12px">หน้าต่างนี้ขึ้นเมื่อผู้ชมเปิดหน้าแรก เฉพาะช่วงวันที่กำหนด ผู้ชมแต่ละคนเห็นครั้งเดียวต่อการเปิดเบราว์เซอร์ ใช้ได้ทั้งวันไว้อาลัย และวันเฉลิมพระชนมพรรษาหรือวันสำคัญอื่น</p><form class="form" id="popForm">
      <label class="f"><span><input type="checkbox" data-k="on" ${p.on ? "checked" : ""}> เปิดใช้หน้าต่างนี้</span></label>
      <label class="f">รูปแบบ<select data-k="theme"><option value="mourn" ${p.theme !== "gold" ? "selected" : ""}>ไว้อาลัย (ขาว–ดำ)</option><option value="gold" ${p.theme === "gold" ? "selected" : ""}>เฉลิมพระเกียรติ / วันสำคัญ (ทอง)</option></select></label>
      <label class="f">เริ่มแสดง<input type="date" data-k="start" value="${esc(p.start)}"></label><label class="f">สิ้นสุด<input type="date" data-k="end" value="${esc(p.end)}"></label>
      <div class="f wide"><span>ภาพประกอบ (ภาพทางการจากหน่วยงานราชการ แนวนอน)</span><div class="phs" id="popPrev">${img(p.photo) ? `<img src="${img(p.photo)}" alt="" style="width:auto;height:110px">` : `<span class="hint">ยังไม่มีภาพ</span>`}</div><span style="display:flex;gap:8px"><label class="btn sm">เลือกภาพ<input type="file" accept="image/*" id="popImgIn" hidden></label><button type="button" class="btn sm" id="popImgRm">เอาภาพออก</button></span></div>
      <label class="f wide">ข้อความหลัก (เช่น เสด็จสู่สวรรคาลัย / ทรงพระเจริญ)<input data-k="title" value="${esc(p.title ?? POPSET.mourn.title)}"></label>
      <label class="f wide">ข้อความรอง (เช่น น้อมสำนึกในพระมหากรุณาธิคุณตราบนิจนิรันดร์)<input data-k="sub" value="${esc(p.sub ?? POPSET.mourn.sub)}"></label>
      <label class="f wide">ข้อความลงนาม (ชื่อโรงเรียนจะแสดงต่อท้ายโดยอัตโนมัติ)<input data-k="sign" value="${esc(p.sign ?? "ข้าพระพุทธเจ้า ผู้บริหาร คณะครู บุคลากร คณะกรรมการสถานศึกษา และนักเรียน")}"></label>
      <label class="f">ข้อความปุ่ม (เปลี่ยนตามรูปแบบอัตโนมัติ)<input data-k="b1t" value="${esc(p.b1t ?? POPSET[p.theme === "gold" ? "gold" : "mourn"].b1t)}"></label><label class="f">ลิงก์ปุ่ม (เช่น เว็บลงนามของสำนักพระราชวัง)<input type="url" data-k="b1u" value="${esc(p.b1u)}" placeholder="https://..."></label>
      <label class="f wide"><span><input type="checkbox" data-k="gray" ${p.gray ? "checked" : ""}> ปรับทั้งเว็บไซต์เป็นสีขาว–ดำในช่วงวันที่กำหนด (ช่วงไว้ทุกข์)</span></label>
      <div class="wide" style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn pri" type="submit">บันทึก</button><button class="btn" type="button" id="popPreview">ดูตัวอย่าง</button></div></form></div>`;
  }
  if (admTab === "menu") {
    const codes = [["หน้าแรก","#home"],["เกี่ยวกับโรงเรียน","#about"],["ผู้บริหารและบุคลากร","#people"],["อัตลักษณ์ 29 ประการ","#way"],["Best Practice","#bp"],["โครงงานคุณธรรม","#projects"],["ธรรมะประจำสัปดาห์","#dhamma"],["แผนการจัดการเรียนรู้","#plans"],["นวัตกรรม","#innov"],["ข่าวทั้งหมด","#news"],["ข่าวตามหมวด","#news:ชื่อหมวด"],["วิดีโอกิจกรรม","#videos"],["เอกสารเผยแพร่","#docs"],["ติดต่อเรา","#contact"],...pagesList().map(p => [p.title, "#p-" + p.id])];
    return `<div class="sh" style="margin-bottom:10px"><h2>เมนูหลัก</h2></div><div class="two"><div class="panel"><form class="form" id="menuForm">
      <label class="f wide">บรรทัดละเมนู: ชื่อเมนู | ลิงก์ · เมนูย่อยขึ้นต้นด้วย - · ลิงก์เว็บภายนอก (https://...) จะเปิดดูในระบบได้เลย<textarea data-k="menu" style="min-height:340px;font-family:ui-monospace,monospace;font-size:.95em">${esc(menuText(menuItems()))}</textarea></label>
      <div class="wide" style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn pri" type="submit">บันทึกเมนู</button><button class="btn" type="button" id="menuReset">คืนค่าเริ่มต้น</button></div></form></div>
      <div class="panel"><h3 style="margin-bottom:8px">ตัวอย่าง</h3><pre class="mex">หน้าแรก | #home
ข้อมูลโรงเรียน
- ประวัติและวิสัยทัศน์ | #about
- เว็บไซต์ สพป.สิงห์บุรี | https://www.singarea.go.th
ติดต่อเรา | #contact</pre><h3 style="margin:14px 0 6px">ลิงก์หน้าในระบบ</h3><table class="t"><tbody>${codes.map(([t, c]) => `<tr><td>${esc(t)}</td><td><code>${esc(c)}</code></td></tr>`).join("")}</tbody></table></div></div>`;
  }
  if (admTab === "side") {
    return `<div class="sh" style="margin-bottom:10px"><h2>เมนู E-Service ด้านข้าง</h2></div><div class="panel"><form class="form" id="sideForm">
      <label class="f wide">บรรทัดละเมนู: ชื่อเมนู | ลิงก์ (เช่น ตารางสอนออนไลน์ | https://...)<textarea data-k="es" style="min-height:220px">${esc((S.eservice || []).map(l => `${l.t} | ${l.u}`).join("\n"))}</textarea></label>
      <div class="wide"><button class="btn pri" type="submit">บันทึกเมนู</button> <span class="hint">การ์ด E-Service จะแสดงด้านข้างทุกหน้าเมื่อมีอย่างน้อย 1 เมนู</span></div></form></div>`;
  }
  if (admTab === "years") {
    return `<div class="sh" style="margin-bottom:10px"><h2>ปีการศึกษา</h2></div><div class="panel">
      <p>ปีที่เว็บไซต์แสดงเป็นค่าเริ่มต้น: <b>${esc(S.year)}</b> · ผู้เข้าชมเลือกดูข้อมูลปีก่อนได้จากตัวเลือกปีในแต่ละหน้า ข่าว โครงงาน ธรรมะ และเอกสารที่เพิ่มใหม่จะบันทึกเป็นปีที่กำลังเปิดดูอยู่</p>
      <ul class="rowlist">${[...S.years].sort().reverse().map(y => `<li><span><b>${esc(y)}</b> ${y === S.year ? `<span class="chip ok">ปีปัจจุบัน</span>` : ""}</span><span>${y !== S.year ? `<button class="btn sm" data-cur="${esc(y)}">ตั้งเป็นปีปัจจุบัน</button>` : ""}</span></li>`).join("")}</ul>
      <form class="form" id="yrForm"><label class="f">เพิ่มปีการศึกษา<input id="yrNew" inputmode="numeric" placeholder="เช่น 2570"></label><label class="f"><span><input type="checkbox" id="yrCopy" checked> คัดลอกคำอธิบายอัตลักษณ์ 29 ประการไว้ใช้ต่อ</span></label><div><button class="btn pri" type="submit">เพิ่มปีและตั้งเป็นปีปัจจุบัน</button></div></form>
      <p class="hint" style="margin-top:10px">เมื่อเพิ่มปีใหม่ ระดับ ภาพ และลิงก์หลักฐานของอัตลักษณ์ 29 ประการเริ่มใหม่สำหรับปีนั้น ข้อมูลปีเก่ายังเปิดดูได้โดยเลือกปีในหน้าวิถีพุทธ 29 ประการ</p></div>`;
  }
  return "";
}
V.admin = () => {
  if (!canEdit) return pageHead("จัดการเว็บไซต์", "สำหรับผู้ดูแลเว็บไซต์") + `<section class="band"><div class="wrap"><div class="login-box">${LOTUS}<h2>เข้าสู่ระบบผู้ดูแล</h2>${!Store.ready ? `<p class="meta">ยังไม่ได้ตั้งค่า Firebase (ไฟล์ firebase-config.js)</p>` : curUser ? `<p>บัญชี <b>${esc(curUser.email)}</b> ไม่มีสิทธิ์แก้ไขเว็บไซต์นี้</p><button class="btn" id="logoutBtn">ออกจากระบบ</button>` : `<p class="meta">ใช้บัญชี Google ของผู้ดูแลเว็บไซต์</p><button class="btn pri" id="loginBtn">เข้าสู่ระบบด้วย Google</button>`}</div></div></section>`;
  return `<div class="wrap adm"><nav>${ADM.map(([k, t]) => `<button data-tab="${k}" aria-pressed="${k === admTab}">${t}</button>`).join("")}<div style="margin-top:10px">${yearPicker("admYear")}</div><div class="adm-user"><small>${esc(curUser?.email || "")}</small><button class="btn sm" id="logoutBtn">ออกจากระบบ</button></div></nav><div id="admBody">${admBody()}</div></div>`;
};

/* ---------- lightbox gallery ---------- */
function openLightbox(el) {
  const box = el.closest("[data-gal], .pb-g, .pb-car, .gallery, .pb-it") || el.parentElement;
  const list = [...box.querySelectorAll("[data-zoom]")].map(x => x.src);
  let i = Math.max(0, list.indexOf(el.src));
  const lb = document.createElement("div"); lb.className = "lightbox"; lb.setAttribute("role", "dialog"); lb.setAttribute("aria-label", "ภาพขยาย");
  const paint = () => { lb.innerHTML = `<img src="${list[i]}" alt="">${list.length > 1 ? `<button class="lb-nav p" aria-label="ภาพก่อนหน้า">‹</button><button class="lb-nav n" aria-label="ภาพถัดไป">›</button><span class="lb-c">${thNum(i + 1)} / ${thNum(list.length)}</span>` : ""}<button class="lb-x" aria-label="ปิด">×</button>`; };
  const close = () => { lb.remove(); removeEventListener("keydown", key); };
  const key = e => { if (e.key === "Escape") close(); if (e.key === "ArrowRight") { i = (i + 1) % list.length; paint(); } if (e.key === "ArrowLeft") { i = (i - 1 + list.length) % list.length; paint(); } };
  lb.onclick = e => { if (e.target.closest(".lb-nav")) { i = (i + (e.target.closest(".n") ? 1 : -1) + list.length) % list.length; paint(); return; } if (e.target.tagName !== "IMG") close(); };
  addEventListener("keydown", key); paint(); document.body.appendChild(lb);
}
/* ---------- custom pages (Google Sites style) ---------- */
const TH_D = "๐๑๒๓๔๕๖๗๘๙";
function thaify(root) {
  if (!root) return;
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode: n => { const p = n.parentElement; if (!p || p.closest("script,style,textarea,input,select,.no-th,.adm,.savebar")) return NodeFilter.FILTER_REJECT; return /[0-9]/.test(n.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP; } });
  const ns = []; while (w.nextNode()) ns.push(w.currentNode);
  ns.forEach(n => n.nodeValue = n.nodeValue.replace(/[0-9]/g, d => TH_D[d]));
  keepWords(root);
}
/* Thai distributed justification (like Word): break lines at Thai word boundaries, then spread the letters of each line to fill the width */
const SEGW = (() => { try { return new Intl.Segmenter("th", { granularity: "word" }); } catch { return null; } })();
const SEGG = (() => { try { return new Intl.Segmenter("th", { granularity: "grapheme" }); } catch { return null; } })();
let mctx = null;
function thUnits(t) {
  const cuts = new Set(SEGW ? [...SEGW.segment(t)].map(x => x.index) : [...t.matchAll(/\s+/g)].map(m => m.index + m[0].length));
  const re = keepTerms(); if (re) { re.lastIndex = 0; let m; while ((m = re.exec(t))) for (let k = m.index + 1; k < m.index + m[0].length; k++) cuts.delete(k); }
  [...cuts].forEach(k => { if (/^[ๆฯ)\]}”’,.!?:;%–-]/.test(t[k] || "") || /[(\[{“‘]$/.test(t[k - 1] || "") || /[\u0E31\u0E34-\u0E3A\u0E47-\u0E4E]/.test(t[k] || "")) cuts.delete(k); });
  const pts = [...cuts].filter(k => k > 0 && k < t.length).sort((a, b) => a - b);
  const out = []; let a = 0; for (const k of pts) { out.push(t.slice(a, k)); a = k; } out.push(t.slice(a));
  return out.filter(Boolean);
}
function justifyEl(p) {
  if (p.dataset.src == null) p.dataset.src = p.textContent;
  const src = p.dataset.src, cs = getComputedStyle(p);
  const W = p.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight) - 1;
  if (!(W > 140) || cs.display === "none") { p.textContent = src; return; }
  const ind = parseFloat(cs.textIndent) || 0;
  mctx = mctx || document.createElement("canvas").getContext("2d");
  mctx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
  const mw = x => mctx.measureText(x).width;
  const lines = []; let cur = "", avail = W - ind;
  for (const u of thUnits(src)) {
    if (cur && mw((cur + u).replace(/\s+$/, "")) > avail) { lines.push([cur.replace(/\s+$/, ""), avail]); cur = u.replace(/^\s+/, ""); avail = W; }
    else cur += u;
  }
  if (cur.trim()) lines.push([cur.replace(/\s+$/, ""), avail]);
  p.textContent = "";
  lines.forEach(([t, av], k) => {
    const sp = document.createElement("span"); sp.className = "jl"; sp.textContent = t;
    if (k === 0 && ind) sp.style.paddingLeft = ind + "px";
    if (k < lines.length - 1) { const g = SEGG ? [...SEGG.segment(t)].length : t.length, nsp = (t.match(/ /g) || []).length, ex = av - mw(t); const ws = nsp ? Math.min(ex * .45 / nsp, 9) : 0; const ls = (ex - ws * nsp) / Math.max(1, g); if (ex > 0 && ls < 5) { if (ws) sp.style.wordSpacing = ws.toFixed(2) + "px"; sp.style.letterSpacing = ls.toFixed(3) + "px"; } }
    p.append(sp);
  });
}
function justifyAll(root = document) { root.querySelectorAll("p.jt").forEach(justifyEl); fitNames(root); }
function fitNames(root = document) {
  root.querySelectorAll(".pc figcaption b").forEach(b => {
    b.style.fontSize = ""; if (getComputedStyle(b).whiteSpace !== "nowrap") return;
    let f = parseFloat(getComputedStyle(b).fontSize), n = 0;
    while (b.scrollWidth > b.clientWidth + 1 && f > 12 && n++ < 12) { f -= 0.5; b.style.fontSize = f + "px"; }
  });
}
let jTimer = null;
addEventListener("resize", () => { clearTimeout(jTimer); jTimer = setTimeout(() => justifyAll(), 150); });
document.fonts?.ready?.then(() => justifyAll());
/* keep proper names and key Thai terms on one line (the browser's Thai word breaker splits names it does not know) */
const KEEP_BASE = ["โรงเรียนวัดบางปูน","โรงเรียนวิถีพุทธ","วัดบางปูน","บางปูน","สพป.สิงห์บุรี","สิงห์บุรี","อินทร์บุรี","ชีน้ำร้าย","วิถีพุทธ","อัตลักษณ์","ไตรสิกขา","อิทธิบาท","อริยสัจ","พรหมวิหาร","คุณธรรม","ความรับผิดชอบ","ความซื่อสัตย์สุจริต","ความพอเพียง","จิตสาธารณะ","คณะกรรมการ","ผู้อำนวยการ","ผู้บริหาร","พระสงฆ์","พุทธศาสนสุภาษิต","มังสวิรัติ","ฝาขวดแปลงกาย","สร้างศิลป์ทำดี","เด็กดีมีธรรมะ","มีปัญญา","กล่องวัดใจ","ลูกเสือจิตอาสา","ศิลปหัตถกรรม","เหรียญทอง","รองชนะเลิศ","ชนะเลิศ","ประเมินออนไลน์","พฤศจิกายน","ปีการศึกษา","ประถมศึกษา","มัธยมศึกษา","Best Practice","Active Learning","Google Form","ผู้ปกครอง","ขอบพระคุณ","ขอขอบพระคุณ","นักเรียน","ชุมชน","ร้อยละ","หลักฐาน","ภาคเรียน","สมุดบันทึก","ขั้นพื้นฐาน","ศึกษาธิการ","ประจำสัปดาห์","ประชาสัมพันธ์","สำนักงานเขตพื้นที่","พฤติกรรม","ทักษะอาชีพ","รายได้","มีอาชีพ","ความพึงพอใจ","ผู้เกี่ยวข้อง","กลุ่มเป้าหมาย","ข้อตกลง","ปฏิบัติ","ศาสนกิจ","แหล่งเรียนรู้","ห้องเรียน","พระพุทธรูป","สม่ำเสมอ","ดำเนินการ","บรรยายธรรม","ข้อคิด","ชีวิตจริง","ชีวิตประจำวัน","ผลิตภัณฑ์","ซื่อสัตย์","บริษัทสร้างการดี","โรงเรียนสุจริต","พระพุทธศาสนา","ทุกวัน","ทุกครั้ง","ลานธรรม","เจริญปัญญา","บริหารจิต","ธรรมศึกษา","ปฏิบัติธรรม","สิ่งเสพติด","เสริมแรงเชิงบวก","ข้อมูลพื้นฐาน","โครงงานอาชีพ","พระราชดำรัส","วาทะธรรม","ร่มรื่น","หน้าเสาธง","สะท้อนความรู้สึก","ใส่บาตร","ฟังเทศน์","สวดมนต์แปล","เสื้อขาว","รับประทาน","ประกาศและกิจกรรม","กิจกรรมที่จะมาถึง","ที่ปรึกษา","กลุ่มสาระการเรียนรู้","วิทยาศาสตร์","เทคโนโลยี","ผู้รับผิดชอบ","โครงการ","บุคลากร","เป้าหมาย","การยอมรับ","การรับรู้","ความเข้าใจ","การพัฒนา","ต่อยอด","ประเมินผล","วิธีการ","ทรัพยากร","ท้องถิ่น","ปราชญ์ชาวบ้าน","ความพอเพียง","ความฉลาดรู้","การเงิน","ช่วงชั้น","พระอธิการ","นิมนต์","เด็กบางปูน","พึ่งตนเอง","เผยแพร่","เงินตั้งต้น","คงเหลือ","คืนทุน","กำไรสุทธิ","รายรับ","รายจ่าย","อ่านรายละเอียด","ดูบันทึกทั้งหมด","เปิดเอกสาร","ชั้นนำ","คัดแยก","ฝาขวด","กล่องวัดใจ","ลายหินอ่อน","พวงกุญแจ","จำหน่าย","ระดับกลุ่มโรงเรียน","อันดับที่","ชั่วโมง","ภาคเรียน","คละชั้น","หน้าเสาธง","ผู้นำ","ผู้ตาม","กลุ่มละ","การเรียนรู้","เรียนรู้","ผลงาน","เจ้าของผลงาน","ส่งเสริม","ขึ้นไป","ดีขึ้นไป","เด็กดี","เด็กดีมีรายได้มีอาชีพ","มื้อกลางวัน","กลางวัน","กลุ่มสาระ","สำนักงาน","ประชุม","สิ่งของ","รางวัล","เป็นเลิศ","ดำเนินงาน","ความรู้","จัดการ","สัปดาห์ละ","เดือนละ","ปีละ","ร่วมกัน","ร่วมมือ","สมัครใจ","ตั้งใจ","จริงใจ","การศึกษา","ได้รับ","ปรับปรุง","อย่าง","เครือข่าย","ข้อเสนอแนะ","จิตอาสา","พอประมาณ","โครงงาน","ชุมชน","ชนบท","ทั้งหมด","ปลูกฝัง","ประจำวัน","เติบโต","ขยายโอกาส","ขนาดเล็ก","ควบคู่","ความสำเร็จ","คนดี","ปัญญา","ทุกท่าน","คณะครู","พระราชทาน","ลูกเสือ","กองทุน","หมุนเวียน","บัญชี","ปฐมนิเทศ","ยั่งยืน","ตระหนัก","ปลอดภัย","ดิจิทัล","นักสืบ","วิทยาการคำนวณ","เทคโนโลยี","แข่งขัน","ตัวแทน","เขตพื้นที่","หน้าที่","ปรากฏ","บันทึก","แต้ม","ความดี","อาหาร","ทรัพยากร","ท้องถิ่น","ผลิตภัณฑ์","วันพระ","บรรยาย","ผู้ปกครอง","ศาสนกิจ","พลาสติก","ทุกคน","เพื่อน","กิจกรรม","ข้อตกลง","ความซื่อสัตย์","รายได้","ลงมือ","ลงทุน","กำไร","ทำบุญ","สมุด","จำนวน","นักเรียน","ประถมศึกษา","มัธยมศึกษา","ปีการศึกษา","บูรณาการ","หลักธรรม","ไตรสิกขา","อริยสัจ","สมาธิ","ศีล","ปฏิบัติ","บริหาร","ห้องเรียน","ประจำ","สนับสนุน","ชื่นชม","ข้อคิด","ชีวิต","สำคัญ","ตลอด","เสมอ"];
let keepRe = null, keepKey = "";
function keepTerms() {
  const sc = S.school || {}, names = [sc.director?.name, sc.coordinator, sc.monk, sc.name, sc.area, S.bp?.owner, ...(S.projects || []).flatMap(p => [p.teacher, p.leaders, p.name]), ...(S.people || []).map(p => p.name)].filter(Boolean).join(" ");
  const words = names.split(/[\s·,()]+/).flatMap(w => { const m = w.match(/^(นางสาว|นาง|นาย|พระอธิการ|ด\.ญ\.|ด\.ช\.)(.+)$/); return m ? (m[1] === "พระอธิการ" ? [m[2]] : [w, m[2]]) : [w]; }).filter(w => /[\u0E00-\u0E7F]/.test(w) && w.length > 3 && w.length < 30);
  const key = words.join("|");
  if (key !== keepKey) { keepKey = key; const all = [...new Set([...KEEP_BASE, ...words])].sort((a, b) => b.length - a.length).map(w => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")); keepRe = new RegExp(["รุ่นที่\\s?[0-9๐-๙]+(?:\\s?\\([^)]{1,14}\\))?", "(?:ปีการศึกษา|พ\\.ศ\\.)\\s?[0-9๐-๙]{4}", "[0-9๐-๙]+\\s(?:พฤศจิกายน|ตุลาคม|ธันวาคม|มกราคม|กุมภาพันธ์|มีนาคม|เมษายน|พฤษภาคม|มิถุนายน|กรกฎาคม|สิงหาคม|กันยายน)", "\\([^)\\s]{1,14}\\)", "[0-9๐-๙]+[–-][0-9๐-๙]+(?:\\s?(?:คน|ชั่วโมง|นาที|วัน|ภาพ))?", ...all].join("|"), "g"); }
  return keepRe;
}
function keepWords(root) {
  const re = keepTerms(); if (!re) return;
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode: n => { const p = n.parentElement; if (!p || p.closest("script,style,textarea,input,select,option,k-w,.jt,.adm,.savebar") || /flex|grid/.test(getComputedStyle(p).display)) return NodeFilter.FILTER_REJECT; re.lastIndex = 0; return re.test(n.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP; } });
  const ns = []; while (w.nextNode()) ns.push(w.currentNode);
  ns.forEach(n => {
    const t = n.nodeValue, f = document.createDocumentFragment(); let last = 0; re.lastIndex = 0; let m;
    const th = c => /[\u0E00-\u0E7F]/.test(c || "");
    while ((m = re.exec(t))) { if (m.index > last) f.append(t.slice(last, m.index)); if (th(t[m.index - 1])) f.append("\u200B"); const sp = document.createElement("k-w"); sp.textContent = m[0]; f.append(sp); last = m.index + m[0].length; if (th(t[last])) f.append("\u200B"); }
    if (last < t.length) f.append(t.slice(last));
    n.replaceWith(f);
  });
}
const BLK = { heading: "หัวข้อ", text: "ข้อความ", image: "รูปภาพ", imgtext: "รูปคู่ข้อความ", button: "ปุ่มลิงก์", divider: "เส้นคั่น" };
const LAYOUTS = [["single", "ภาพเดี่ยว", "▭"], ["two", "2 คอลัมน์", "▯▯"], ["three", "3 คอลัมน์", "▯▯▯"], ["grid", "ตาราง", "▦"], ["masonry", "ก่ออิฐ", "▥"], ["collage", "ภาพใหญ่+เล็ก", "◧"], ["carousel", "เลื่อนสไลด์", "⇆"]];
const pagesList = () => (S.pages || []);
function blocksHTML(blocks) {
  return (blocks || []).map(b => {
    const ph = (b.photos || []).filter(img);
    const imgs = ph.map(p => `<img src="${img(p)}" alt="" loading="lazy" data-zoom>`).join("");
    const cap = b.caption ? `<figcaption>${esc(b.caption)}</figcaption>` : "";
    switch (b.type) {
      case "heading": return b.level === "h3" ? `<h3 class="pb-h3">${esc(b.text)}</h3>` : `<h2 class="pb-h2">${esc(b.text)}</h2>`;
      case "text": return `<div class="prose pb-text">${paras(b.text)}</div>`;
      case "divider": return `<div class="pb-hr" aria-hidden="true"><span>❖</span></div>`;
      case "button": { const href = safeUrl(b.url) || ((b.url || "").startsWith("#") ? b.url : "#home"); return b.label ? `<p class="pb-btn"><a class="btn pri" href="${esc(href)}"${safeUrl(b.url) ? ' target="_blank" rel="noopener"' : ""}>${esc(b.label)} ›</a></p>` : ""; }
      case "imgtext": return `<div class="pb-it ${b.side === "right" ? "r" : ""}"><figure>${ph[0] ? `<img src="${img(ph[0])}" alt="" data-zoom>` : `<div class="pb-ph">${LOTUS}</div>`}${cap}</figure><div>${b.heading ? `<h3>${esc(b.heading)}</h3>` : ""}<div class="prose">${paras(b.text)}</div></div></div>`;
      case "image":
        if (!ph.length) return "";
        if (b.layout === "carousel") return `<figure class="pb-car"><div class="track">${imgs}</div><button class="cv p" data-car="-1" aria-label="ภาพก่อนหน้า">‹</button><button class="cv n" data-car="1" aria-label="ภาพถัดไป">›</button>${cap}</figure>`;
        return `<figure class="pb-g ${esc(b.layout || "grid")}">${b.layout === "single" ? imgs : `<div class="gi">${imgs}</div>`}${cap}</figure>`;
    }
    return "";
  }).join("");
}
V.page = id => {
  const p = pagesList().find(x => x.id === id);
  if (!p) return pageHead("ไม่พบหน้านี้", "หน้านี้อาจถูกลบแล้ว") + `<section class="band"><div class="wrap"><a class="btn" href="#home">กลับหน้าแรก</a></div></section>`;
  return pageHead(p.title, p.sub || "") + `<section class="band"><div class="wrap pb">${blocksHTML(p.blocks) || emptyBox("หน้านี้ยังไม่มีเนื้อหา")}</div></section>`;
};
function homePages(no) {
  return pagesList().filter(p => p.onHome).map(p => `<section class="sec"><div class="wrap"><div class="st"><h2><span class="no">${no()}</span>${esc(p.title)}</h2><a href="#p-${esc(p.id)}">ดูทั้งหน้า ›</a></div><div class="pb reveal">${blocksHTML(p.blocks)}</div></div></section>`).join("");
}
document.addEventListener("click", e => {
  const c = e.target.closest("[data-car]"); if (!c) return;
  const tr = c.parentElement.querySelector(".track"); tr.scrollBy({ left: +c.dataset.car * tr.clientWidth * .85, behavior: "smooth" });
});
/* admin editor */
let pg = null;
function blockEditor(b, i, n) {
  const f = (k, label, type = "text", wide = 1) => `<label class="f${wide ? " wide" : ""}">${label}${type === "textarea" ? `<textarea data-bf="${i}:${k}">${esc(b[k] || "")}</textarea>` : `<input data-bf="${i}:${k}" type="${type}" value="${esc(b[k] || "")}">`}</label>`;
  const photos = (single) => `<div class="f wide"><span>${single ? "รูปภาพ (ใช้ภาพแรก)" : "รูปภาพ"}</span><div class="phs">${(b.photos || []).map((p, j) => img(p) ? `<figure><img src="${img(p)}" alt=""><button type="button" data-brm="${i}:${j}" aria-label="ลบภาพ">×</button></figure>` : "").join("") || `<span class="hint">ยังไม่มีภาพ</span>`}</div><label class="btn sm" style="justify-self:start;margin-top:6px">เพิ่มภาพ<input type="file" accept="image/*" ${single ? "" : "multiple"} data-bfile="${i}" hidden></label></div>`;
  let body = "";
  if (b.type === "heading") body = f("text", "ข้อความหัวข้อ") + `<label class="f">ขนาด<select data-bf="${i}:level"><option value="h2" ${b.level !== "h3" ? "selected" : ""}>หัวข้อใหญ่</option><option value="h3" ${b.level === "h3" ? "selected" : ""}>หัวข้อรอง</option></select></label>`;
  if (b.type === "text") body = f("text", "ข้อความ (ขึ้นบรรทัดใหม่ = ย่อหน้าใหม่)", "textarea");
  if (b.type === "button") body = f("label", "ข้อความบนปุ่ม", "text", 0) + f("url", "ลิงก์ (https://... หรือ #news)", "text", 0);
  if (b.type === "image") body = `<div class="f wide"><span>รูปแบบการจัดภาพ</span><div class="lay">${LAYOUTS.map(([k, t, ic]) => `<label><input type="radio" name="lay-${i}" value="${k}" data-bf="${i}:layout" ${(b.layout || "grid") === k ? "checked" : ""}><b>${ic}</b>${t}</label>`).join("")}</div></div>` + photos(false) + f("caption", "คำบรรยายใต้ภาพ (ไม่ใส่ก็ได้)");
  if (b.type === "imgtext") body = photos(true) + `<label class="f">ตำแหน่งภาพ<select data-bf="${i}:side"><option value="left" ${b.side !== "right" ? "selected" : ""}>ภาพซ้าย ข้อความขวา</option><option value="right" ${b.side === "right" ? "selected" : ""}>ภาพขวา ข้อความซ้าย</option></select></label>` + f("heading", "หัวข้อ") + f("text", "ข้อความ", "textarea") + f("caption", "คำบรรยายใต้ภาพ");
  if (b.type === "divider") body = `<p class="hint wide" style="margin:0">เส้นคั่นระหว่างส่วน</p>`;
  return `<div class="blk"><div class="blk-hd"><b>${i + 1}. ${BLK[b.type]}</b><span><button class="btn sm" data-bmv="${i}:-1" ${i === 0 ? "disabled" : ""} aria-label="เลื่อนขึ้น">↑</button> <button class="btn sm" data-bmv="${i}:1" ${i === n - 1 ? "disabled" : ""} aria-label="เลื่อนลง">↓</button> <button class="btn sm danger" data-bdel="${i}">ลบ</button></span></div><div class="form">${body}</div></div>`;
}
function pagesAdmin() {
  if (!pg) {
    const ps = pagesList();
    return `<div class="sh" style="margin-bottom:10px"><h2>หน้าและเนื้อหา</h2></div>
      <p class="hint" style="margin:0 0 12px">สร้างหน้าใหม่ได้เอง แบบ Google Sites แต่ละหน้าประกอบด้วยบล็อก หัวข้อ ข้อความ รูปภาพ (เลือกการจัดภาพได้ 7 แบบ) รูปคู่ข้อความ ปุ่มลิงก์ และเส้นคั่น เลือกให้หน้าขึ้นในเมนู หรือแสดงเป็นส่วนหนึ่งของหน้าแรกได้</p>
      <ul class="rowlist">${ps.length ? ps.map(p => `<li><span><b>${esc(p.title)}</b><div class="meta">${(p.blocks || []).length} บล็อก${p.inMenu ? " · อยู่ในเมนู" : ""}${p.onHome ? " · แสดงบนหน้าแรก" : ""}</div></span><span><a class="btn sm" href="#p-${esc(p.id)}">ดู</a> <button class="btn sm" data-pgedit="${esc(p.id)}">แก้ไข</button> <button class="btn sm" data-pgdel="${esc(p.id)}">ลบ</button></span></li>`).join("") : `<li><span class="meta">ยังไม่มีหน้า</span></li>`}</ul>
      <form class="form" id="pgNewF"><label class="f">ชื่อหน้าใหม่<input id="pgNewT" placeholder="เช่น ห้องพระและลานธรรม, ค่ายปฏิบัติธรรม 2569" required></label><div><button class="btn pri" type="submit">+ สร้างหน้า</button></div></form>`;
  }
  return `<div class="sh" style="margin-bottom:10px"><h2>แก้ไขหน้า</h2><button class="btn sm" data-pgback>← รายการหน้า</button></div>
    <div class="panel" style="margin-bottom:14px"><div class="form">
      <label class="f wide">ชื่อหน้า<input data-pf="title" value="${esc(pg.title)}"></label>
      <label class="f wide">คำอธิบายใต้ชื่อหน้า<input data-pf="sub" value="${esc(pg.sub || "")}"></label>
      <label class="f"><span><input type="checkbox" data-pf="inMenu" ${pg.inMenu ? "checked" : ""}> แสดงในเมนู "หน้าเพิ่มเติม"</span></label>
      <label class="f"><span><input type="checkbox" data-pf="onHome" ${pg.onHome ? "checked" : ""}> แสดงเป็นส่วนหนึ่งของหน้าแรก</span></label>
    </div></div>
    <div id="blkList">${(pg.blocks || []).map((b, i, a) => blockEditor(b, i, a.length)).join("") || `<div class="empty">ยังไม่มีบล็อก กดปุ่มด้านล่างเพื่อเพิ่ม</div>`}</div>
    <div class="addbar"><span class="hint">เพิ่มบล็อก:</span>${Object.entries(BLK).map(([k, t]) => `<button class="btn sm" data-addblk="${k}">+ ${t}</button>`).join("")}</div>
    <div style="display:flex;gap:8px;margin-top:16px"><button class="btn pri" data-pgsave>บันทึกหน้า</button><button class="btn" data-pgback>ยกเลิก</button></div>`;
}
function rePg() { const b = $("#admBody"); if (b) { b.innerHTML = admBody(); } }
document.addEventListener("input", e => {
  if (ROUTE !== "#admin" || admTab !== "pages" || !pg) return;
  const t = e.target;
  if (t.dataset.pf) pg[t.dataset.pf] = t.type === "checkbox" ? t.checked : t.value;
  if (t.dataset.bf) { const [i, k] = t.dataset.bf.split(":"); pg.blocks[+i][k] = t.value; }
});
document.addEventListener("change", async e => {
  if (ROUTE !== "#admin" || admTab !== "pages" || !pg) return;
  const t = e.target;
  if (t.dataset.pf && t.type === "checkbox") pg[t.dataset.pf] = t.checked;
  if (t.dataset.bf) { const [i, k] = t.dataset.bf.split(":"); pg.blocks[+i][k] = t.value; }
  if (t.dataset.bfile !== undefined) {
    const blk = pg.blocks[+t.dataset.bfile]; blk.photos = blk.photos || [];
    for (const f of [...t.files]) { try { const d = await compress(f); const id = "i" + uid(); S.img = S.img || {}; S.img[id] = d; blk.photos.push(id); } catch { toast("อ่านภาพไม่ได้: " + f.name); } }
    rePg();
  }
});
document.addEventListener("submit", e => {
  if (e.target.id !== "pgNewF") return; e.preventDefault();
  const t = $("#pgNewT").value.trim(); if (!t) return;
  pg = { id: "pg" + uid(), title: t, sub: "", inMenu: true, onHome: false, blocks: [{ type: "heading", text: t, level: "h2" }, { type: "text", text: "" }] };
  rePg();
}, true);
document.addEventListener("click", e => {
  if (ROUTE !== "#admin" || admTab !== "pages") return;
  const t = e.target;
  const ed = t.closest("[data-pgedit]"); if (ed) { pg = JSON.parse(JSON.stringify(pagesList().find(p => p.id === ed.dataset.pgedit))); rePg(); return; }
  const dl = t.closest("[data-pgdel]"); if (dl) {
    if (dl.dataset.armed) { S.pages = pagesList().filter(p => p.id !== dl.dataset.pgdel); markDirty(); shell(); render(); toast("ลบหน้าแล้ว อย่าลืมกดเผยแพร่"); }
    else { dl.dataset.armed = 1; dl.textContent = "ยืนยันลบ"; dl.classList.add("danger"); }
    return;
  }
  if (!pg) return;
  if (t.closest("[data-pgback]")) { pg = null; rePg(); return; }
  const ad = t.closest("[data-addblk]"); if (ad) { const k = ad.dataset.addblk; pg.blocks.push(k === "image" ? { type: k, layout: "grid", photos: [] } : k === "imgtext" ? { type: k, side: "left", photos: [] } : k === "heading" ? { type: k, level: "h2", text: "" } : { type: k }); rePg(); $("#blkList").lastElementChild?.scrollIntoView({ block: "center" }); return; }
  const mv = t.closest("[data-bmv]"); if (mv) { const [i, d] = mv.dataset.bmv.split(":").map(Number); const j = i + d; [pg.blocks[i], pg.blocks[j]] = [pg.blocks[j], pg.blocks[i]]; rePg(); return; }
  const bd = t.closest("[data-bdel]"); if (bd) { if (bd.dataset.armed) { pg.blocks.splice(+bd.dataset.bdel, 1); rePg(); } else { bd.dataset.armed = 1; bd.textContent = "ยืนยันลบ"; } return; }
  const rm = t.closest("[data-brm]"); if (rm) { const [i, j] = rm.dataset.brm.split(":").map(Number); pg.blocks[i].photos.splice(j, 1); rePg(); return; }
  if (t.closest("[data-pgsave]")) {
    if (!pg.title.trim()) return toast("ใส่ชื่อหน้าก่อน");
    S.pages = pagesList(); const i = S.pages.findIndex(p => p.id === pg.id);
    if (i >= 0) S.pages[i] = pg; else S.pages.push(pg);
    const id = pg.id; pg = null; markDirty(); shell(); render(); toast("บันทึกหน้าแล้ว อย่าลืมกดเผยแพร่"); return;
  }
});

/* ---------- admin events ---------- */
function upsert(coll, obj) {
  S[coll] = S[coll] || [];
  const i = S[coll].findIndex(x => x.id === obj.id);
  if (i >= 0) S[coll][i] = obj; else S[coll].push(obj);
}
document.addEventListener("click", e => {
  const t = e.target;
  if (t.closest("[data-zoom]")) { openLightbox(t.closest("[data-zoom]")); return; }
  const cp = t.closest("[data-copy]"); if (cp) { const v = cp.dataset.copy; navigator.clipboard?.writeText(v).then(() => toast("คัดลอกแล้ว"), () => toast(v)); return; }
  const cf = t.closest("#catF button"); if (cf) { newsCat = cf.dataset.c; render(); return; }
  if (t.closest("#clrQ")) { e.preventDefault(); searchQ = ""; const si = $("#searchIn"); if (si) si.value = ""; render(); return; }
  if (ROUTE !== "#admin") return;
  const tab = t.closest("[data-tab]"); if (tab) { admTab = tab.dataset.tab; editId = null; render(); return; }
  if (t.closest("[data-new]")) { editId = null; render(); return; }
  const ed = t.closest("[data-edit]"); if (ed) { editId = ed.dataset.edit; render(); return; }
  const dl = t.closest("[data-del]"); if (dl) {
    if (dl.dataset.armed) { S[COLL[admTab]] = (S[COLL[admTab]] || []).filter(x => x.id !== dl.dataset.del); if (editId === dl.dataset.del) editId = null; markDirty(); render(); toast("ลบแล้ว อย่าลืมกดเผยแพร่"); }
    else { dl.dataset.armed = 1; dl.textContent = "ยืนยันลบ"; dl.classList.add("danger"); setTimeout(() => { if (dl.isConnected) { delete dl.dataset.armed; dl.textContent = "ลบ"; dl.classList.remove("danger"); } }, 4000); }
    return;
  }
  if (t.closest("[data-rmpdf]")) { pendingPdf = null; const b = $("#pdfInfo"); if (b) b.innerHTML = pdfInfoHTML(); return; }
  if (t.closest("#popPreview")) { const f = $("#popForm"); if (f) showPop(true, readPop(f)); return; }
  if (t.closest("#popImgRm")) { pendingPop = ""; const b = $("#popPrev"); if (b) b.innerHTML = `<span class="hint">ยังไม่มีภาพ</span>`; return; }
  if (t.closest("#menuReset")) { S.menu = []; markDirty(); shell(); render(); toast("คืนเมนูเริ่มต้นแล้ว"); return; }
  if (t.closest("[data-rmpt]")) { pendingT = ""; paintPhotos(); return; }
  const rm = t.closest("[data-rmph]"); if (rm) { pending.splice(+rm.dataset.rmph, 1); paintPhotos(); return; }
  const cur = t.closest("[data-cur]"); if (cur) { S.year = cur.dataset.cur; viewYear = S.year; markDirty(); render(); return; }
});
document.addEventListener("change", async e => {
  const t = e.target;
  if (t.id === "phIn") { await addPhotos([...t.files]); t.value = ""; }
  if (t.id === "phtIn") { const fl = t.files[0]; t.value = ""; if (!fl) return; try { const d = await compress(fl); const id = "i" + uid(); S.img = S.img || {}; S.img[id] = d; pendingT = id; paintPhotos(); } catch { toast("อ่านภาพไม่ได้"); } }
  if (t.id === "indSel") { editId = t.value; render(); }
  if (t.id === "popImgIn") { const fl = t.files[0]; t.value = ""; if (!fl) return; try { const d = await compress(fl); const id = "i" + uid(); S.img[id] = d; pendingPop = id; const b = $("#popPrev"); if (b) b.innerHTML = `<img src="${d}" alt="" style="width:auto;height:110px">`; } catch { toast("อ่านภาพไม่ได้"); } }
  if (t.id === "pdfIn") { const fl = t.files[0]; t.value = ""; if (!fl) return; if (fl.size > 20 * 1048576) return toast("ไฟล์ใหญ่เกิน 20 MB");
    const box = $("#pdfInfo"); if (box) box.innerHTML = `<span class="hint">กำลังอัปโหลด ${esc(fl.name)}…</span>`;
    try { const r = await assetsApi.upload(fl); let pages = 0; try { const lib = await loadPdf(); pages = (await lib.getDocument(r.url || "/_blob/" + r.id).promise).numPages; } catch {}
      pendingPdf = { id: r.id, name: fl.name, size: fl.size, pages }; toast("อัปโหลดแล้ว กดบันทึก แล้วเผยแพร่"); }
    catch (er) { toast("อัปโหลดไม่สำเร็จ" + (er?.code ? " (" + er.code + ")" : "")); }
    const b2 = $("#pdfInfo"); if (b2) b2.innerHTML = pdfInfoHTML(); }
  if (t.id === "logoIn" || t.id === "logo2In" || t.id === "dirIn") { const f = t.files[0]; if (!f) return; const d = await compress(f, t.id !== "dirIn"); const id = "i" + uid(); S.img[id] = d; if (t.id === "logoIn") S.school.logo = id; else if (t.id === "logo2In") S.school.logo2 = id; else S.school.director = { ...(S.school.director || {}), photo: id }; markDirty(); shell(); render(); }
});
document.addEventListener("submit", e => {
  const f = e.target; if (ROUTE !== "#admin") return; e.preventDefault();
  if (f.id === "admForm") {
    const coll = COLL[admTab], old = editId ? (S[coll] || []).find(x => x.id === editId) : null;
    const o = readFields(f, SPECS[admTab], old || { id: uid(), year: viewYear });
    if (!(o.title || o.name || o.topic)) return toast("ใส่ชื่อหรือหัวข้อก่อน");
    if (coll === "videos" && !vidInfo(o.url)) return toast("ลิงก์วิดีโอไม่ถูกต้อง ใช้ลิงก์ YouTube, Facebook, Google Drive, TikTok หรือ Vimeo");
    if (o.video && !vidInfo(o.video) && coll !== "posts") return toast("ลิงก์วิดีโอไม่ถูกต้อง ใช้ลิงก์ YouTube, Facebook, Google Drive, TikTok หรือ Vimeo");
    if (coll === "posts" && o.video && !vidInfo(o.video)) return toast("ลิงก์วิดีโอไม่ถูกต้อง ใช้ลิงก์ YouTube, Facebook, Google Drive, TikTok หรือ Vimeo");
    if (coll === "people") delete o.year;
    upsert(coll, o); editId = o.id; markDirty(); render(); toast("บันทึกแล้ว อย่าลืมกดเผยแพร่");
  }
  if (f.id === "indForm") {
    const id = $("#indSel").value, q = k => f.querySelector(`[data-k="${k}"]`).value;
    S.ind = S.ind || {};
    S.ind[id] = { ...(S.ind[id] || {}), level: q("level"), text: q("text").trim(), links: q("links").split("\n").map(l => l.split("|").map(x => x.trim())).filter(a => a.length > 1 && a[1]).map(([t, u]) => ({ t, u })), photos: [...pending] };
    editId = id; markDirty(); render(); toast(`บันทึกข้อ ${id} แล้ว`);
  }
  if (f.id === "bpForm") {
    const q = k => f.querySelector(`[data-k="${k}"]`).value.trim();
    S.bp = { title: q("title"), dhamma: q("dhamma"), owner: q("owner"), award: q("award"), doc: q("doc"), problem: q("problem"),
      steps: q("steps").split("\n").filter(Boolean).map(l => { const [title, truth, detail] = l.split("|").map(x => (x || "").trim()); return { title, truth, detail }; }),
      results: q("results").split("\n").filter(Boolean).map(l => { const [label, value] = l.split("|").map(x => (x || "").trim()); return { label, value }; }), photos: [...pending] };
    markDirty(); render(); toast("บันทึกแล้ว");
  }
  if (f.id === "scForm") {
    const q = k => { const el = f.querySelector(`[data-k="${k}"]`); return el.type === "checkbox" ? el.checked : el.value.trim(); };
    const lines = k => q(k).split("\n").map(x => x.trim()).filter(Boolean);
    S.school = { ...S.school, name: q("name"), nameEn: q("nameEn"), areaFull: q("areaFull"), line: q("line"), mourning: q("mourning"), area: q("area"), code: q("code"), address: q("address"), phone: q("phone"), email: q("email"), facebook: q("facebook"), map: q("map"), motto: q("motto"), intro: q("intro"), virtues: lines("virtues"), history: q("history"), vision: q("vision"), mission: lines("mission"), coordinator: q("coordinator"), monk: q("monk"), selfScore: q("selfScore"), showLevels: q("showLevels"),
      hero: [...pending], director: { ...(S.school.director || {}), name: q("dname"), message: q("dmsg") }, stats: { students: q("students"), teachers: q("teachers"), classes: q("classes"), founded: q("founded") } };
    markDirty(); shell(); render(); toast("บันทึกข้อมูลโรงเรียนแล้ว");
  }
  if (f.id === "popForm") {
    S.popup = readPop(f); markDirty(); render(); toast("บันทึกแล้ว อย่าลืมกดเผยแพร่");
  }
  if (f.id === "menuForm") {
    const m = parseMenu(f.querySelector('[data-k="menu"]').value); if (!m.length) return toast("ต้องมีอย่างน้อย 1 เมนู");
    S.menu = m; markDirty(); shell(); render(); toast("บันทึกเมนูแล้ว อย่าลืมกดเผยแพร่");
  }
  if (f.id === "sideForm") {
    S.eservice = f.querySelector('[data-k="es"]').value.split("\n").map(l => l.split("|").map(x => x.trim())).filter(a => a[0]).map(([t, u]) => ({ t, u: u || "" }));
    markDirty(); render(); toast("บันทึกเมนูแล้ว");
  }
  if (f.id === "yrForm") {
    const y = $("#yrNew").value.trim(); if (!/^25\d\d$/.test(y)) return toast("ใส่ปี พ.ศ. 4 หลัก เช่น 2570");
    if (S.years.includes(y)) return toast("มีปีนี้อยู่แล้ว");
    S.indArchive = S.indArchive || {}; S.indArchive[S.year] = S.ind;
    S.ind = $("#yrCopy").checked ? Object.fromEntries(Object.entries(S.ind || {}).map(([k, v]) => [k, { text: v.text || "", links: [], photos: [], level: "" }])) : {};
    S.years.push(y); S.year = y; viewYear = y; markDirty(); render(); toast(`เริ่มปีการศึกษา ${y} แล้ว`);
  }
});

/* ---------- publish (Firebase) ---------- */
function usedIds() {
  const used = new Set();
  const walk = v => { if (typeof v === "string" && (S.img?.[v] || IMG[v] || (S.imgIds || []).includes(v))) used.add(v); else if (Array.isArray(v)) v.forEach(walk); else if (v && typeof v === "object") Object.entries(v).forEach(([k, x]) => k !== "img" && k !== "imgIds" && walk(x)); };
  walk(S); return used;
}
async function publishNow() {
  const used = usedIds();
  const fresh = Object.keys(S.img || {}).filter(k => used.has(k) && !IMG[k]);
  for (const k of fresh) { await Store.saveImage(k, S.img[k]); IMG[k] = S.img[k]; }
  const old = new Set(S.imgIds || []);
  const gone = [...old].filter(k => !used.has(k));
  const doc = JSON.parse(JSON.stringify({ ...S, img: undefined, imgIds: [...used] })); delete doc.img;
  await Store.saveSite(doc);
  await Store.deleteImages(gone);
  S.img = {}; S.imgIds = [...used];
  SAVED = JSON.stringify(doc); BASE = hash(SAVED); dirty = false; ls.set(DRAFT_KEY, null);
}
const sizeMB = () => (JSON.stringify({ ...S, img: undefined }).length / 1048576);
function renderSaveBar() {
  const bar = $("#savebar"); if (!bar) return;
  if (!canEdit || !dirty) { bar.innerHTML = ""; return; }
  const mb = sizeMB();
  bar.innerHTML = `<div class="savebar"><div class="wrap"><span>มีการแก้ไขที่ยังไม่เผยแพร่ <span class="meter">· ข้อมูลข้อความ ${(mb * 1024).toFixed(0)} / 1000 KB${FIRST ? " · ครั้งแรก: กดเผยแพร่เพื่อย้ายข้อมูลทั้งหมดขึ้น Firebase" : ""}</span></span><span style="display:flex;gap:8px"><button class="btn sm" id="discard">ยกเลิกการแก้ไข</button><button class="btn gold sm" id="publish">เผยแพร่ขึ้นเว็บไซต์</button></span></div></div>`;
  $("#discard").onclick = () => { if ($("#discard").dataset.armed) { ls.set(DRAFT_KEY, null); S = JSON.parse(SAVED); S.img = FIRST ? S.img : {}; dirty = FIRST && canEdit; viewYear = S.year; shell(); render(); } else { $("#discard").dataset.armed = 1; $("#discard").textContent = "ยืนยันยกเลิก"; } };
  $("#publish").onclick = async () => {
    const b = $("#publish"); b.disabled = true; b.textContent = "กำลังเผยแพร่…";
    try { await publishNow(); renderSaveBar(); toast("เผยแพร่แล้ว ทุกคนเห็นข้อมูลใหม่ทันที"); }
    catch (err) {
      b.disabled = false; b.textContent = "เผยแพร่ขึ้นเว็บไซต์";
      const m = { "permission-denied": "บัญชีนี้ไม่มีสิทธิ์บันทึก ตรวจกฎ Firestore และอีเมลผู้ดูแล", conflict: "มีคนเผยแพร่ก่อนหน้า ร่างของคุณยังเก็บไว้ในเครื่องนี้ เปิดหน้าใหม่แล้วกดใช้ร่าง", too_large: "ข้อมูลใหญ่เกินไป ลบภาพบางส่วนแล้วลองใหม่", not_writer: "บัญชีนี้ไม่มีสิทธิ์แก้ไขเว็บไซต์", not_granted: "ยังไม่ได้อนุญาตให้หน้าเว็บบันทึก" };
      console.error(err); toast(m[err?.code] || "เผยแพร่ไม่สำเร็จ ตรวจอินเทอร์เน็ตแล้วลองอีกครั้ง");
    }
  };
}

/* ---------- router ---------- */
const sideOpen = new Set();
function sideList(items, cur) {
  return `<ul>${items.map(it => {
    const [k, t, sub, cat] = it;
    if (sub) { const id = "sm-" + t; const open = sideOpen.has(id); return `<li><button class="sm-toggle" type="button" data-sm="${esc(id)}" aria-expanded="${open}">${esc(t)}<i class="chev"></i></button>${open ? `<div class="sub">${sub.map(([k2, t2, c2]) => `<a href="#${k2}"${c2 !== undefined ? ` data-cat="${esc(c2)}"` : ""}>${esc(t2)}</a>`).join("")}</div>` : ""}</li>`; }
    return `<li><a href="#${k}"${cat !== undefined ? ` data-cat="${esc(cat)}"` : ""} ${k === cur && cat === undefined ? 'aria-current="page"' : ""}>${esc(t)}</a></li>`;
  }).join("")}</ul>`;
}
function sidebar(cur) {
  const up = (S.events || []).filter(e => (e.end || e.date) >= today()).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 4);
  const es = (S.eservice || []).filter(l => l.t);
  const card = (title, body) => `<section class="side-card"><h3>${esc(title)}</h3>${body}</section>`;
  return card("วิถีพุทธ", sideList([
      ["way", "อัตลักษณ์ 29 ประการ"],
      ["bp", "Best Practice"],
      ["projects", "โครงงานคุณธรรม"],
      ["plans", "แผนการจัดการเรียนรู้"],
      ["innov", "นวัตกรรม"],
      ["", "ธรรมะประจำสัปดาห์", [["dhamma", "เด็กดีมีธรรมะ"], ["dhamma", "5 นาที มีปัญญา"]]],
      ["", "ข่าวและภาพกิจกรรม", [["news", "ข่าวทั้งหมด", ""], ...CATS.map(c => ["news", c, c])]],
      ["videos", "วิดีโอกิจกรรม"],
      ["docs", "เอกสารเผยแพร่"],
    ], cur))
    + (es.length ? card("E-Service", `<ul>${es.map(l => safeUrl(l.u) ? `<li><a href="${esc(l.u)}" target="_blank" rel="noopener">${esc(l.t)}</a></li>` : `<li><a>${esc(l.t)}</a></li>`).join("")}</ul>`) : "")
    + (pagesList().some(p => p.inMenu) ? card("หน้าเพิ่มเติม", sideList(pagesList().filter(p => p.inMenu).map(p => ["p-" + p.id, p.title]), cur)) : "")
    + card("ข้อมูลโรงเรียน", sideList([["about", "ประวัติและวิสัยทัศน์"], ["people", "ผู้บริหารและบุคลากร"], ["contact", "ติดต่อโรงเรียน"]], cur))
    + (up.length ? card("กิจกรรมที่จะมาถึง", `<div class="mini-ev">${up.map(e => { const [y, m, d] = e.date.split("-").map(Number); return `<div><span class="datebox"><b>${d}</b><span>${TH_M[m - 1]}</span></span><span>${esc(e.title)}</span></div>`; }).join("")}</div>`) : "");
}
document.addEventListener("click", e => {
  const b = e.target.closest("[data-sm]"); if (b) { const id = b.dataset.sm; sideOpen.has(id) ? sideOpen.delete(id) : sideOpen.add(id); const as = b.closest("aside"); as.innerHTML = sidebar((ROUTE.slice(1) || "home").replace(/^post-.*/, "news")); thaify(as); return; }
  const a = e.target.closest("aside a[data-cat]"); if (a) { newsCat = a.dataset.cat; searchQ = ""; if (ROUTE === "#news") render(); }
});
let revealObs = null, cdTimer = null;
let slideTimer = null;
function wireSlider() {
  clearInterval(slideTimer);
  const sl = $("#slider"); if (!sl) return;
  const slides = [...sl.querySelectorAll(".slide")], dots = [...sl.querySelectorAll("[data-sl]")];
  if (slides.length < 2) return;
  let i = 0;
  const go = n => { i = (n + slides.length) % slides.length; slides.forEach((s, k) => s.classList.toggle("on", k === i)); dots.forEach((d, k) => d.setAttribute("aria-pressed", k === i)); };
  dots.forEach(d => d.onclick = e => { e.preventDefault(); go(+d.dataset.sl); clearInterval(slideTimer); slideTimer = setInterval(() => go(i + 1), 6000); });
  if (!matchMedia("(prefers-reduced-motion: reduce)").matches) slideTimer = setInterval(() => go(i + 1), 6000);
}
let rotTimer = null;
function startRotators() {
  clearInterval(rotTimer);
  const cards = [...document.querySelectorAll(".ind-ph[data-gal]")].filter(c => c.querySelectorAll("img").length > 1);
  if (!cards.length || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  cards.forEach((c, k) => { c.dataset.k = k; c.onmouseenter = () => c.dataset.pause = 1; c.onmouseleave = () => delete c.dataset.pause; });
  let tick = 0;
  rotTimer = setInterval(() => {
    tick++;
    cards.forEach((c, k) => {
      if (c.dataset.pause || (tick + k) % 2) return;
      const r = c.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return;
      const ims = [...c.querySelectorAll("img")], ds = [...c.querySelectorAll(".dots i")];
      const i = ims.findIndex(x => x.classList.contains("on")), j = (i + 1) % ims.length;
      ims[i].classList.remove("on"); ims[j].classList.add("on"); ds.forEach((d, n) => d.classList.toggle("on", n === j));
    });
  }, 2200);
}
function afterRender() {
  startRotators();
  const els = document.querySelectorAll("#view .reveal");
  if (!("IntersectionObserver" in window) || matchMedia("(prefers-reduced-motion: reduce)").matches) { els.forEach(x => x.classList.add("in")); }
  else {
    revealObs?.disconnect();
    revealObs = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add("in"); countUp(en.target); revealObs.unobserve(en.target); } }), { threshold: .1 });
    els.forEach(x => { const r = x.getBoundingClientRect(); if (r.top < innerHeight) { x.classList.add("in"); countUp(x); } else revealObs.observe(x); });
  }
  wireSlider();
  const bar = $("#scBar"); if (bar) setTimeout(() => bar.style.width = bar.dataset.w, 150);
  clearInterval(cdTimer);
  const cd = $("#cd");
  if (cd) {
    const target = new Date(cd.dataset.t + ":00+07:00").getTime();
    const tick = () => {
      const s = Math.max(0, Math.floor((target - Date.now()) / 1000));
      if (!s) { clearInterval(cdTimer); cd.innerHTML = `<div class="cd-now">ถึงเวลาแล้ว</div>`; return; }
      const v = [Math.floor(s / 86400), Math.floor(s % 86400 / 3600), Math.floor(s % 3600 / 60), s % 60];
      cd.querySelectorAll("b").forEach((b, i) => b.textContent = thNum(String(v[i]).padStart(2, "0")));
    };
    tick(); cdTimer = setInterval(tick, 1000);
  }
}
function countUp(el) {
  el.querySelectorAll("[data-count]").forEach(b => {
    const end = +b.dataset.count; if (!end) return; const t0 = performance.now();
    const step = t => { const k = Math.min(1, (t - t0) / 1300); b.textContent = thNum(num(Math.round(end * (1 - Math.pow(1 - k, 3))))); if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  });
}
function render() {
  const h = ROUTE.slice(1) || "home";
  const [v, ...rest] = h.split("-");
  const isWeb = h.startsWith("web:");
  const key = isWeb ? "web" : v === "post" ? "post" : v === "p" && rest.length ? "page" : (V[h] && h !== "page" && h !== "web" ? h : "home");
  const html = isWeb ? V.web((() => { try { return decodeURIComponent(h.slice(4)); } catch { return ""; } })()) : key === "post" ? V.post(rest.join("-")) : key === "page" ? V.page(rest.join("-")) : V[key]();
  const cut = html.indexOf("<!--SPLIT-->");
  $("#view").innerHTML = key === "admin" || key === "home" || key === "people" || key === "web" || cut < 0 ? html : html.slice(0, cut) + `<div class="wrap layout"><div class="content">${html.slice(cut)}</div><aside class="side" aria-label="เมนูด้านข้าง">${sidebar(key === "post" ? "news" : key === "page" ? h : key)}</aside></div>`;
  const curKey = key === "post" ? "news" : key;
  document.querySelectorAll("nav.main a").forEach(a => a.setAttribute("aria-current", a.getAttribute("href") === "#" + curKey && (!a.dataset.cat || a.dataset.cat === newsCat) && !(a.dataset.cat === undefined && a.closest(".dd") && curKey === "news" && newsCat) ? "page" : "false"));
  document.querySelectorAll(".dd").forEach(d => d.classList.toggle("cur", !!d.querySelector('a[aria-current="page"]')));
  closeMenus();
  ["wayYear", "pjYear", "dhYear", "nwYear", "dcYear", "vdYear", "plYear", "inYear", "admYear"].forEach(bindYear);
  if (key === "admin") paintPhotos();
  $("#mainNav")?.classList.remove("open");
  afterRender();
  paintCovers();
  applyGray();
  if (!popTried && key === "home") { popTried = true; setTimeout(() => showPop(false), 500); }
  thaify($("#app"));
  justifyAll();
}
document.addEventListener("mouseover", e => { if (innerWidth > 1000 && !e.target.closest("nav.main") && document.querySelector(".dd.open")) closeMenus(); });
addEventListener("hashchange", () => { const h = location.hash || "#home"; if (h === ROUTE) return; if ($(".dv")) closeDoc(); if ($(".vp")) closeVid(); ROUTE = h; render(); scrollTo(0, 0); });
document.addEventListener("click", e => {
  const a = e.target.closest('a[href^="#"]'); if (!a || e.button || e.metaKey || e.ctrlKey) return;
  const h = a.getAttribute("href"); if (h.length < 2) return;
  e.preventDefault(); go(h);
}, true);

let curUser = null;
shell(); render();
/* รูปภาพ: ใช้สำเนาในเครื่องก่อน รูปที่ยังไม่มีค่อยโหลดจาก Firestore (1 เอกสารต่อ 1 รูป) */
let repT = null;
const repaint = () => { clearTimeout(repT); repT = setTimeout(() => { if (ROUTE !== "#admin") { shell(); render(); } }, 120); };
async function loadImgs() {
  const ids = (S.imgIds || []).filter(id => !IMG[id]); if (!ids.length) return;
  try { const have = await Store.cachedImages(ids); if (Object.keys(have).length) { Object.assign(IMG, have); repaint(); } } catch {}
  const miss = ids.filter(id => !IMG[id]);
  if (miss.length) await Store.loadImages(miss, (id, d) => { IMG[id] = d; repaint(); });
}
if (!FIRST) loadImgs().then(() => Store.pruneImages(S.imgIds || []));
/* เรียลไทม์: เมื่อมีการเผยแพร่ใหม่ ทุกเครื่องที่เปิดอยู่จะเห็นข้อมูลล่าสุดทันทีโดยไม่ต้องรีเฟรช */
if (!FIRST) Store.watchSite(json => {
  if (!json || json === SAVED) return;
  if (dirty) { toast("มีการเผยแพร่ฉบับใหม่จากอีกเครื่อง กดเผยแพร่ของเครื่องนี้จะทับฉบับนั้น"); return; }
  SAVED = json; BASE = hash(SAVED);
  const keepYear = viewYear;
  S = JSON.parse(json); S.img = {};
  viewYear = (S.years || []).includes(keepYear) && keepYear !== S.year ? keepYear : S.year;
  if (ROUTE !== "#admin") { shell(); render(); }
  loadImgs().then(() => Store.pruneImages(S.imgIds || []));
});
document.addEventListener("click", async e => {
  if (e.target.closest("#loginBtn")) { try { await Store.signIn(); } catch (er) { toast("เข้าสู่ระบบไม่สำเร็จ"); console.error(er); } }
  if (e.target.closest("#logoutBtn")) { await Store.signOut(); }
});
Store.onUser(u => {
  curUser = u; canEdit = Store.isAdmin(u);
  if (canEdit) {
    const d = ls.get(DRAFT_KEY, null);
    if (d && d.s && d.base === BASE && JSON.stringify(d.s) !== SAVED) { S = d.s; dirty = true; viewYear = S.year; toast("เปิดร่างที่ยังไม่เผยแพร่ต่อจากครั้งก่อน"); }
    else if (d && d.base !== BASE) { ls.set(DRAFT_KEY, null); toast("มีการเผยแพร่ฉบับใหม่แล้ว ร่างเก่าในเครื่องนี้ถูกล้าง"); }
    if (FIRST) dirty = true;
  } else dirty = false;
  shell(); render();
});
})();
