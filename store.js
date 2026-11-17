// ชั้นข้อมูลของเว็บไซต์: อ่าน/เขียน Firebase (Firestore + Google Sign-in)
// site/main  = ข้อมูลทั้งเว็บ (เก็บเป็นข้อความ JSON)
// img/{id}   = รูปภาพ 1 รูปต่อ 1 เอกสาร (ย่อขนาดแล้ว)
import { firebaseConfig, ADMIN_EMAILS } from "./firebase-config.js";

const V = "10.12.2";
export const ready = !!(firebaseConfig && firebaseConfig.apiKey && firebaseConfig.projectId);
let fb = null;
async function boot() {
  if (!ready) return null;
  if (fb) return fb;
  const [app, fs, au] = await Promise.all([
    import(`https://www.gstatic.com/firebasejs/${V}/firebase-app.js`),
    import(`https://www.gstatic.com/firebasejs/${V}/firebase-firestore.js`),
    import(`https://www.gstatic.com/firebasejs/${V}/firebase-auth.js`),
  ]);
  const a = app.initializeApp(firebaseConfig);
  fb = { fs, au, db: fs.getFirestore(a), auth: au.getAuth(a) };
  return fb;
}

export const isAdmin = u => !!u && u.emailVerified !== false && ADMIN_EMAILS.map(x => x.toLowerCase()).includes(String(u.email || "").toLowerCase());

export async function loadSite() {
  const f = await boot(); if (!f) return null;
  const s = await f.fs.getDoc(f.fs.doc(f.db, "site", "main"));
  return s.exists() ? JSON.parse(s.data().json) : null;
}
export async function saveSite(obj) {
  const f = await boot(); if (!f) throw new Error("firebase-not-configured");
  await f.fs.setDoc(f.fs.doc(f.db, "site", "main"), { json: JSON.stringify(obj), updated: f.fs.serverTimestamp() });
}
export async function loadImages(ids, onEach) {
  const f = await boot(); if (!f) return;
  const q = [...new Set(ids)]; let i = 0;
  const worker = async () => { while (i < q.length) { const id = q[i++]; try { const s = await f.fs.getDoc(f.fs.doc(f.db, "img", id)); if (s.exists()) onEach(id, s.data().d); } catch (e) { console.warn("img", id, e); } } };
  await Promise.all(Array.from({ length: 6 }, worker));
}
export async function saveImage(id, dataUrl) {
  const f = await boot(); if (!f) throw new Error("firebase-not-configured");
  if (dataUrl.length > 1000000) throw Object.assign(new Error("ภาพใหญ่เกิน 1 MB"), { code: "too_large" });
  await f.fs.setDoc(f.fs.doc(f.db, "img", id), { d: dataUrl });
}
export async function deleteImages(ids) {
  const f = await boot(); if (!f) return;
  await Promise.all(ids.map(id => f.fs.deleteDoc(f.fs.doc(f.db, "img", id)).catch(() => {})));
}
export async function signIn() {
  const f = await boot(); if (!f) throw new Error("firebase-not-configured");
  await f.au.signInWithPopup(f.auth, new f.au.GoogleAuthProvider());
}
export async function signOut() { const f = await boot(); if (f) await f.au.signOut(f.auth); }
export function onUser(cb) { boot().then(f => f ? f.au.onAuthStateChanged(f.auth, cb) : cb(null)); }
