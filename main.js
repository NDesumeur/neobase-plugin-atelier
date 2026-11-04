// Atelier (IDE) : le côté système du plugin, chargé par NeoDex une fois le plugin signé et l'accès complet accordé.
// Il ne sert qu'à exécuter du Python avec l'interpréteur installé sur le PC : le projet est écrit dans un dossier temporaire neuf,
// le script tourne sans fenêtre, 10 secondes au plus, avec une sortie limitée, puis le dossier est supprimé.
const { spawn, execFile } = require('child_process');
const fs = require('fs'), path = require('path'), os = require('os'), crypto = require('crypto');

const LIMIT_MS = 10000, LIMIT_OUT = 200000, LIMIT_FILES = 300, LIMIT_BYTES = 8e6;
let found = null;
const candidates = () => process.platform === 'win32' ? [['py', ['-3']], ['python', []], ['python3', []]] : [['python3', []], ['python', []]];
const probe = (cmd, pre) => new Promise(ok => execFile(cmd, [...pre, '--version'], { windowsHide: true, timeout: 4000 }, (e, so, se) => {
  const v = String(so || se || '').trim();   // Python 2 écrivait sur stderr; Microsoft Store répond sans version quand Python n'est pas installé
  ok(!e && /^Python 3\.\d+/.test(v) ? { cmd, pre, v } : null);
}));
async function detect() {
  if (found) return found;
  for (const [c, p] of candidates()) { const r = await probe(c, p); if (r) return (found = r); }
  return null;
}
const safeRel = p => { const n = path.posix.normalize(String(p).replace(/\\/g, '/')); return /^[\w.\- \/]+$/.test(n) && !n.startsWith('/') && !n.startsWith('..') && !n.includes('/../') ? n : null; };

async function pyinfo() {
  const d = await detect();
  return d ? { ok: true, v: d.v } : { ok: false, err: 'aucun Python 3 trouvé sur ce PC. Installe-le depuis python.org (coche « Add to PATH »), puis rouvre l\'Atelier.' };
}
async function python(data) {
  const d = await detect(); if (!d) throw new Error('Python 3 introuvable');
  const files = data && data.files || {}, names = Object.keys(files);
  if (!names.length || names.length > LIMIT_FILES) throw new Error('projet vide ou trop gros');
  const main = safeRel(data.main); if (!main || !(main in files) || !main.endsWith('.py')) throw new Error('fichier à exécuter invalide');
  let total = 0; for (const n of names) total += String(files[n]).length; if (total > LIMIT_BYTES) throw new Error('projet trop gros');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'neoatelier-' + crypto.randomBytes(3).toString('hex') + '-'));
  try {
    for (const n of names) { const rel = safeRel(n); if (!rel) continue; const full = path.join(dir, rel); if (!full.startsWith(dir + path.sep)) continue; fs.mkdirSync(path.dirname(full), { recursive: true }); fs.writeFileSync(full, String(files[n]), 'utf8'); }
    return await new Promise(ok => {
      let out = '', err = '', timeout = false, done = false;
      const ch = spawn(d.cmd, [...d.pre, '-u', '-X', 'utf8', main], { cwd: dir, windowsHide: true, env: { ...process.env, PYTHONIOENCODING: 'utf-8', PYTHONDONTWRITEBYTECODE: '1' }, stdio: ['ignore', 'pipe', 'pipe'] });
      const add = (s, c) => { const t = c.toString('utf8'); if (s === 'o') out = (out + t).slice(0, LIMIT_OUT); else err = (err + t).slice(0, LIMIT_OUT); };
      ch.stdout.on('data', c => add('o', c)); ch.stderr.on('data', c => add('e', c));
      const timer = setTimeout(() => { timeout = true; try { if (process.platform === 'win32') execFile('taskkill', ['/pid', String(ch.pid), '/T', '/F'], { windowsHide: true }, () => {}); else ch.kill('SIGKILL'); } catch {} }, LIMIT_MS);
      const end = code => { if (done) return; done = true; clearTimeout(timer); ok({ out, err, code: code == null ? -1 : code, timeout }); };
      ch.on('error', e => { err += e.message; end(-1); });
      ch.on('close', end);
    });
  } finally { try { fs.rmSync(dir, { recursive: true, force: true }); } catch {} }
}

module.exports = api => {
  api.ipcMain.handle('ide:pyinfo', () => pyinfo());
  api.ipcMain.handle('ide:python', (_, data) => python(data));
  return () => {};
};
module.exports._test = { pyinfo, python, safeRel };
