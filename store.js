// ชั้นข้อมูลของเว็บไซต์: อ่าน/เขียน Firebase (Firestore + Google Sign-in)
// site/main  = ข้อมูลทั้งเว็บ (เก็บเป็นข้อความ JSON)
// img/{id}   = รูปภาพ 1 รูปต่อ 1 เอกสาร (ย่อขนาดแล้ว)
//
// ความเร็ว: เก็บสำเนาข้อมูลและรูปไว้ในเครื่องผู้ชม (IndexedDB)
// เปิดครั้งถัดไปจะแสดงทันทีจากเครื่อง แล้วค่อยอัปเดตจาก Firebase แบบเรียลไทม์
import { firebaseConfig, ADMIN_EMAILS } from "./firebase-config.js";

const V = "10.12.2";
const GS = `https://www.gstatic.com/firebasejs/${V}`;
export const ready = !!(firebaseConfig && firebaseConfig.apiKey && firebaseConfig.projectId);

/* ---------- Firebase (โหลดแยก: ฐานข้อมูลก่อน ระบบล็อกอินทีหลัง) ---------- */
let appP = null, dbP = null, authP = null;
function app() {
  if (!appP) appP = import(`${GS}/firebase-app.js`).then(m => m.initializeApp(firebaseConfig));
  return appP;
}
function db() {
  if (!ready) return Promise.resolve(null);
  if (!dbP) dbP = Promise.all([app(), import(`${GS}/firebase-firestore.js`)]).then(([a, fs]) => ({ fs, db: fs.getFirestore(a) }));
  return dbP;
}
function auth() {
  if (!ready) return Promise.resolve(null);
  if (!authP) authP = Promise.all([app(), import(`${GS}/firebase-auth.js`)]).then(([a, au]) => ({ au, auth: au.getAuth(a) }));
  return authP;
}

/* ---------- สำเนาในเครื่อง (IndexedDB) ---------- */
let idbP = null;
function idb() {
  if (!idbP) idbP = new Promise(res => {
    try {
      const r = indexedDB.open("bangpoon-vitheebuddha", 1);
      r.onupgradeneeded = () => { r.result.createObjectStore("kv"); r.result.createObjectStore("img"); };
      r.onsuccess = () => res(r.result);
      r.onerror = () => res(null);
      r.onblocked = () => res(null);
    } catch { res(null); }
  });
  return idbP;
}
async function idbGet(store, key) {
  const d = await idb(); if (!d) return undefined;
  return new Promise(res => { try { const q = d.transaction(store).objectStore(store).get(key); q.onsuccess = () => res(q.result); q.onerror = () => res(undefined); } catch { res(undefined); } });
}
async function idbGetMany(store, keys) {
  const d = await idb(); const out = {}; if (!d || !keys.length) return out;
  return new Promise(res => {
    try {
      const tx = d.transaction(store); const os = tx.objectStore(store);
      keys.forEach(k => { const q = os.get(k); q.onsuccess = () => { if (q.result) out[k] = q.result; }; });
      tx.oncomplete = () => res(out); tx.onerror = () => res(out);
    } catch { res(out); }
  });
}
async function idbPut(store, key, val) {
  const d = await idb(); if (!d) return;
  try { d.transaction(store, "readwrite").objectStore(store).put(val, key); } catch {}
}
async function idbDel(store, keys) {
  const d = await idb(); if (!d || !keys.length) return;
  try { const os = d.transaction(store, "readwrite").objectStore(store); keys.forEach(k => os.delete(k)); } catch {}
}

export const isAdmin = u => !!u && u.emailVerified !== false && ADMIN_EMAILS.map(x => x.toLowerCase()).includes(String(u.email || "").toLowerCase());

