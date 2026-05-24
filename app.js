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

// ---------- GROUPS / NETWORKS DICTIONARIES ----------
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
};

// ---------- INDEXED DB ----------
const DB_NAME = 'ai-prompt-director';
const DB_VERSION = 2; // bumped to add `skills`
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
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
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
function openModal(html, { wide = false, xl = false } = {}) {
  const overlay = $('#modal-overlay');
  const modal = $('#modal');
  modal.classList.toggle('modal-wide', wide);
  modal.classList.toggle('modal-xl', xl);
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
  // persist defaults for legacy records
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
        <div class="empty-text">Раздел: <b>${escapeHtml(NETWORKS[state.network])}</b> · ${escapeHtml(GROUPS[state.group])}<br>Нажмите <b>+</b> чтобы добавить первый</div>
      </div>`;
    return;
  }

  list.innerHTML = filtered.map(p => `
    <article class="prompt-card" data-id="${p.id}">
      <div class="prompt-card-header">
        <span class="prompt-theme ${p.theme ? '' : 'empty'}">${escapeHtml(p.theme || 'без темы')}</span>
        <div class="prompt-title">${escapeHtml(p.title || 'Без названия')}</div>
      </div>
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
      <div class="field-row">
        <div class="field">
          <label>Нейросеть</label>
          <select class="select" name="network" required>
            ${Object.entries(NETWORKS).map(([k, v]) => `<option value="${k}" ${sel(k, prompt?.network || state.network)}>${escapeHtml(v)}</option>`).join('')}
          </select>
        </div>
        <div class="field">
          <label>Группа</label>
          <select class="select" name="group" required>
            ${Object.entries(GROUPS).map(([k, v]) => `<option value="${k}" ${sel(k, prompt?.group || state.group)}>${escapeHtml(v)}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="field">
        <label>Тема <span style="text-transform:none; color:var(--text-muted); font-weight:500;">— о чём промпт</span></label>
        <input class="input" name="theme" maxlength="80" value="${escapeHtml(prompt?.theme || '')}" placeholder="Например: Природа, Портрет, Городской пейзаж" />
      </div>
      <div class="field">
        <label>Название</label>
        <input class="input" name="title" maxlength="120" required value="${escapeHtml(prompt?.title || '')}" placeholder="Например: Cinematic close-up at golden hour" />
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
    // переключим на тот раздел/группу, куда сохранили
    setNetwork(item.network);
    setGroup(item.group);
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
  `, { wide: true });

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
  `);
  $('#confirm-yes').addEventListener('click', async () => { await onConfirm(); closeModal(); });
}

// ---------- PROJECTS / CHARACTERS / REFERENCES ----------
async function loadProjectData() {
  state.projects   = await dbGetAll('projects');
  state.characters = await dbGetAll('characters');
  state.references = await dbGetAll('references');
}

function getProjectPreview(projectId) {
  const charIds = state.characters
    .filter(c => c.projectId === projectId)
    .map(c => c.id);
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
          ${preview
            ? `<img src="${preview}" alt="${escapeHtml(p.name)}" loading="lazy" />`
            : ICONS.folder}
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
  `);
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
  `);
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
  `, { wide: true });

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
  `, { wide: true });
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
  `, { xl: true });

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
  `);
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

  const results = { prompts: [], projects: [], characters: [], references: [], skills: [] };

  for (const p of state.prompts) {
    const hay = `${p.title} ${p.content} ${p.theme}`.toLowerCase();
    if (hay.includes(q)) results.prompts.push(p);
  }
  for (const p of state.projects) {
    if (p.name.toLowerCase().includes(q)) results.projects.push(p);
  }
  for (const c of state.characters) {
    if (c.name.toLowerCase().includes(q)) results.characters.push(c);
  }
  for (const r of state.references) {
    if ((r.angle || '').toLowerCase().includes(q)) results.references.push(r);
  }
  for (const s of state.skills) {
    const hay = `${s.name} ${s.fileName} ${s.content}`.toLowerCase();
    if (hay.includes(q)) results.skills.push(s);
  }

  return results;
}

function renderSearchResults(query) {
  const wrap = $('#search-results');
  if (!query.trim()) { wrap.hidden = true; wrap.innerHTML = ''; return; }

  const r = searchAll(query);
  const empty = ['prompts', 'projects', 'characters', 'references', 'skills'].every(k => !r[k].length);

  if (empty) {
    wrap.innerHTML = `<div class="search-empty">Ничего не найдено по запросу <b>«${escapeHtml(query)}»</b></div>`;
    wrap.hidden = false;
    return;
  }

  const groups = [];

  if (r.prompts.length) {
    groups.push({
      title: `Промпты (${r.prompts.length})`,
      items: r.prompts.slice(0, 5).map(p => ({
        kind: 'prompt', id: p.id,
        icon: ICONS.doc,
        title: highlight(p.title || 'Без названия', query),
        meta: `${NETWORKS[p.network]} · ${GROUPS[p.group]}${p.theme ? ' · ' + highlight(p.theme, query) : ''}`,
      })),
    });
  }
  if (r.projects.length) {
    groups.push({
      title: `Проекты (${r.projects.length})`,
      items: r.projects.slice(0, 5).map(p => ({
        kind: 'project', id: p.id,
        icon: ICONS.folder,
        title: highlight(p.name, query),
        meta: `${state.characters.filter(c => c.projectId === p.id).length} персонажей`,
      })),
    });
  }
  if (r.characters.length) {
    groups.push({
      title: `Персонажи (${r.characters.length})`,
      items: r.characters.slice(0, 5).map(c => {
        const pr = state.projects.find(x => x.id === c.projectId);
        return {
          kind: 'character', id: c.id, projectId: c.projectId,
          icon: ICONS.user,
          title: highlight(c.name, query),
          meta: `Проект: ${pr ? escapeHtml(pr.name) : '—'}`,
        };
      }),
    });
  }
  if (r.references.length) {
    groups.push({
      title: `Референсы (${r.references.length})`,
      items: r.references.slice(0, 5).map(ref => {
        const ch = state.characters.find(c => c.id === ref.characterId);
        const pr = ch ? state.projects.find(p => p.id === ch.projectId) : null;
        return {
          kind: 'reference', id: ref.id,
          icon: ICONS.image,
          title: highlight(ref.angle || 'Без подписи', query),
          meta: `${pr ? escapeHtml(pr.name) : ''} ${ch ? '· ' + escapeHtml(ch.name) : ''}`.trim(),
        };
      }),
    });
  }
  if (r.skills.length) {
    groups.push({
      title: `Скиллы (${r.skills.length})`,
      items: r.skills.slice(0, 5).map(s => ({
        kind: 'skill', id: s.id,
        icon: ICONS.star,
        title: highlight(s.name, query),
        meta: escapeHtml(s.fileName),
      })),
    });
  }

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
    switchSection('prompts');
    setNetwork(p.network);
    setGroup(p.group);
    renderPrompts();
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
  }
  closeSearchResults();
}

function closeSearchResults() {
  $('#search-results').hidden = true;
  $('#global-search').value = '';
  $('#search-clear').hidden = true;
}

// ---------- SECTION / NETWORK / GROUP SWITCHING ----------
function switchSection(name) {
  state.section = name;
  $$('.nav-item').forEach(n => n.classList.toggle('active', n.dataset.section === name));
  $$('.section').forEach(s => s.classList.toggle('active', s.id === `${name}-section`));
  $('#sidebar').classList.remove('open');
  if (name === 'references') showProjectsView();
  if (name === 'skills') renderSkills();
  // recompute indicators after section becomes visible
  setTimeout(moveTabIndicators, 0);
}

function setNetwork(net) {
  if (!NETWORKS[net]) return;
  state.network = net;
  $$('.network-tabs .tab').forEach(t => t.classList.toggle('active', t.dataset.network === net));
  moveTabIndicators();
}

function setGroup(g) {
  if (!GROUPS[g]) return;
  state.group = g;
  $$('.group-tabs .tab').forEach(t => t.classList.toggle('active', t.dataset.group === g));
  moveTabIndicators();
}

function moveTabIndicators() {
  $$('.tabs').forEach(tabsEl => {
    const active = tabsEl.querySelector('.tab.active');
    const indicator = tabsEl.querySelector('.tab-indicator');
    if (!active || !indicator) return;
    indicator.style.width = `${active.offsetWidth}px`;
    indicator.style.left  = `${active.offsetLeft}px`;
  });
}

// ---------- EVENT WIRING ----------
$$('.nav-item').forEach(btn => {
  btn.addEventListener('click', () => switchSection(btn.dataset.section));
});

$$('.network-tabs .tab').forEach(t => {
  t.addEventListener('click', () => { setNetwork(t.dataset.network); renderPrompts(); });
});
$$('.group-tabs .tab').forEach(t => {
  t.addEventListener('click', () => { setGroup(t.dataset.group); renderPrompts(); });
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
let searchTimer = null;
searchInput.addEventListener('input', (e) => {
  const v = e.target.value;
  searchClear.hidden = !v;
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => renderSearchResults(v), 120);
});
searchInput.addEventListener('focus', () => {
  if (searchInput.value.trim()) renderSearchResults(searchInput.value);
});
searchClear.addEventListener('click', () => {
  searchInput.value = '';
  searchClear.hidden = true;
  $('#search-results').hidden = true;
  searchInput.focus();
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
    version: 2,
    exportedAt: new Date().toISOString(),
    prompts:    await dbGetAll('prompts'),
    projects:   await dbGetAll('projects'),
    characters: await dbGetAll('characters'),
    references: await dbGetAll('references'),
    skills:     await dbGetAll('skills'),
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
        for (const p of data.prompts    || []) await dbPut('prompts',    normalizePrompt(p));
        for (const p of data.projects   || []) await dbPut('projects',   p);
        for (const c of data.characters || []) await dbPut('characters', c);
        for (const r of data.references || []) await dbPut('references', r);
        for (const s of data.skills     || []) await dbPut('skills',     s);
        await loadPrompts();
        await loadProjectData();
        await loadSkills();
        if (state.section === 'references' && state.currentProjectId) renderProjectDetail();
        else if (state.section === 'references') renderProjects();
        toast('Импорт завершён');
      },
    });
  } catch { toast('Неверный файл', 'error'); }
  finally { e.target.value = ''; }
});

window.addEventListener('resize', moveTabIndicators);

// ---------- INIT ----------
(async function init() {
  try {
    db = await openDB();
    await loadPrompts();
    await loadProjectData();
    await loadSkills();
    moveTabIndicators();
  } catch (err) {
    console.error(err);
    toast('Ошибка инициализации БД', 'error');
  }
})();
