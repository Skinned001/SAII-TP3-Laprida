const express = require('express');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 3000;
const HOST = '0.0.0.0'; // acepta conexiones desde cualquier IP

// Almacenamiento en memoria: { [userId]: [{ id, nombre, edad, nota }, ...] }
const store = {};

app.use(express.json());

// ── Middleware: asignar/leer cookie de usuario ──────────────────────────────
app.use((req, res, next) => {
  let userId = req.cookies?.userId;

  // Parseo manual de cookies (sin dependencia cookie-parser)
  if (!userId) {
    const raw = req.headers.cookie || '';
    const match = raw.match(/(?:^|;\s*)userId=([^;]+)/);
    if (match) userId = match[1];
  }

  if (!userId) {
    userId = uuidv4();
    res.setHeader('Set-Cookie', `userId=${userId}; Path=/; HttpOnly; Max-Age=${60 * 60 * 24 * 365}`);
  }

  if (!store[userId]) store[userId] = [];

  req.userId = userId;
  next();
});

// ── GET /  →  sirve el HTML ─────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.send(buildHTML());
});

// ── GET /api/alumnos  →  devuelve los alumnos del usuario ──────────────────
app.get('/api/alumnos', (req, res) => {
  res.json(store[req.userId]);
});

// ── POST /api/alumnos  →  agrega un alumno ─────────────────────────────────
app.post('/api/alumnos', (req, res) => {
  const { nombre, edad, nota } = req.body;

  if (!nombre || typeof nombre !== 'string' || nombre.trim() === '') {
    return res.status(400).json({ error: 'Nombre inválido.' });
  }
  const edadN = parseInt(edad);
  if (isNaN(edadN) || edadN < 1 || edadN > 120) {
    return res.status(400).json({ error: 'Edad inválida.' });
  }
  const notaN = parseFloat(nota);
  if (isNaN(notaN) || notaN < 0 || notaN > 10) {
    return res.status(400).json({ error: 'Nota debe estar entre 0 y 10.' });
  }

  const alumno = { id: uuidv4(), nombre: nombre.trim(), edad: edadN, nota: notaN };
  store[req.userId].push(alumno);
  res.status(201).json(alumno);
});