/* ---------- ข้อมูลเว็บ ---------- */
// ข้อมูลล่าสุดที่เคยโหลดไว้ในเครื่องนี้ (ข้อความ JSON) — แสดงได้ทันทีไม่ต้องรอเน็ต
export async function cachedSite() {
  const s = await idbGet("kv", "site");
  return typeof s === "string" ? s : null;
}
/* อ่านแบบเบา (REST) — ไม่ต้องรอโหลดชุดคำสั่ง Firebase ทั้งก้อน หน้าเว็บจึงขึ้นเร็ว */
const DOCS = () => `projects/${firebaseConfig.projectId}/databases/(default)/documents`;
const REST = () => `https://firestore.googleapis.com/v1/${DOCS()}`;
async function restSite() {
  const r = await fetch(`${REST()}/site/main?key=${encodeURIComponent(firebaseConfig.apiKey)}`, { cache: "no-store" });
  if (r.status === 404) return { missing: true };
  if (!r.ok) throw new Error("rest " + r.status);
  const j = await r.json(); return { json: j.fields?.json?.stringValue ?? null };
}
async function restImages(ids, onEach) {
  const r = await fetch(`https://firestore.googleapis.com/v1/${DOCS()}:batchGet?key=${encodeURIComponent(firebaseConfig.apiKey)}`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ documents: ids.map(id => `${DOCS()}/img/${id}`) }),
  });
  if (!r.ok) throw new Error("rest " + r.status);
  const arr = await r.json(); const got = new Set();
  for (const x of arr) {
    const d = x.found?.fields?.d?.stringValue; if (!d) continue;
    const id = x.found.name.split("/").pop(); got.add(id); idbPut("img", id, d); onEach(id, d);
  }
  return got;
}
export async function loadSite() {
  if (!ready) return null;
  try {
    const r = await restSite();
    if (r.missing || !r.json) return null;
    idbPut("kv", "site", r.json); return JSON.parse(r.json);
  } catch (e) { console.warn("rest site, ใช้ SDK แทน", e); }
  const f = await db(); if (!f) return null;
  const s = await f.fs.getDoc(f.fs.doc(f.db, "site", "main"));
  if (!s.exists()) return null;
  const json = s.data().json; idbPut("kv", "site", json);
  return JSON.parse(json);
}
// ติดตามแบบเรียลไทม์: เมื่อแอดมินกดเผยแพร่ ทุกเครื่องที่เปิดอยู่ได้ข้อมูลใหม่ทันที
export function watchSite(cb) {
  let stop = () => {};
  db().then(f => {
    if (!f) return;
    stop = f.fs.onSnapshot(f.fs.doc(f.db, "site", "main"), s => {
      if (!s.exists()) { cb(null); return; }
      const json = s.data().json; idbPut("kv", "site", json); cb(json);
    }, e => console.warn("watch site", e));
  });
  return () => stop();
}
export async function saveSite(obj) {
  const f = await db(); if (!f) throw new Error("firebase-not-configured");
  const json = JSON.stringify(obj);
  await f.fs.setDoc(f.fs.doc(f.db, "site", "main"), { json, updated: f.fs.serverTimestamp() });
  idbPut("kv", "site", json);
}

/* ---------- รูปภาพ ---------- */
// รหัสรูปไม่ซ้ำเดิมทุกครั้งที่อัปโหลดใหม่ จึงเก็บสำเนาในเครื่องได้ตลอดโดยไม่ล้าสมัย
export async function cachedImages(ids) { return idbGetMany("img", [...new Set(ids)]); }
export async function loadImages(ids, onEach) {
  if (!ready) return;
  let q = [...new Set(ids)];
  // REST: ขอทีละ 4 รูปต่อคำขอ ส่งพร้อมกันหลายคำขอ
  try {
    const chunks = []; for (let i = 0; i < q.length; i += 4) chunks.push(q.slice(i, i + 4));
    const done = new Set();
    await Promise.all(chunks.map(c => restImages(c, onEach).then(g => g.forEach(x => done.add(x))).catch(e => console.warn("rest img", e))));
    q = q.filter(id => !done.has(id));
    if (!q.length) return;
  } catch {}
  const f = await db(); if (!f) return;
  let i = 0;
  const worker = async () => {
    while (i < q.length) {
      const id = q[i++];
      try { const s = await f.fs.getDoc(f.fs.doc(f.db, "img", id)); if (s.exists()) { const d = s.data().d; idbPut("img", id, d); onEach(id, d); } }
      catch (e) { console.warn("img", id, e); }
    }
  };
  await Promise.all(Array.from({ length: 8 }, worker));
}
export async function saveImage(id, dataUrl) {
  const f = await db(); if (!f) throw new Error("firebase-not-configured");
  if (dataUrl.length > 1000000) throw Object.assign(new Error("ภาพใหญ่เกิน 1 MB"), { code: "too_large" });
  await f.fs.setDoc(f.fs.doc(f.db, "img", id), { d: dataUrl });
  idbPut("img", id, dataUrl);
}
export async function deleteImages(ids) {
  const f = await db(); if (!f) return;
  await Promise.all(ids.map(id => f.fs.deleteDoc(f.fs.doc(f.db, "img", id)).catch(() => {})));
  idbDel("img", ids);
}
// ล้างรูปเก่าที่ไม่ได้ใช้แล้วออกจากเครื่องผู้ชม
export async function pruneImages(keep) {
  const d = await idb(); if (!d) return;
  const k = new Set(keep);
  try {
    const q = d.transaction("img").objectStore("img").getAllKeys();
    q.onsuccess = () => idbDel("img", q.result.filter(x => !k.has(x)));
  } catch {}
}

/* ---------- ล็อกอิน ---------- */
export async function signIn() {
  const f = await auth(); if (!f) throw new Error("firebase-not-configured");
  await f.au.signInWithPopup(f.auth, new f.au.GoogleAuthProvider());
}
export async function signOut() { const f = await auth(); if (f) await f.au.signOut(f.auth); }
export function onUser(cb) { auth().then(f => f ? f.au.onAuthStateChanged(f.auth, cb) : cb(null)).catch(() => cb(null)); }
