/* ============================================================
   AI PROMPT DIRECTOR — APP LOGIC
   Storage: IndexedDB (prompts, projects, characters, references, skills)
   ============================================================ */

// ---------- ICONS ----------
const ICONS = {
  copy:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
  edit:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
  trash:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/></svg>',
  folder:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>',
  upload:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>',
  download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
  empty:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
  image:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>',
  star:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
  user:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
  doc:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>',
};

// ---------- DICTIONARIES ----------
const NETWORKS = {
  seedance: 'Seedance 2.0',
  veo:      'VEO OMNI GOOGLE',
  kling:    'KLING',
};
const GROUPS = {
  universal: 'Универсальные',
  trending:  'Трендовые',
  oneoff:    'Разовые',
};
const DEFAULT_NETWORK = 'seedance';
const DEFAULT_GROUP = 'universal';

// ---------- STATE ----------
const state = {
  section: 'prompts',
  network: DEFAULT_NETWORK,
  group:   DEFAULT_GROUP,
  currentProjectId: null,
  prompts: [],
  projects: [],
  characters: [],
  references: [],
  skills: [],
  canvas: {
    nodes: [],
    edges: [],
    panX: 0,
    panY: 0,
    zoom: 1,
    initialised: false,
  },
};

// ---------- INDEXED DB ----------
const DB_NAME = 'ai-prompt-director';
const DB_VERSION = 3;
let db = null;

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const _db = e.target.result;
      if (!_db.objectStoreNames.contains('prompts')) {
        const s = _db.createObjectStore('prompts', { keyPath: 'id' });
        s.createIndex('network', 'network', { unique: false });
      }
      if (!_db.objectStoreNames.contains('projects'))   _db.createObjectStore('projects',   { keyPath: 'id' });
      if (!_db.objectStoreNames.contains('characters')) {
        const s = _db.createObjectStore('characters', { keyPath: 'id' });
        s.createIndex('projectId', 'projectId', { unique: false });
      }
      if (!_db.objectStoreNames.contains('references')) {
        const s = _db.createObjectStore('references', { keyPath: 'id' });
        s.createIndex('characterId', 'characterId', { unique: false });
      }
      if (!_db.objectStoreNames.contains('skills'))     _db.createObjectStore('skills',     { keyPath: 'id' });
      if (!_db.objectStoreNames.contains('canvas_nodes')) _db.createObjectStore('canvas_nodes', { keyPath: 'id' });
      if (!_db.objectStoreNames.contains('canvas_edges')) {
        const s = _db.createObjectStore('canvas_edges', { keyPath: 'id' });
        s.createIndex('fromId', 'fromId', { unique: false });
        s.createIndex('toId',   'toId',   { unique: false });
      }
    };
    req.onsuccess = (e) => resolve(e.target.result);
    req.onerror   = (e) => reject(e.target.error);
  });
}

const tx = (name, mode = 'readonly') => db.transaction(name, mode).objectStore(name);
const dbGetAll = (store) => new Promise((res, rej) => { const r = tx(store).getAll(); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
const dbPut    = (store, item) => new Promise((res, rej) => { const r = tx(store, 'readwrite').put(item); r.onsuccess = () => res(item); r.onerror = () => rej(r.error); });
const dbDelete = (store, id) => new Promise((res, rej) => { const r = tx(store, 'readwrite').delete(id); r.onsuccess = () => res(); r.onerror = () => rej(r.error); });

function dbDeleteWhere(store, indexName, value) {
  return new Promise((resolve, reject) => {
    const idx = tx(store, 'readwrite').index(indexName);
    const req = idx.openCursor(IDBKeyRange.only(value));
    req.onsuccess = (e) => {
      const cur = e.target.result;
      if (cur) { cur.delete(); cur.continue(); } else resolve();
    };
    req.onerror = () => reject(req.error);
  });
}

// ---------- HELPERS ----------
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
const $   = (sel, root = document) => root.querySelector(sel);
const $$  = (sel, root = document) => root.querySelectorAll(sel);

function escapeHtml(s = '') {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function toast(msg, type = 'success') {
  const el = $('#toast');
  el.textContent = msg;
  el.className = `toast ${type}`;
  el.hidden = false;
  void el.offsetWidth;
  el.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => {
    el.classList.remove('show');
    setTimeout(() => { el.hidden = true; }, 300);
  }, 2200);
}

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    toast('Скопировано в буфер обмена');
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); toast('Скопировано'); }
    catch { toast('Не удалось скопировать', 'error'); }
    ta.remove();
  }
}

const fileToDataURL = (file) => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(file); });
const fileToText    = (file) => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsText(file); });

function downloadText(filename, content) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

function fileExt(name = '') {
  const i = name.lastIndexOf('.');
  return i > -1 ? name.slice(i + 1).toLowerCase() : '';
}

// ---------- MODAL ----------
function openModal(html, { narrow = false } = {}) {
  const overlay = $('#modal-overlay');
  const modal = $('#modal');
  modal.classList.toggle('modal-narrow', narrow);
  $('#modal-body').innerHTML = html;
  overlay.hidden = false;
  setTimeout(() => {
    const f = $('#modal-body input:not([type=file]), #modal-body textarea, #modal-body select');
    if (f) f.focus();
  }, 50);
}

function closeModal() {
  $('#modal-overlay').hidden = true;
  $('#modal-body').innerHTML = '';
}

// ---------- PROMPTS ----------
function normalizePrompt(p) {
  return {
    id:        p.id,
    network:   p.network || DEFAULT_NETWORK,
    group:     p.group   || DEFAULT_GROUP,
    theme:     p.theme   || '',
    title:     p.title   || '',
    content:   p.content || '',
    createdAt: p.createdAt || Date.now(),
    updatedAt: p.updatedAt || p.createdAt || Date.now(),
  };
}

async function loadPrompts() {
  const raw = await dbGetAll('prompts');
  const migrated = [];
  state.prompts = raw.map(p => {
    const n = normalizePrompt(p);
    if (n.group !== p.group || n.theme !== p.theme) migrated.push(n);
    return n;
  });
  for (const m of migrated) await dbPut('prompts', m);
  renderPrompts();
}

function renderPrompts() {
  const list = $('#prompts-list');
  const filtered = state.prompts
    .filter(p => p.network === state.network && p.group === state.group)
    .sort((a, b) => b.createdAt - a.createdAt);

  if (!filtered.length) {
    list.innerHTML = `
      <div class="empty">
        <div class="empty-icon">${ICONS.empty}</div>
        <div class="empty-title">Здесь пока нет промптов</div>
        <div class="empty-text">${escapeHtml(GROUPS[state.group])} · <b>${escapeHtml(NETWORKS[state.network])}</b><br>Нажмите <b>+</b> чтобы добавить первый</div>
      </div>`;
    return;
  }

  list.innerHTML = filtered.map(p => `
    <article class="prompt-card" data-id="${p.id}">
      <div class="prompt-title">${escapeHtml(p.title || 'Без названия')}</div>
      <div class="prompt-content">${escapeHtml(p.content)}</div>
      <div class="prompt-actions">
        <button class="icon-btn icon-edit"   data-action="edit"   title="Редактировать">${ICONS.edit}</button>
        <button class="icon-btn icon-delete" data-action="delete" title="Удалить">${ICONS.trash}</button>
        <button class="btn-copy-main"        data-action="copy">${ICONS.copy}<span>Копировать</span></button>
      </div>
    </article>
  `).join('');
}