// ── DELETE /api/alumnos/:id  →  elimina un alumno ──────────────────────────
app.delete('/api/alumnos/:id', (req, res) => {
  const lista = store[req.userId];
  const idx = lista.findIndex(a => a.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Alumno no encontrado.' });
  lista.splice(idx, 1);
  res.json({ ok: true });
});

// ── Arranque ────────────────────────────────────────────────────────────────
app.listen(PORT, HOST, () => {
  console.log(`\n✅  Servidor corriendo en http://0.0.0.0:${PORT}`);
  console.log(`   Accedé desde tu red con  http://<tu-IP>:${PORT}\n`);
});

// ── HTML inline ─────────────────────────────────────────────────────────────
function buildHTML() {
  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Registro de Alumnos</title>
<link href="https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #f5f2eb; --surface: #ffffff; --border: #d6cfc0;
    --text: #1a1714; --text-muted: #7a7166;
    --accent: #c0392b; --accent-light: #f9eceb;
    --row-alt: #faf8f4; --radius: 4px; --shadow: 0 1px 4px rgba(0,0,0,0.08);
  }
  body { font-family: 'Sora', sans-serif; background: var(--bg); color: var(--text); min-height: 100vh; padding: 40px 20px 60px; }
  header { max-width: 720px; margin: 0 auto 36px; border-bottom: 2px solid var(--text); padding-bottom: 16px; display: flex; align-items: baseline; gap: 12px; }
  header h1 { font-family: 'Space Mono', monospace; font-size: 1.35rem; font-weight: 700; letter-spacing: -0.5px; }
  header span { font-size: 0.78rem; color: var(--text-muted); font-weight: 300; }
  .card { max-width: 720px; margin: 0 auto 28px; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); box-shadow: var(--shadow); padding: 24px 28px; }
  .card h2 { font-family: 'Space Mono', monospace; font-size: 0.72rem; text-transform: uppercase; letter-spacing: 2px; color: var(--text-muted); margin-bottom: 20px; }
  .form-row { display: grid; grid-template-columns: 2fr 1fr 1fr auto; gap: 10px; align-items: end; }
  .field label { display: block; font-size: 0.72rem; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: var(--text-muted); margin-bottom: 6px; }
  .field input { width: 100%; padding: 9px 12px; border: 1px solid var(--border); border-radius: var(--radius); font-family: 'Sora', sans-serif; font-size: 0.9rem; background: var(--bg); color: var(--text); transition: border-color 0.15s; outline: none; }
  .field input:focus { border-color: var(--text); background: var(--surface); }
  .field input.error { border-color: var(--accent); background: var(--accent-light); }
  button[type="submit"] { padding: 9px 22px; background: var(--text); color: var(--bg); border: none; border-radius: var(--radius); font-family: 'Space Mono', monospace; font-size: 0.82rem; font-weight: 700; cursor: pointer; white-space: nowrap; transition: background 0.15s, transform 0.1s; letter-spacing: 0.5px; }
  button[type="submit"]:hover { background: #333; }
  button[type="submit"]:active { transform: scale(0.97); }
  .msg-error { margin-top: 10px; font-size: 0.8rem; color: var(--accent); font-weight: 600; min-height: 1.2em; }
  .table-wrap { overflow-x: auto; }
  .count-label { font-family: 'Space Mono', monospace; font-size: 0.72rem; text-transform: uppercase; letter-spacing: 2px; color: var(--text-muted); margin-bottom: 14px; }
  table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
  thead tr { border-bottom: 2px solid var(--text); }
  thead th { font-family: 'Space Mono', monospace; font-size: 0.68rem; text-transform: uppercase; letter-spacing: 1.5px; color: var(--text-muted); text-align: left; padding: 0 10px 10px; font-weight: 400; }
  thead th.col-nota { text-align: center; } thead th.col-accion { text-align: center; }
  tbody tr { border-bottom: 1px solid var(--border); transition: background 0.1s; }
  tbody tr:nth-child(even) { background: var(--row-alt); }
  tbody tr:hover { background: #ede9e0; }
  tbody td { padding: 11px 10px; vertical-align: middle; }
  td.col-rank { font-family: 'Space Mono', monospace; font-size: 0.75rem; color: var(--text-muted); width: 36px; }
  td.col-nombre { font-weight: 600; } td.col-edad { color: var(--text-muted); }
  td.col-nota { text-align: center; font-family: 'Space Mono', monospace; font-weight: 700; font-size: 0.95rem; }
  .nota-badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 0.82rem; }
  .nota-alta  { background: #e8f5e9; color: #2e7d32; }
  .nota-media { background: #fff8e1; color: #f57f17; }
  .nota-baja  { background: var(--accent-light); color: var(--accent); }
  td.col-accion { text-align: center; }
  .btn-del { background: none; border: 1px solid var(--border); border-radius: var(--radius); padding: 4px 10px; font-family: 'Space Mono', monospace; font-size: 0.7rem; color: var(--text-muted); cursor: pointer; transition: border-color 0.15s, color 0.15s, background 0.15s; letter-spacing: 0.5px; }
  .btn-del:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-light); }
  .empty { text-align: center; padding: 32px 0; color: var(--text-muted); font-size: 0.85rem; font-style: italic; }
  @media (max-width: 560px) {
    .form-row { grid-template-columns: 1fr 1fr; }
    .form-row .field:first-child { grid-column: 1 / -1; }
    button[type="submit"] { grid-column: 1 / -1; width: 100%; }
  }
</style>
</head>
<body>
<header>
  <h1>Registro de Alumnos</h1>
  <span>ordenado por nota · nombre</span>
</header>
<div class="card">
  <h2>Nuevo alumno</h2>
  <div class="form-row">
    <div class="field"><label for="nombre">Nombre</label><input type="text" id="nombre" placeholder="Ej: Ana García" autocomplete="off"></div>
    <div class="field"><label for="edad">Edad</label><input type="number" id="edad" placeholder="18" min="1" max="120"></div>
    <div class="field"><label for="nota">Nota</label><input type="number" id="nota" placeholder="7.5" min="0" max="10" step="0.01"></div>
    <button type="submit" onclick="guardar()">Guardar</button>
  </div>
  <div class="msg-error" id="error"></div>
</div>
<div class="card">
  <div class="count-label" id="count-label">cargando…</div>
  <div class="table-wrap">
    <table>
      <thead><tr><th>#</th><th>Nombre</th><th>Edad</th><th class="col-nota">Nota</th><th class="col-accion"></th></tr></thead>
      <tbody id="tbody"></tbody>
    </table>
  </div>
</div>
<script>
  function ordenar(lista) {
    return [...lista].sort((a, b) => b.nota !== a.nota ? b.nota - a.nota : a.nombre.localeCompare(b.nombre, 'es'));
  }
  function notaClass(n) { return n >= 7 ? 'nota-alta' : n >= 4 ? 'nota-media' : 'nota-baja'; }
  function esc(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

  async function cargarTabla() {
    const res = await fetch('/api/alumnos');
    const lista = await res.json();
    renderTabla(lista);
  }

  function renderTabla(lista) {
    const ordenada = ordenar(lista);
    const label = document.getElementById('count-label');
    const tbody = document.getElementById('tbody');
    label.textContent = ordenada.length === 1 ? '1 alumno' : ordenada.length + ' alumnos';
    if (ordenada.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="empty">No hay alumnos cargados aún.</td></tr>';
      return;
    }
    tbody.innerHTML = ordenada.map((a, i) => \`
      <tr>
        <td class="col-rank">\${i + 1}</td>
        <td class="col-nombre">\${esc(a.nombre)}</td>
        <td class="col-edad">\${a.edad}</td>
        <td class="col-nota"><span class="nota-badge \${notaClass(a.nota)}">\${a.nota}</span></td>
        <td class="col-accion"><button class="btn-del" onclick="eliminar('\${a.id}')">Borrar</button></td>
      </tr>
    \`).join('');
  }

  async function guardar() {
    const nombreEl = document.getElementById('nombre');
    const edadEl   = document.getElementById('edad');
    const notaEl   = document.getElementById('nota');
    const errorEl  = document.getElementById('error');
    [nombreEl, edadEl, notaEl].forEach(el => el.classList.remove('error'));
    errorEl.textContent = '';

    const nombre = nombreEl.value.trim();
    const edad   = parseInt(edadEl.value);
    const nota   = parseFloat(notaEl.value);

    let err = '';
    if (!nombre)                             { nombreEl.classList.add('error'); err = 'Ingresá un nombre.'; }
    else if (isNaN(edad) || edad < 1)        { edadEl.classList.add('error');   err = 'Ingresá una edad válida.'; }
    else if (isNaN(nota) || nota < 0 || nota > 10) { notaEl.classList.add('error'); err = 'La nota debe estar entre 0 y 10.'; }
    if (err) { errorEl.textContent = err; return; }

    const res = await fetch('/api/alumnos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, edad, nota })
    });
    if (!res.ok) {
      const data = await res.json();
      errorEl.textContent = data.error || 'Error al guardar.';
      return;
    }
    nombreEl.value = ''; edadEl.value = ''; notaEl.value = '';
    nombreEl.focus();
    cargarTabla();
  }

  async function eliminar(id) {
    await fetch('/api/alumnos/' + id, { method: 'DELETE' });
    cargarTabla();
  }

  document.addEventListener('keydown', e => { if (e.key === 'Enter') guardar(); });
  cargarTabla();
</script>
</body>
</html>`;
}