function promptFormHTML(prompt = null) {
  const isEdit = !!prompt;
  const sel = (val, current) => val === current ? 'selected' : '';
  return `
    <h2>${isEdit ? 'Редактировать промпт' : 'Новый промпт'}</h2>
    <form id="prompt-form">
      <div class="field-grid-3">
        <div class="field">
          <label>Группа</label>
          <select class="select" name="group" required>
            ${Object.entries(GROUPS).map(([k, v]) => `<option value="${k}" ${sel(k, prompt?.group || state.group)}>${escapeHtml(v)}</option>`).join('')}
          </select>
        </div>
        <div class="field">
          <label>Нейросеть</label>
          <select class="select" name="network" required>
            ${Object.entries(NETWORKS).map(([k, v]) => `<option value="${k}" ${sel(k, prompt?.network || state.network)}>${escapeHtml(v)}</option>`).join('')}
          </select>
        </div>
        <div class="field">
          <label>Тема</label>
          <input class="input" name="theme" maxlength="80" value="${escapeHtml(prompt?.theme || '')}" placeholder="Например: Природа, Портрет, Город" />
        </div>
      </div>
      <div class="field">
        <label>Название</label>
        <input class="input" name="title" maxlength="200" required value="${escapeHtml(prompt?.title || '')}" placeholder="Например: Cinematic close-up at golden hour" />
      </div>
      <div class="field">
        <label>Текст промпта</label>
        <textarea class="textarea" name="content" required placeholder="Generate 1 vid for 5 sec...">${escapeHtml(prompt?.content || '')}</textarea>
      </div>
      <div class="modal-actions">
        <button type="button" class="btn btn-secondary" data-close>Отмена</button>
        <button type="submit" class="btn btn-primary">${isEdit ? 'Сохранить' : 'Создать'}</button>
      </div>
    </form>
  `;
}

function openPromptModal(prompt = null) {
  openModal(promptFormHTML(prompt));
  $('#prompt-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const item = {
      id:        prompt?.id || uid(),
      network:   fd.get('network').toString(),
      group:     fd.get('group').toString(),
      theme:     fd.get('theme').toString().trim(),
      title:     fd.get('title').toString().trim(),
      content:   fd.get('content').toString().trim(),
      createdAt: prompt?.createdAt || Date.now(),
      updatedAt: Date.now(),
    };
    await dbPut('prompts', item);
    closeModal();
    selectPromptCombo(item.group, item.network);
    await loadPrompts();
    toast(prompt ? 'Промпт обновлён' : 'Промпт создан');
  });
}

function openCopyModal(prompt) {
  openModal(`
    <h2>${escapeHtml(prompt.title || 'Промпт')}</h2>
    <div class="chip-row">
      <span class="chip group">${escapeHtml(GROUPS[prompt.group] || 'Группа')}</span>
      <span class="chip">${escapeHtml(NETWORKS[prompt.network] || prompt.network)}</span>
      ${prompt.theme ? `<span class="chip theme">${escapeHtml(prompt.theme)}</span>` : ''}
    </div>
    <div class="copy-block tall">${escapeHtml(prompt.content)}</div>
    <button class="btn-big-copy" id="big-copy">${ICONS.copy}<span>Копировать целиком</span></button>
  `);
  $('#big-copy').addEventListener('click', () => copyToClipboard(prompt.content));
}

function openConfirm({ title = 'Удалить?', text = '', confirmText = 'Удалить', onConfirm }) {
  openModal(`
    <h2>${escapeHtml(title)}</h2>
    <p style="color: var(--text-dim); margin-bottom: 24px; line-height: 1.6;">${escapeHtml(text)}</p>
    <div class="modal-actions">
      <button class="btn btn-secondary" data-close>Отмена</button>
      <button class="btn btn-danger" id="confirm-yes">${escapeHtml(confirmText)}</button>
    </div>
  `, { narrow: true });
  $('#confirm-yes').addEventListener('click', async () => { await onConfirm(); closeModal(); });
}

// ---------- PROJECTS / CHARACTERS / REFERENCES ----------
async function loadProjectData() {
  state.projects   = await dbGetAll('projects');
  state.characters = await dbGetAll('characters');
  state.references = await dbGetAll('references');
}

function getProjectPreview(projectId) {
  const charIds = state.characters.filter(c => c.projectId === projectId).map(c => c.id);
  if (!charIds.length) return null;
  const refs = state.references
    .filter(r => charIds.includes(r.characterId))
    .sort((a, b) => a.createdAt - b.createdAt);
  return refs[0]?.imageData || null;
}

async function showProjectsView() {
  state.currentProjectId = null;
  await loadProjectData();
  $('#projects-view').hidden = false;
  $('#project-detail-view').hidden = true;
  renderProjects();
}

function renderProjects() {
  const list = $('#projects-list');
  const sorted = [...state.projects].sort((a, b) => b.createdAt - a.createdAt);

  if (!sorted.length) {
    list.innerHTML = `
      <div class="empty">
        <div class="empty-icon">${ICONS.folder}</div>
        <div class="empty-title">Проектов пока нет</div>
        <div class="empty-text">Нажмите <b>+</b> чтобы создать новый проект</div>
      </div>`;
    return;
  }

  list.innerHTML = sorted.map(p => {
    const charCount = state.characters.filter(c => c.projectId === p.id).length;
    const refCount  = state.references.filter(r => state.characters.find(x => x.id === r.characterId)?.projectId === p.id).length;
    const preview   = getProjectPreview(p.id);

    return `
      <article class="project-card" data-id="${p.id}">
        <div class="project-preview ${preview ? '' : 'empty'}">
          ${preview ? `<img src="${preview}" alt="${escapeHtml(p.name)}" loading="lazy" />` : ICONS.folder}
        </div>
        <div class="project-body">
          <div class="project-name">${escapeHtml(p.name)}</div>
          <div class="project-meta">
            <div class="project-stats">${charCount} перс. · ${refCount} реф.</div>
            <div style="display: flex; gap: 4px;">
              <button class="icon-btn icon-edit"   data-action="edit-project"   title="Переименовать">${ICONS.edit}</button>
              <button class="icon-btn icon-delete" data-action="delete-project" title="Удалить">${ICONS.trash}</button>
            </div>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

function openProjectModal(project = null) {
  const isEdit = !!project;
  openModal(`
    <h2>${isEdit ? 'Переименовать проект' : 'Новый проект'}</h2>
    <form id="project-form">
      <div class="field">
        <label>Название проекта</label>
        <input class="input" name="name" required maxlength="80" value="${escapeHtml(project?.name || '')}" placeholder="Например: Проект 2к17" />
      </div>
      <div class="modal-actions">
        <button type="button" class="btn btn-secondary" data-close>Отмена</button>
        <button type="submit" class="btn btn-primary">${isEdit ? 'Сохранить' : 'Создать'}</button>
      </div>
    </form>
  `, { narrow: true });
  $('#project-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = new FormData(e.target).get('name').toString().trim();
    const item = { id: project?.id || uid(), name, createdAt: project?.createdAt || Date.now() };
    await dbPut('projects', item);
    closeModal();
    await loadProjectData();
    if (state.currentProjectId === item.id) renderProjectDetail();
    else renderProjects();
    toast(isEdit ? 'Проект обновлён' : 'Проект создан');
  });
}

async function openProject(id) {
  state.currentProjectId = id;
  await loadProjectData();
  $('#projects-view').hidden = true;
  $('#project-detail-view').hidden = false;
  renderProjectDetail();
}

function renderProjectDetail() {
  const project = state.projects.find(p => p.id === state.currentProjectId);
  if (!project) { showProjectsView(); return; }

  $('#project-title').textContent = project.name;
  const characters = state.characters
    .filter(c => c.projectId === project.id)
    .sort((a, b) => a.createdAt - b.createdAt);

  const totalRefs = state.references.filter(r => characters.some(c => c.id === r.characterId)).length;
  $('#project-subtitle').textContent = `${characters.length} персонажей · ${totalRefs} референсов`;

  const list = $('#characters-list');
  if (!characters.length) {
    list.innerHTML = `
      <div class="empty">
        <div class="empty-icon">${ICONS.image}</div>
        <div class="empty-title">Добавьте первого персонажа</div>
        <div class="empty-text">Нажмите <b>+</b> чтобы создать персонажа в этом проекте</div>
      </div>`;
    return;
  }

  list.innerHTML = characters.map(c => {
    const refs = state.references
      .filter(r => r.characterId === c.id)
      .sort((a, b) => a.createdAt - b.createdAt);

    return `
      <section class="character-card" data-character-id="${c.id}">
        <header class="character-header">
          <div class="character-name">${escapeHtml(c.name)} <span>${refs.length} реф.</span></div>
          <div class="character-actions">
            <button class="icon-btn icon-edit"   data-action="edit-character"   title="Переименовать">${ICONS.edit}</button>
            <button class="icon-btn icon-delete" data-action="delete-character" title="Удалить">${ICONS.trash}</button>
          </div>
        </header>
        <div class="refs-grid">
          <button class="ref-card ref-add" data-action="add-ref">
            <span class="plus-big">+</span>
            <span>Добавить референс</span>
          </button>
          ${refs.map(r => `
            <div class="ref-card" data-ref-id="${r.id}" data-action="view-ref">
              <img src="${r.imageData}" alt="${escapeHtml(r.angle)}" loading="lazy" />
              <div class="ref-actions">
                <button class="icon-btn icon-edit"   data-action="edit-ref"   title="Изменить ракурс">${ICONS.edit}</button>
                <button class="icon-btn icon-delete" data-action="delete-ref" title="Удалить">${ICONS.trash}</button>
              </div>
              <div class="ref-angle">${escapeHtml(r.angle || 'Без подписи')}</div>
            </div>
          `).join('')}
        </div>
      </section>
    `;
  }).join('');
}

function openCharacterModal(character = null) {
  const isEdit = !!character;
  openModal(`
    <h2>${isEdit ? 'Переименовать персонажа' : 'Новый персонаж'}</h2>
    <form id="character-form">
      <div class="field">
        <label>Имя персонажа</label>
        <input class="input" name="name" required maxlength="80" value="${escapeHtml(character?.name || '')}" placeholder="Например: Главный герой" />
      </div>
      <div class="modal-actions">
        <button type="button" class="btn btn-secondary" data-close>Отмена</button>
        <button type="submit" class="btn btn-primary">${isEdit ? 'Сохранить' : 'Создать'}</button>
      </div>
    </form>
  `, { narrow: true });
  $('#character-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = new FormData(e.target).get('name').toString().trim();
    const item = {
      id: character?.id || uid(),
      projectId: state.currentProjectId,
      name,
      createdAt: character?.createdAt || Date.now(),
    };
    await dbPut('characters', item);
    closeModal();
    await loadProjectData();
    renderProjectDetail();
    toast(isEdit ? 'Персонаж обновлён' : 'Персонаж создан');
  });
}

function openReferenceModal(characterId, reference = null) {
  const isEdit = !!reference;
  let imageData = reference?.imageData || '';

  openModal(`
    <h2>${isEdit ? 'Изменить референс' : 'Новый референс'}</h2>
    <form id="reference-form">
      ${imageData ? `<div class="image-preview" id="img-preview"><img src="${imageData}" /></div>` : ''}
      ${!isEdit ? `
        <label class="upload-zone" id="upload-zone">
          <div class="upload-icon">${ICONS.upload}</div>
          <p><b>Нажмите или перетащите</b> изображение сюда</p>
          <p style="font-size:11px; opacity: 0.7;">JPG, PNG, WebP, GIF</p>
          <input type="file" name="file" accept="image/*" hidden id="file-input" required />
        </label>
        <div class="image-preview" id="img-preview" hidden></div>
      ` : ''}
      <div class="field">
        <label>Ракурс / подпись</label>
        <input class="input" name="angle" maxlength="120" value="${escapeHtml(reference?.angle || '')}" placeholder="Например: Анфас, портрет крупным планом" />
      </div>
      <div class="modal-actions">
        <button type="button" class="btn btn-secondary" data-close>Отмена</button>
        <button type="submit" class="btn btn-primary">${isEdit ? 'Сохранить' : 'Добавить'}</button>
      </div>
    </form>
  `);

  if (!isEdit) {
    const zone    = $('#upload-zone');
    const input   = $('#file-input');
    const preview = $('#img-preview');

    const handleFile = async (file) => {
      if (!file || !file.type.startsWith('image/')) {
        toast('Это не изображение', 'error');
        return;
      }
      try {
        imageData = await fileToDataURL(file);
        preview.innerHTML = `<img src="${imageData}" />`;
        preview.hidden = false;
        zone.style.display = 'none';
      } catch { toast('Не удалось прочитать файл', 'error'); }
    };

    input.addEventListener('change', (e) => handleFile(e.target.files[0]));
    zone.addEventListener('dragover',  (e) => { e.preventDefault(); zone.classList.add('dragging'); });
    zone.addEventListener('dragleave', () => zone.classList.remove('dragging'));
    zone.addEventListener('drop', (e) => { e.preventDefault(); zone.classList.remove('dragging'); handleFile(e.dataTransfer.files[0]); });
  }

  $('#reference-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!imageData) { toast('Сначала добавьте изображение', 'error'); return; }
    const angle = new FormData(e.target).get('angle').toString().trim();
    const item = {
      id: reference?.id || uid(),
      characterId,
      angle,
      imageData,
      createdAt: reference?.createdAt || Date.now(),
    };
    await dbPut('references', item);
    closeModal();
    await loadProjectData();
    renderProjectDetail();
    toast(isEdit ? 'Референс обновлён' : 'Референс добавлен');
  });
}

function openReferenceViewer(reference) {
  const ch = state.characters.find(c => c.id === reference.characterId);
  const pr = ch ? state.projects.find(p => p.id === ch.projectId) : null;
  openModal(`
    <h2>${escapeHtml(reference.angle || 'Референс')}</h2>
    <div class="chip-row">
      ${pr ? `<span class="chip">${escapeHtml(pr.name)}</span>` : ''}
      ${ch ? `<span class="chip">${escapeHtml(ch.name)}</span>` : ''}
    </div>
    <div class="image-preview"><img src="${reference.imageData}" /></div>
    <div class="modal-actions">
      <button class="btn btn-secondary" data-close>Закрыть</button>
    </div>
  `);
}

// ---------- SKILLS ----------
async function loadSkills() {
  state.skills = await dbGetAll('skills');
  renderSkills();
}

function renderSkills() {
  const list = $('#skills-list');
  const sorted = [...state.skills].sort((a, b) => b.createdAt - a.createdAt);

  if (!sorted.length) {
    list.innerHTML = `
      <div class="empty">
        <div class="empty-icon">${ICONS.star}</div>
        <div class="empty-title">Пока нет ни одного скилла</div>
        <div class="empty-text">Перетащите файл <code>.md</code> или <code>.skill</code> в зону выше</div>
      </div>`;
    return;
  }

  list.innerHTML = sorted.map(s => `
    <article class="skill-card" data-id="${s.id}">
      <div class="skill-card-header">
        <div class="skill-ext">${escapeHtml((s.ext || 'TXT').toUpperCase().slice(0, 5))}</div>
        <div class="skill-info">
          <div class="skill-name">${escapeHtml(s.name)}</div>
          <div class="skill-meta">${escapeHtml(s.fileName)} · ${(s.size / 1024).toFixed(1)} KB</div>
        </div>
      </div>
      <div class="skill-content">${escapeHtml(s.content.slice(0, 400))}</div>
      <div class="skill-actions">
        <button class="icon-btn icon-edit"     data-action="edit-skill"     title="Переименовать">${ICONS.edit}</button>
        <button class="icon-btn icon-download" data-action="download-skill" title="Скачать">${ICONS.download}</button>
        <button class="icon-btn icon-delete"   data-action="delete-skill"   title="Удалить">${ICONS.trash}</button>
        <button class="btn-copy-main"          data-action="copy-skill">${ICONS.copy}<span>Копировать</span></button>
      </div>
    </article>
  `).join('');
}

async function importSkillFiles(files) {
  const accepted = ['md', 'skill', 'txt', 'mdx', 'markdown'];
  let count = 0;
  for (const file of files) {
    const ext = fileExt(file.name);
    if (ext && !accepted.includes(ext)) {
      toast(`Файл ${file.name} пропущен (не .md / .skill)`, 'error');
      continue;
    }
    try {
      const content = await fileToText(file);
      const baseName = file.name.replace(/\.(md|skill|txt|mdx|markdown)$/i, '');
      const item = {
        id: uid(),
        name: baseName || file.name,
        fileName: file.name,
        ext: ext || 'txt',
        content,
        size: file.size,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      await dbPut('skills', item);
      count++;
    } catch {
      toast(`Не удалось прочитать ${file.name}`, 'error');
    }
  }
  if (count) {
    await loadSkills();
    toast(`Загружено: ${count} ${count === 1 ? 'файл' : 'файлов'}`);
  }
}

function openSkillViewer(skill) {
  openModal(`
    <h2>${escapeHtml(skill.name)}</h2>
    <div class="chip-row">
      <span class="chip">${escapeHtml(skill.fileName)}</span>
      <span class="chip">${(skill.size / 1024).toFixed(1)} KB</span>
    </div>
    <div class="copy-block tall">${escapeHtml(skill.content)}</div>
    <div class="modal-actions">
      <button class="btn btn-secondary" data-close>Закрыть</button>
      <button class="btn btn-secondary" id="skill-download">${ICONS.download} Скачать</button>
      <button class="btn btn-primary"   id="skill-copy">${ICONS.copy} Копировать</button>
    </div>
  `);

  $('#skill-copy').addEventListener('click', () => copyToClipboard(skill.content));
  $('#skill-download').addEventListener('click', () => downloadText(skill.fileName, skill.content));
}

function openSkillRenameModal(skill) {
  openModal(`
    <h2>Переименовать скилл</h2>
    <form id="skill-form">
      <div class="field">
        <label>Название</label>
        <input class="input" name="name" required maxlength="120" value="${escapeHtml(skill.name)}" />
      </div>
      <div class="field">
        <label>Имя файла</label>
        <input class="input" name="fileName" required maxlength="120" value="${escapeHtml(skill.fileName)}" />
      </div>
      <div class="modal-actions">
        <button type="button" class="btn btn-secondary" data-close>Отмена</button>
        <button type="submit"  class="btn btn-primary">Сохранить</button>
      </div>
    </form>
  `, { narrow: true });
  $('#skill-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const updated = {
      ...skill,
      name: fd.get('name').toString().trim(),
      fileName: fd.get('fileName').toString().trim(),
      ext: fileExt(fd.get('fileName').toString()) || skill.ext,
      updatedAt: Date.now(),
    };
    await dbPut('skills', updated);
    closeModal();
    await loadSkills();
    toast('Скилл обновлён');
  });
}

// ---------- CANVAS / NETWORKS WORKSPACE ----------
async function loadCanvas() {
  state.canvas.nodes = await dbGetAll('canvas_nodes');
  state.canvas.edges = await dbGetAll('canvas_edges');
  if (!state.canvas.initialised) {
    state.canvas.initialised = true;
    centerCanvasViewport();
  }
  renderCanvas();
}

function centerCanvasViewport() {
  const wrap = $('#canvas-wrap');
  if (!wrap) return;
  const rect = wrap.getBoundingClientRect();
  if (state.canvas.nodes.length === 0) {
    state.canvas.panX = rect.width / 2;
    state.canvas.panY = rect.height / 2;
    state.canvas.zoom = 1;
  }
}

function applyCanvasTransform() {
  const inner = $('#canvas-inner');
  if (!inner) return;
  inner.style.transform = `translate(${state.canvas.panX}px, ${state.canvas.panY}px) scale(${state.canvas.zoom})`;
  $('#canvas-zoom').textContent = `${Math.round(state.canvas.zoom * 100)}%`;
}

function nodeHTML(n) {
  if (n.type === 'button') {
    return `
      <div class="canvas-node btn" data-id="${n.id}" data-type="button" style="left:${n.x}px; top:${n.y}px;">
        <div class="canvas-node-name">${escapeHtml(n.name || 'Без названия')}</div>
        ${n.url ? `<div class="canvas-node-url">${escapeHtml(n.url)}</div>` : `<div class="canvas-node-url" style="font-style:italic; color:var(--text-muted)">URL не задан</div>`}
        <div class="node-handle left"  data-side="left"></div>
        <div class="node-handle right" data-side="right"></div>
        <div class="canvas-node-actions">
          ${n.url ? `<button class="open" data-action="open-url" title="Открыть URL"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg></button>` : ''}
          <button data-action="edit-node" title="Редактировать">${ICONS.edit}</button>
          <button class="delete" data-action="delete-node" title="Удалить">×</button>
        </div>
      </div>`;
  }
  return `
    <div class="canvas-node txt" data-id="${n.id}" data-type="text" style="left:${n.x}px; top:${n.y}px;">
      <div class="canvas-node-text">${escapeHtml(n.text || '')}</div>
      <div class="node-handle left"  data-side="left"></div>
      <div class="node-handle right" data-side="right"></div>
      <div class="canvas-node-actions">
        <button data-action="edit-node" title="Редактировать">${ICONS.edit}</button>
        <button class="delete" data-action="delete-node" title="Удалить">×</button>
      </div>
    </div>`;
}

function renderCanvas() {
  const nodesEl = $('#canvas-nodes');
  if (!nodesEl) return;
  nodesEl.innerHTML = state.canvas.nodes.map(nodeHTML).join('');
  $('#canvas-hint')?.classList.toggle('hidden', state.canvas.nodes.length > 0);
  applyCanvasTransform();

  requestAnimationFrame(() => {
    state.canvas.nodes.forEach(n => {
      const el = nodesEl.querySelector(`.canvas-node[data-id="${n.id}"]`);
      if (el) {
        n._w = el.offsetWidth;
        n._h = el.offsetHeight;
      }
    });
    renderEdges();
  });
}

function edgePath(a, b) {
  const aw = a._w || 200, ah = a._h || 60;
  const bw = b._w || 200, bh = b._h || 60;
  const ax = a.x + aw / 2, ay = a.y + ah / 2;
  const bx = b.x + bw / 2, by = b.y + bh / 2;
  const dx = bx - ax;
  const offset = Math.max(40, Math.abs(dx) * 0.4);
  // Exit/enter from right or left side based on relative position
  const aSide = dx >= 0 ? aw / 2 : -aw / 2;
  const bSide = dx >= 0 ? -bw / 2 : bw / 2;
  const sx = ax + aSide, sy = ay;
  const ex = bx + bSide, ey = by;
  return `M ${sx} ${sy} C ${sx + (dx >= 0 ? offset : -offset)} ${sy}, ${ex + (dx >= 0 ? -offset : offset)} ${ey}, ${ex} ${ey}`;
}

function renderEdges() {
  const group = $('#canvas-edges-group');
  if (!group) return;
  group.innerHTML = state.canvas.edges.map(c => {
    const a = state.canvas.nodes.find(n => n.id === c.fromId);
    const b = state.canvas.nodes.find(n => n.id === c.toId);
    if (!a || !b) return '';
    return `<path d="${edgePath(a, b)}" data-id="${c.id}" />`;
  }).join('');
}

const cleanNode = (n) => {
  const { _w, _h, ...rest } = n;
  return rest;
};

async function addCanvasNode(type, props = {}) {
  const wrap = $('#canvas-wrap');
  const rect = wrap.getBoundingClientRect();
  // Place at viewport center, offset slightly to avoid stacking
  const cx = (rect.width / 2 - state.canvas.panX) / state.canvas.zoom;
  const cy = (rect.height / 2 - state.canvas.panY) / state.canvas.zoom;
  const jitter = state.canvas.nodes.length * 18;
  const node = {
    id: uid(),
    type,
    x: Math.round(cx - 100 + jitter),
    y: Math.round(cy - 30 + jitter),
    name: type === 'button' ? 'Новая нейросеть' : '',
    url:  type === 'button' ? 'https://' : '',
    text: type === 'text'   ? 'Новый текстовый блок' : '',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  await dbPut('canvas_nodes', cleanNode(node));
  state.canvas.nodes.push(node);
  renderCanvas();
  // Открыть редактор сразу для удобства
  setTimeout(() => openNodeEditor(node), 80);
}

async function deleteCanvasNode(id) {
  // удалить связанные рёбра
  const linked = state.canvas.edges.filter(e => e.fromId === id || e.toId === id);
  for (const e of linked) await dbDelete('canvas_edges', e.id);
  state.canvas.edges = state.canvas.edges.filter(e => e.fromId !== id && e.toId !== id);
  await dbDelete('canvas_nodes', id);
  state.canvas.nodes = state.canvas.nodes.filter(n => n.id !== id);
  renderCanvas();
}

async function addCanvasEdge(fromId, toId) {
  if (fromId === toId) return;
  const exists = state.canvas.edges.find(e => e.fromId === fromId && e.toId === toId);
  if (exists) return;
  const edge = { id: uid(), fromId, toId, createdAt: Date.now() };
  await dbPut('canvas_edges', edge);
  state.canvas.edges.push(edge);
  renderEdges();
}

function openNodeEditor(node) {
  if (node.type === 'button') {
    openModal(`
      <h2>${escapeHtml(node.name) ? 'Редактировать кнопку' : 'Новая кнопка'}</h2>
      <form id="node-form">
        <div class="field">
          <label>Название нейросети</label>
          <input class="input" name="name" required maxlength="120" value="${escapeHtml(node.name || '')}" placeholder="Например: ChatGPT, Midjourney, Sora" />
        </div>
        <div class="field">
          <label>URL</label>
          <input class="input" name="url" type="url" required value="${escapeHtml(node.url || '')}" placeholder="https://..." />
        </div>
        <div class="modal-actions">
          <button type="button" class="btn btn-secondary" data-close>Отмена</button>
          <button type="submit"  class="btn btn-primary">Сохранить</button>
        </div>
      </form>
    `, { narrow: true });
  } else {
    openModal(`
      <h2>${node.text ? 'Редактировать текст' : 'Новый текстовый блок'}</h2>
      <form id="node-form">
        <div class="field">
          <label>Текст</label>
          <textarea class="textarea" name="text" required placeholder="Свяжите этот блок с кнопкой нейросети…">${escapeHtml(node.text || '')}</textarea>
        </div>
        <div class="modal-actions">
          <button type="button" class="btn btn-secondary" data-close>Отмена</button>
          <button type="submit"  class="btn btn-primary">Сохранить</button>
        </div>
      </form>
    `);
  }

  $('#node-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const updated = { ...node, updatedAt: Date.now() };
    if (node.type === 'button') {
      updated.name = fd.get('name').toString().trim();
      updated.url  = fd.get('url').toString().trim();
    } else {
      updated.text = fd.get('text').toString().trim();
    }
    await dbPut('canvas_nodes', cleanNode(updated));
    const idx = state.canvas.nodes.findIndex(n => n.id === node.id);
    if (idx >= 0) state.canvas.nodes[idx] = updated;
    closeModal();
    renderCanvas();
    toast('Нода обновлена');
  });
}

// ----- canvas pan / drag / zoom / connect -----
let canvasInteraction = null; // {mode: 'pan'|'drag'|'wire', ...}

function initCanvasEvents() {
  const wrap = $('#canvas-wrap');
  if (!wrap || wrap.dataset.bound === '1') return;
  wrap.dataset.bound = '1';

  wrap.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return;
    if (e.target.closest('[data-action]')) return;

    const handle = e.target.closest('.node-handle');
    if (handle) {
      const nodeEl = handle.closest('.canvas-node');
      if (!nodeEl) return;
      e.preventDefault(); e.stopPropagation();
      canvasInteraction = {
        mode: 'wire',
        fromId: nodeEl.dataset.id,
        targetEl: null,
      };
      nodeEl.classList.add('connecting-source');
      wrap.classList.add('connecting');
      return;
    }

    const nodeEl = e.target.closest('.canvas-node');
    if (nodeEl) {
      e.preventDefault();
      const node = state.canvas.nodes.find(n => n.id === nodeEl.dataset.id);
      if (!node) return;
      canvasInteraction = {
        mode: 'drag',
        nodeId: node.id,
        startMouseX: e.clientX,
        startMouseY: e.clientY,
        startNodeX: node.x,
        startNodeY: node.y,
        moved: false,
      };
      return;
    }

    // Pan
    e.preventDefault();
    canvasInteraction = {
      mode: 'pan',
      startMouseX: e.clientX,
      startMouseY: e.clientY,
      startPanX: state.canvas.panX,
      startPanY: state.canvas.panY,
    };
    wrap.classList.add('panning');
  });

  window.addEventListener('mousemove', (e) => {
    if (!canvasInteraction) return;
    if (canvasInteraction.mode === 'pan') {
      state.canvas.panX = canvasInteraction.startPanX + (e.clientX - canvasInteraction.startMouseX);
      state.canvas.panY = canvasInteraction.startPanY + (e.clientY - canvasInteraction.startMouseY);
      applyCanvasTransform();
    } else if (canvasInteraction.mode === 'drag') {
      const dx = (e.clientX - canvasInteraction.startMouseX) / state.canvas.zoom;
      const dy = (e.clientY - canvasInteraction.startMouseY) / state.canvas.zoom;
      if (Math.abs(dx) + Math.abs(dy) > 2) canvasInteraction.moved = true;
      const node = state.canvas.nodes.find(n => n.id === canvasInteraction.nodeId);
      if (!node) return;
      node.x = Math.round(canvasInteraction.startNodeX + dx);
      node.y = Math.round(canvasInteraction.startNodeY + dy);
      const el = $(`.canvas-node[data-id="${node.id}"]`);
      if (el) {
        el.style.left = `${node.x}px`;
        el.style.top  = `${node.y}px`;
      }
      renderEdges();
    } else if (canvasInteraction.mode === 'wire') {
      drawTempWire(e);
      // подсветить ноду под курсором
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const nodeEl = el?.closest('.canvas-node');
      if (canvasInteraction.targetEl && canvasInteraction.targetEl !== nodeEl) {
        canvasInteraction.targetEl.classList.remove('selected');
      }
      canvasInteraction.targetEl = nodeEl && nodeEl.dataset.id !== canvasInteraction.fromId ? nodeEl : null;
      if (canvasInteraction.targetEl) canvasInteraction.targetEl.classList.add('selected');
    }
  });

  window.addEventListener('mouseup', async (e) => {
    if (!canvasInteraction) return;
    const m = canvasInteraction;
    if (m.mode === 'pan') {
      wrap.classList.remove('panning');
    } else if (m.mode === 'drag') {
      const node = state.canvas.nodes.find(n => n.id === m.nodeId);
      if (node) await dbPut('canvas_nodes', cleanNode(node));
    } else if (m.mode === 'wire') {
      $$('.canvas-node.connecting-source').forEach(el => el.classList.remove('connecting-source'));
      $$('.canvas-node.selected').forEach(el => el.classList.remove('selected'));
      wrap.classList.remove('connecting');
      $('#canvas-tempwire')?.remove();
      const targetEl = document.elementFromPoint(e.clientX, e.clientY)?.closest('.canvas-node');
      if (targetEl && targetEl.dataset.id !== m.fromId) {
        await addCanvasEdge(m.fromId, targetEl.dataset.id);
        toast('Связь создана');
      }
    }
    canvasInteraction = null;
  });

  wrap.addEventListener('wheel', (e) => {
    if (state.section !== 'networks') return;
    e.preventDefault();
    const rect = wrap.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const factor = e.deltaY < 0 ? 1.12 : 0.89;
    const newZoom = Math.max(0.25, Math.min(3, state.canvas.zoom * factor));
    state.canvas.panX = mx - (mx - state.canvas.panX) * (newZoom / state.canvas.zoom);
    state.canvas.panY = my - (my - state.canvas.panY) * (newZoom / state.canvas.zoom);
    state.canvas.zoom = newZoom;
    applyCanvasTransform();
  }, { passive: false });

  // Клики по action-кнопкам внутри нод
  wrap.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const nodeEl = btn.closest('.canvas-node');
    if (!nodeEl) return;
    const node = state.canvas.nodes.find(n => n.id === nodeEl.dataset.id);
    if (!node) return;
    e.stopPropagation();
    const action = btn.dataset.action;
    if (action === 'open-url' && node.url) {
      window.open(node.url, '_blank', 'noopener');
    } else if (action === 'edit-node') {
      openNodeEditor(node);
    } else if (action === 'delete-node') {
      const label = node.type === 'button' ? `«${node.name || 'Без названия'}»` : 'этот текстовый блок';
      openConfirm({
        title: 'Удалить ноду?',
        text: `Удалить ${label} и все её связи?`,
        onConfirm: async () => {
          await deleteCanvasNode(node.id);
          toast('Нода удалена');
        },
      });
    }
  });
}

function drawTempWire(e) {
  const m = canvasInteraction;
  if (!m || m.mode !== 'wire') return;
  const a = state.canvas.nodes.find(n => n.id === m.fromId);
  if (!a) return;
  const wrap = $('#canvas-wrap');
  const rect = wrap.getBoundingClientRect();
  const mx = (e.clientX - rect.left - state.canvas.panX) / state.canvas.zoom;
  const my = (e.clientY - rect.top  - state.canvas.panY) / state.canvas.zoom;

  const aw = a._w || 200, ah = a._h || 60;
  const ax = a.x + aw / 2, ay = a.y + ah / 2;
  const dx = mx - ax;
  const offset = Math.max(40, Math.abs(dx) * 0.4);
  const sx = ax + (dx >= 0 ? aw / 2 : -aw / 2);
  const path = `M ${sx} ${ay} C ${sx + (dx >= 0 ? offset : -offset)} ${ay}, ${mx + (dx >= 0 ? -offset : offset)} ${my}, ${mx} ${my}`;

  let p = $('#canvas-tempwire');
  if (!p) {
    p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    p.id = 'canvas-tempwire';
    p.setAttribute('class', 'canvas-tempwire');
    $('#canvas-edges-group').appendChild(p);
  }
  p.setAttribute('d', path);
}

function fitCanvasToContent() {
  const wrap = $('#canvas-wrap');
  if (!wrap) return;
  const rect = wrap.getBoundingClientRect();
  if (state.canvas.nodes.length === 0) {
    state.canvas.panX = rect.width / 2;
    state.canvas.panY = rect.height / 2;
    state.canvas.zoom = 1;
    applyCanvasTransform();
    return;
  }
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  state.canvas.nodes.forEach(n => {
    const w = n._w || 200, h = n._h || 60;
    minX = Math.min(minX, n.x);
    minY = Math.min(minY, n.y);
    maxX = Math.max(maxX, n.x + w);
    maxY = Math.max(maxY, n.y + h);
  });
  const pad = 80;
  const contentW = maxX - minX + pad * 2;
  const contentH = maxY - minY + pad * 2;
  const zoom = Math.min(rect.width / contentW, rect.height / contentH, 1.5);
  state.canvas.zoom = Math.max(0.25, zoom);
  state.canvas.panX = (rect.width  - (maxX + minX) * state.canvas.zoom) / 2;
  state.canvas.panY = (rect.height - (maxY + minY) * state.canvas.zoom) / 2;
  applyCanvasTransform();
}

function centerCanvasOnNode(n) {
  const wrap = $('#canvas-wrap');
  if (!wrap) return;
  const rect = wrap.getBoundingClientRect();
  const w = n._w || 200, h = n._h || 60;
  state.canvas.zoom = 1;
  state.canvas.panX = rect.width / 2 - (n.x + w / 2);
  state.canvas.panY = rect.height / 2 - (n.y + h / 2);
  applyCanvasTransform();
}

// ---------- GLOBAL SEARCH ----------
function highlight(text, query) {
  if (!query) return escapeHtml(text);
  const safe = escapeHtml(text);
  const q = escapeHtml(query).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return safe.replace(new RegExp(q, 'ig'), m => `<mark>${m}</mark>`);
}

function searchAll(rawQuery) {
  const q = rawQuery.trim().toLowerCase();
  if (!q) return null;
  const results = { prompts: [], projects: [], characters: [], references: [], skills: [], canvas: [] };
  for (const p of state.prompts) {
    const hay = `${p.title} ${p.content} ${p.theme}`.toLowerCase();
    if (hay.includes(q)) results.prompts.push(p);
  }
  for (const p of state.projects)   if (p.name.toLowerCase().includes(q)) results.projects.push(p);
  for (const c of state.characters) if (c.name.toLowerCase().includes(q)) results.characters.push(c);
  for (const r of state.references) if ((r.angle || '').toLowerCase().includes(q)) results.references.push(r);
  for (const s of state.skills) {
    const hay = `${s.name} ${s.fileName} ${s.content}`.toLowerCase();
    if (hay.includes(q)) results.skills.push(s);
  }
  for (const n of state.canvas.nodes) {
    const hay = `${n.name || ''} ${n.url || ''} ${n.text || ''}`.toLowerCase();
    if (hay.includes(q)) results.canvas.push(n);
  }
  return results;
}

function renderSearchResults(query) {
  const wrap = $('#search-results');
  if (!query.trim()) { wrap.hidden = true; wrap.innerHTML = ''; return; }
  const r = searchAll(query);
  const empty = ['prompts','projects','characters','references','skills','canvas'].every(k => !r[k].length);
  if (empty) {
    wrap.innerHTML = `<div class="search-empty">Ничего не найдено по запросу <b>«${escapeHtml(query)}»</b></div>`;
    wrap.hidden = false;
    return;
  }

  const groups = [];
  if (r.prompts.length) groups.push({
    title: `Промпты (${r.prompts.length})`,
    items: r.prompts.slice(0, 5).map(p => ({
      kind: 'prompt', id: p.id, icon: ICONS.doc,
      title: highlight(p.title || 'Без названия', query),
      meta: `${GROUPS[p.group]} · ${NETWORKS[p.network]}${p.theme ? ' · ' + highlight(p.theme, query) : ''}`,
    })),
  });
  if (r.projects.length) groups.push({
    title: `Проекты (${r.projects.length})`,
    items: r.projects.slice(0, 5).map(p => ({
      kind: 'project', id: p.id, icon: ICONS.folder,
      title: highlight(p.name, query),
      meta: `${state.characters.filter(c => c.projectId === p.id).length} персонажей`,
    })),
  });
  if (r.characters.length) groups.push({
    title: `Персонажи (${r.characters.length})`,
    items: r.characters.slice(0, 5).map(c => {
      const pr = state.projects.find(x => x.id === c.projectId);
      return {
        kind: 'character', id: c.id, projectId: c.projectId, icon: ICONS.user,
        title: highlight(c.name, query),
        meta: `Проект: ${pr ? escapeHtml(pr.name) : '—'}`,
      };
    }),
  });
  if (r.references.length) groups.push({
    title: `Референсы (${r.references.length})`,
    items: r.references.slice(0, 5).map(ref => {
      const ch = state.characters.find(c => c.id === ref.characterId);
      const pr = ch ? state.projects.find(p => p.id === ch.projectId) : null;
      return {
        kind: 'reference', id: ref.id, icon: ICONS.image,
        title: highlight(ref.angle || 'Без подписи', query),
        meta: `${pr ? escapeHtml(pr.name) : ''} ${ch ? '· ' + escapeHtml(ch.name) : ''}`.trim(),
      };
    }),
  });
  if (r.skills.length) groups.push({
    title: `Скиллы (${r.skills.length})`,
    items: r.skills.slice(0, 5).map(s => ({
      kind: 'skill', id: s.id, icon: ICONS.star,
      title: highlight(s.name, query),
      meta: escapeHtml(s.fileName),
    })),
  });
  if (r.canvas.length) groups.push({
    title: `Нейросети (${r.canvas.length})`,
    items: r.canvas.slice(0, 5).map(n => ({
      kind: 'canvas-node', id: n.id,
      icon: n.type === 'button'
        ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="8" width="18" height="9" rx="2"/></svg>'
        : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="8" x2="20" y2="8"/><line x1="4" y1="13" x2="16" y2="13"/><line x1="4" y1="18" x2="13" y2="18"/></svg>',
      title: highlight(n.type === 'button' ? (n.name || 'Без названия') : (n.text || 'Текст').slice(0, 60), query),
      meta: n.type === 'button' ? (n.url || '—') : 'Текстовый блок',
    })),
  });

  wrap.innerHTML = groups.map(g => `
    <div class="search-group">
      <div class="search-group-title">${g.title}</div>
      ${g.items.map(it => `
        <div class="search-item" data-kind="${it.kind}" data-id="${it.id}" ${it.projectId ? `data-project-id="${it.projectId}"` : ''}>
          <div class="si-icon">${it.icon}</div>
          <div class="si-body">
            <div class="si-title">${it.title}</div>
            <div class="si-meta">${it.meta}</div>
          </div>
        </div>
      `).join('')}
    </div>
  `).join('');
  wrap.hidden = false;
}

async function navigateToSearchResult(kind, id, extra = {}) {
  if (kind === 'prompt') {
    const p = state.prompts.find(x => x.id === id);
    if (!p) return;
    selectPromptCombo(p.group, p.network);
    setTimeout(() => openCopyModal(p), 80);
  } else if (kind === 'project') {
    switchSection('references');
    await openProject(id);
  } else if (kind === 'character') {
    switchSection('references');
    await openProject(extra.projectId);
    setTimeout(() => {
      const el = $(`.character-card[data-character-id="${id}"]`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        el.classList.add('highlight');
        setTimeout(() => el.classList.remove('highlight'), 1700);
      }
    }, 120);
  } else if (kind === 'reference') {
    const ref = state.references.find(r => r.id === id);
    if (ref) openReferenceViewer(ref);
  } else if (kind === 'skill') {
    const s = state.skills.find(x => x.id === id);
    if (!s) return;
    switchSection('skills');
    setTimeout(() => openSkillViewer(s), 80);
  } else if (kind === 'canvas-node') {
    const n = state.canvas.nodes.find(x => x.id === id);
    if (!n) return;
    switchSection('networks');
    setTimeout(() => {
      centerCanvasOnNode(n);
      const el = $(`.canvas-node[data-id="${id}"]`);
      if (el) {
        el.classList.add('selected');
        setTimeout(() => el.classList.remove('selected'), 1800);
      }
    }, 100);
  }
  closeSearchResults();
}

function closeSearchResults() {
  $('#search-results').hidden = true;
  $('#global-search').value = '';
  $('#search-clear').hidden = true;
}

// ---------- NAVIGATION ----------
function switchSection(name) {
  state.section = name;
  $$('.section').forEach(s => s.classList.toggle('active', s.id === `${name}-section`));
  $('#sidebar').classList.remove('open');
  if (name === 'references') showProjectsView();
  if (name === 'skills') renderSkills();
  if (name === 'networks') {
    initCanvasEvents();
    loadCanvas();
  }
  refreshNavState();
}

function selectPromptCombo(group, network) {
  if (!GROUPS[group] || !NETWORKS[network]) return;
  state.group = group;
  state.network = network;

  // Раскрыть нужные узлы
  const promptsParent = $('[data-toggle="prompts"]');
  const promptsChildren = $('[data-children="prompts"]');
  promptsParent?.classList.add('open');
  promptsChildren?.classList.add('open');

  $$('.nav-subitem.nav-parent').forEach(p => {
    const isOpen = p.dataset.toggle === group;
    p.classList.toggle('open', isOpen);
    const ch = $(`[data-children="${p.dataset.toggle}"]`);
    if (ch) ch.classList.toggle('open', isOpen);
  });

  switchSection('prompts');
  $('#prompts-breadcrumb').textContent = `${GROUPS[group]} · ${NETWORKS[network]}`;
  renderPrompts();
}

function refreshNavState() {
  // Top-level secciones (refs / skills)
  $$('.nav-item[data-section]').forEach(item => {
    item.classList.toggle('active', item.dataset.section === state.section);
  });
  // Leaves
  $$('.nav-leaf').forEach(leaf => {
    const isMatch = state.section === 'prompts'
      && leaf.dataset.group === state.group
      && leaf.dataset.network === state.network;
    leaf.classList.toggle('active', isMatch);
  });
  // Parent indicators
  const promptsParent = $('[data-toggle="prompts"]');
  if (promptsParent) promptsParent.classList.toggle('has-current', state.section === 'prompts');
  $$('.nav-subitem.nav-parent').forEach(p => {
    p.classList.toggle('has-current', state.section === 'prompts' && p.dataset.toggle === state.group);
  });
}

// ---------- EVENT WIRING ----------

// Sidebar: parent toggle (only expand/collapse, no navigation)
$$('.nav-parent').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const target = btn.dataset.toggle;
    const children = $(`[data-children="${target}"]`);
    if (!children) return;
    const willOpen = !btn.classList.contains('open');
    btn.classList.toggle('open', willOpen);
    children.classList.toggle('open', willOpen);
  });
});

// Sidebar: leaves (select group + network)
$$('.nav-leaf').forEach(leaf => {
  leaf.addEventListener('click', () => selectPromptCombo(leaf.dataset.group, leaf.dataset.network));
});

// Sidebar: top-level items (refs, skills)
$$('.nav-item[data-section]').forEach(btn => {
  btn.addEventListener('click', () => switchSection(btn.dataset.section));
});

// FAB
$('#fab').addEventListener('click', () => {
  if (state.section === 'prompts') {
    openPromptModal();
  } else if (state.section === 'references') {
    if (state.currentProjectId) openCharacterModal();
    else openProjectModal();
  } else if (state.section === 'skills') {
    $('#skills-file-input').click();
  } else if (state.section === 'networks') {
    addCanvasNode('button');
  }
});

// Canvas toolbar
document.addEventListener('click', (e) => {
  const tool = e.target.closest('.canvas-tool');
  if (!tool) return;
  const add = tool.dataset.add;
  if (add === 'button' || add === 'text') {
    addCanvasNode(add);
  } else if (tool.id === 'canvas-zoom-in' || tool.id === 'canvas-zoom-out') {
    const wrap = $('#canvas-wrap');
    const rect = wrap.getBoundingClientRect();
    const mx = rect.width / 2, my = rect.height / 2;
    const factor = tool.id === 'canvas-zoom-in' ? 1.25 : 0.8;
    const newZoom = Math.max(0.25, Math.min(3, state.canvas.zoom * factor));
    state.canvas.panX = mx - (mx - state.canvas.panX) * (newZoom / state.canvas.zoom);
    state.canvas.panY = my - (my - state.canvas.panY) * (newZoom / state.canvas.zoom);
    state.canvas.zoom = newZoom;
    applyCanvasTransform();
  } else if (tool.id === 'canvas-fit') {
    fitCanvasToContent();
  }
});

// Prompts list delegation
$('#prompts-list').addEventListener('click', (e) => {
  const card = e.target.closest('.prompt-card');
  if (!card) return;
  const id = card.dataset.id;
  const prompt = state.prompts.find(p => p.id === id);
  if (!prompt) return;
  const action = e.target.closest('[data-action]')?.dataset.action;

  if (action === 'edit')   { e.stopPropagation(); openPromptModal(prompt); }
  else if (action === 'delete') {
    e.stopPropagation();
    openConfirm({
      title: 'Удалить промпт?',
      text: `«${prompt.title}» будет удалён без возможности восстановления.`,
      onConfirm: async () => { await dbDelete('prompts', id); await loadPrompts(); toast('Промпт удалён'); },
    });
  } else if (action === 'copy') { e.stopPropagation(); copyToClipboard(prompt.content); }
  else openCopyModal(prompt);
});

// Projects list delegation
$('#projects-list').addEventListener('click', (e) => {
  const card = e.target.closest('.project-card');
  if (!card) return;
  const id = card.dataset.id;
  const project = state.projects.find(p => p.id === id);
  if (!project) return;
  const action = e.target.closest('[data-action]')?.dataset.action;

  if (action === 'edit-project') { e.stopPropagation(); openProjectModal(project); }
  else if (action === 'delete-project') {
    e.stopPropagation();
    openConfirm({
      title: 'Удалить проект?',
      text: `Проект «${project.name}» вместе со всеми персонажами и референсами будет удалён.`,
      onConfirm: async () => {
        const chars = state.characters.filter(c => c.projectId === id);
        for (const c of chars) await dbDeleteWhere('references', 'characterId', c.id);
        await dbDeleteWhere('characters', 'projectId', id);
        await dbDelete('projects', id);
        await loadProjectData();
        renderProjects();
        toast('Проект удалён');
      },
    });
  } else openProject(id);
});

// Characters delegation
$('#characters-list').addEventListener('click', (e) => {
  const charEl = e.target.closest('.character-card');
  if (!charEl) return;
  const charId = charEl.dataset.characterId;
  const character = state.characters.find(c => c.id === charId);
  if (!character) return;
  const refEl  = e.target.closest('.ref-card');
  const action = e.target.closest('[data-action]')?.dataset.action;

  if (action === 'edit-character')   openCharacterModal(character);
  else if (action === 'delete-character') {
    openConfirm({
      title: 'Удалить персонажа?',
      text: `«${character.name}» и все его референсы будут удалены.`,
      onConfirm: async () => {
        await dbDeleteWhere('references', 'characterId', charId);
        await dbDelete('characters', charId);
        await loadProjectData();
        renderProjectDetail();
        toast('Персонаж удалён');
      },
    });
  } else if (action === 'add-ref') openReferenceModal(charId);
  else if (action === 'edit-ref' && refEl) {
    const ref = state.references.find(r => r.id === refEl.dataset.refId);
    if (ref) openReferenceModal(charId, ref);
  } else if (action === 'delete-ref' && refEl) {
    const refId = refEl.dataset.refId;
    openConfirm({
      title: 'Удалить референс?',
      text: 'Это действие нельзя отменить.',
      onConfirm: async () => {
        await dbDelete('references', refId);
        await loadProjectData();
        renderProjectDetail();
        toast('Референс удалён');
      },
    });
  } else if (action === 'view-ref' && refEl) {
    const ref = state.references.find(r => r.id === refEl.dataset.refId);
    if (ref) openReferenceViewer(ref);
  }
});

// Skills delegation
$('#skills-list').addEventListener('click', (e) => {
  const card = e.target.closest('.skill-card');
  if (!card) return;
  const id = card.dataset.id;
  const skill = state.skills.find(s => s.id === id);
  if (!skill) return;
  const action = e.target.closest('[data-action]')?.dataset.action;

  if (action === 'edit-skill')   { e.stopPropagation(); openSkillRenameModal(skill); }
  else if (action === 'download-skill') { e.stopPropagation(); downloadText(skill.fileName, skill.content); }
  else if (action === 'copy-skill') { e.stopPropagation(); copyToClipboard(skill.content); }
  else if (action === 'delete-skill') {
    e.stopPropagation();
    openConfirm({
      title: 'Удалить скилл?',
      text: `«${skill.name}» будет удалён.`,
      onConfirm: async () => { await dbDelete('skills', id); await loadSkills(); toast('Скилл удалён'); },
    });
  } else openSkillViewer(skill);
});

// Skills upload zone
const skillsZone  = $('#skills-upload-zone');
const skillsInput = $('#skills-file-input');
skillsInput.addEventListener('change', (e) => { importSkillFiles(e.target.files); e.target.value = ''; });
skillsZone.addEventListener('dragover',  (e) => { e.preventDefault(); skillsZone.classList.add('dragging'); });
skillsZone.addEventListener('dragleave', () => skillsZone.classList.remove('dragging'));
skillsZone.addEventListener('drop',      (e) => {
  e.preventDefault();
  skillsZone.classList.remove('dragging');
  importSkillFiles(e.dataTransfer.files);
});

// Back to projects
$('#back-to-projects').addEventListener('click', () => showProjectsView());

// Modal close
$('#modal-overlay').addEventListener('click', (e) => {
  if (e.target.id === 'modal-overlay' || e.target.dataset.close !== undefined || e.target.id === 'modal-close') {
    closeModal();
  }
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (!$('#modal-overlay').hidden) closeModal();
    else if (!$('#search-results').hidden) closeSearchResults();
  }
});

// Mobile menu
$('#menu-toggle').addEventListener('click', () => $('#sidebar').classList.toggle('open'));
document.addEventListener('click', (e) => {
  const sb = $('#sidebar');
  const tg = $('#menu-toggle');
  if (sb.classList.contains('open') && !sb.contains(e.target) && !tg.contains(e.target)) {
    sb.classList.remove('open');
  }
});

// Search
const searchInput = $('#global-search');
const searchClear = $('#search-clear');
const searchKbd   = $('#search-kbd');
let searchTimer = null;
searchInput.addEventListener('input', (e) => {
  const v = e.target.value;
  searchClear.hidden = !v;
  if (searchKbd) searchKbd.hidden = !!v;
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => renderSearchResults(v), 120);
});
searchInput.addEventListener('focus', () => {
  if (searchInput.value.trim()) renderSearchResults(searchInput.value);
});
searchClear.addEventListener('click', () => {
  searchInput.value = '';
  searchClear.hidden = true;
  if (searchKbd) searchKbd.hidden = false;
  $('#search-results').hidden = true;
  searchInput.focus();
});
// Ctrl/Cmd+K — focus search
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    searchInput.focus();
    searchInput.select();
  }
});
$('#search-results').addEventListener('click', (e) => {
  const item = e.target.closest('.search-item');
  if (!item) return;
  navigateToSearchResult(item.dataset.kind, item.dataset.id, { projectId: item.dataset.projectId });
});
document.addEventListener('click', (e) => {
  if (!e.target.closest('.search-wrap')) {
    $('#search-results').hidden = true;
  }
});

// Export / Import
$('#export-btn').addEventListener('click', async () => {
  const data = {
    version: 3,
    exportedAt: new Date().toISOString(),
    prompts:    await dbGetAll('prompts'),
    projects:   await dbGetAll('projects'),
    characters: await dbGetAll('characters'),
    references: await dbGetAll('references'),
    skills:     await dbGetAll('skills'),
    canvas_nodes: await dbGetAll('canvas_nodes'),
    canvas_edges: await dbGetAll('canvas_edges'),
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ai-prompt-director-${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  toast('Экспорт готов');
});

$('#import-btn').addEventListener('click', () => $('#import-file').click());
$('#import-file').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const text = await file.text();
    const data = JSON.parse(text);
    openConfirm({
      title: 'Импортировать данные?',
      text: 'Существующие записи будут дополнены или заменены при совпадении ID.',
      confirmText: 'Импорт',
      onConfirm: async () => {
        for (const p of data.prompts      || []) await dbPut('prompts',      normalizePrompt(p));
        for (const p of data.projects     || []) await dbPut('projects',     p);
        for (const c of data.characters   || []) await dbPut('characters',   c);
        for (const r of data.references   || []) await dbPut('references',   r);
        for (const s of data.skills       || []) await dbPut('skills',       s);
        for (const n of data.canvas_nodes || []) await dbPut('canvas_nodes', n);
        for (const c of data.canvas_edges || []) await dbPut('canvas_edges', c);
        await loadPrompts();
        await loadProjectData();
        await loadSkills();
        await loadCanvas();
        if (state.section === 'references' && state.currentProjectId) renderProjectDetail();
        else if (state.section === 'references') renderProjects();
        toast('Импорт завершён');
      },
    });
  } catch { toast('Неверный файл', 'error'); }
  finally { e.target.value = ''; }
});

// ---------- INIT ----------
(async function init() {
  try {
    db = await openDB();
    await loadPrompts();
    await loadProjectData();
    await loadSkills();
    state.canvas.nodes = await dbGetAll('canvas_nodes');
    state.canvas.edges = await dbGetAll('canvas_edges');
    selectPromptCombo(DEFAULT_GROUP, DEFAULT_NETWORK);
  } catch (err) {
    console.error(err);
    toast('Ошибка инициализации БД', 'error');
  }
})();
