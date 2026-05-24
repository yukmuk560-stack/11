/* ============================================================
   AI PROMPT DIRECTOR - APP LOGIC
   Хранение: IndexedDB (промпты, проекты, персонажи, референсы)
   ============================================================ */

// ---------- ICONS (SVG strings) ----------
const ICONS = {
  copy:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
  edit:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
  trash:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/></svg>',
  folder: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>',
  upload: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>',
  empty:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
  image:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>',
};

// ---------- STATE ----------
const state = {
  section: 'prompts',
  network: 'seedance',
  currentProjectId: null,
  prompts: [],
  projects: [],
  characters: [],
  references: [],
};

// ---------- INDEXED DB ----------
const DB_NAME = 'ai-prompt-director';
const DB_VERSION = 1;
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
      if (!_db.objectStoreNames.contains('projects')) {
        _db.createObjectStore('projects', { keyPath: 'id' });
      }
      if (!_db.objectStoreNames.contains('characters')) {
        const s = _db.createObjectStore('characters', { keyPath: 'id' });
        s.createIndex('projectId', 'projectId', { unique: false });
      }
      if (!_db.objectStoreNames.contains('references')) {
        const s = _db.createObjectStore('references', { keyPath: 'id' });
        s.createIndex('characterId', 'characterId', { unique: false });
      }
    };
    req.onsuccess = (e) => resolve(e.target.result);
    req.onerror = (e) => reject(e.target.error);
  });
}

function tx(storeName, mode = 'readonly') {
  return db.transaction(storeName, mode).objectStore(storeName);
}

function dbGetAll(store) {
  return new Promise((resolve, reject) => {
    const r = tx(store).getAll();
    r.onsuccess = () => resolve(r.result);
    r.onerror   = () => reject(r.error);
  });
}

function dbPut(store, item) {
  return new Promise((resolve, reject) => {
    const r = tx(store, 'readwrite').put(item);
    r.onsuccess = () => resolve(item);
    r.onerror   = () => reject(r.error);
  });
}

function dbDelete(store, id) {
  return new Promise((resolve, reject) => {
    const r = tx(store, 'readwrite').delete(id);
    r.onsuccess = () => resolve();
    r.onerror   = () => reject(r.error);
  });
}

async function dbDeleteWhere(store, indexName, value) {
  const s = tx(store, 'readwrite');
  return new Promise((resolve, reject) => {
    const idx = s.index(indexName);
    const req = idx.openCursor(IDBKeyRange.only(value));
    req.onsuccess = (e) => {
      const cur = e.target.result;
      if (cur) { cur.delete(); cur.continue(); }
      else resolve();
    };
    req.onerror = () => reject(req.error);
  });
}

// ---------- HELPERS ----------
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

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
  // force reflow
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
  } catch (e) {
    // fallback
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); toast('Скопировано'); }
    catch { toast('Не удалось скопировать', 'error'); }
    ta.remove();
  }
}

function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

// ---------- MODAL ----------
function openModal(html, { wide = false } = {}) {
  const overlay = $('#modal-overlay');
  const modal = $('#modal');
  modal.classList.toggle('modal-wide', wide);
  $('#modal-body').innerHTML = html;
  overlay.hidden = false;
  // focus first input
  setTimeout(() => {
    const f = $('#modal-body input, #modal-body textarea');
    if (f) f.focus();
  }, 50);
}

function closeModal() {
  $('#modal-overlay').hidden = true;
  $('#modal-body').innerHTML = '';
}

// ---------- PROMPTS RENDERING ----------
async function loadPrompts() {
  state.prompts = await dbGetAll('prompts');
  renderPrompts();
}

function renderPrompts() {
  const list = $('#prompts-list');
  const filtered = state.prompts
    .filter(p => p.network === state.network)
    .sort((a, b) => b.createdAt - a.createdAt);

  if (!filtered.length) {
    list.innerHTML = `
      <div class="empty">
        <div class="empty-icon">${ICONS.empty}</div>
        <div class="empty-title">Здесь пока нет промптов</div>
        <div class="empty-text">Нажмите <b>+</b> чтобы добавить первый</div>
      </div>`;
    return;
  }

  list.innerHTML = filtered.map(p => `
    <article class="prompt-card" data-id="${p.id}">
      <div class="prompt-card-header">
        <div class="prompt-title">${escapeHtml(p.title || 'Без названия')}</div>
      </div>
      <div class="prompt-content">${escapeHtml(p.content)}</div>
      <div class="prompt-actions">
        <button class="icon-btn icon-edit" data-action="edit" title="Редактировать">${ICONS.edit}</button>
        <button class="icon-btn icon-delete" data-action="delete" title="Удалить">${ICONS.trash}</button>
        <button class="btn-copy-main" data-action="copy">${ICONS.copy}<span>Копировать</span></button>
      </div>
    </article>
  `).join('');
}

function promptFormHTML(prompt = null) {
  const isEdit = !!prompt;
  return `
    <h2>${isEdit ? 'Редактировать промпт' : 'Новый промпт'}</h2>
    <form id="prompt-form">
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
      id: prompt?.id || uid(),
      network: state.network,
      title: (fd.get('title') || '').toString().trim(),
      content: (fd.get('content') || '').toString().trim(),
      createdAt: prompt?.createdAt || Date.now(),
      updatedAt: Date.now(),
    };
    await dbPut('prompts', item);
    closeModal();
    await loadPrompts();
    toast(prompt ? 'Промпт обновлён' : 'Промпт создан');
  });
}

function openCopyModal(prompt) {
  openModal(`
    <h2>${escapeHtml(prompt.title || 'Промпт')}</h2>
    <div class="copy-block" id="copy-block">${escapeHtml(prompt.content)}</div>
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
  $('#confirm-yes').addEventListener('click', async () => {
    await onConfirm();
    closeModal();
  });
}

// ---------- PROJECTS / CHARACTERS / REFERENCES ----------
async function loadProjectData() {
  state.projects = await dbGetAll('projects');
  state.characters = await dbGetAll('characters');
  state.references = await dbGetAll('references');
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
    const refCount = state.references.filter(r => {
      const c = state.characters.find(x => x.id === r.characterId);
      return c && c.projectId === p.id;
    }).length;
    return `
      <article class="project-card" data-id="${p.id}">
        <div class="project-icon">${ICONS.folder}</div>
        <div class="project-name">${escapeHtml(p.name)}</div>
        <div class="project-meta">
          <div class="project-stats">${charCount} перс. · ${refCount} реф.</div>
          <div style="display: flex; gap: 4px;">
            <button class="icon-btn icon-edit" data-action="edit-project" title="Переименовать">${ICONS.edit}</button>
            <button class="icon-btn icon-delete" data-action="delete-project" title="Удалить">${ICONS.trash}</button>
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
    const item = {
      id: project?.id || uid(),
      name,
      createdAt: project?.createdAt || Date.now(),
    };
    await dbPut('projects', item);
    closeModal();
    await loadProjectData();
    if (state.currentProjectId === item.id) {
      renderProjectDetail();
    } else {
      renderProjects();
    }
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

  const totalRefs = state.references.filter(r =>
    characters.some(c => c.id === r.characterId)
  ).length;
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
            <button class="icon-btn icon-edit" data-action="edit-character" title="Переименовать">${ICONS.edit}</button>
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
                <button class="icon-btn icon-edit" data-action="edit-ref" title="Изменить ракурс">${ICONS.edit}</button>
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
    const zone = $('#upload-zone');
    const input = $('#file-input');
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
      } catch {
        toast('Не удалось прочитать файл', 'error');
      }
    };

    input.addEventListener('change', (e) => handleFile(e.target.files[0]));
    zone.addEventListener('dragover', (e) => { e.preventDefault(); zone.classList.add('dragging'); });
    zone.addEventListener('dragleave', () => zone.classList.remove('dragging'));
    zone.addEventListener('drop', (e) => {
      e.preventDefault();
      zone.classList.remove('dragging');
      handleFile(e.dataTransfer.files[0]);
    });
  }

  $('#reference-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!imageData) {
      toast('Сначала добавьте изображение', 'error');
      return;
    }
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
  openModal(`
    <h2>${escapeHtml(reference.angle || 'Референс')}</h2>
    <div class="image-preview"><img src="${reference.imageData}" /></div>
    <div class="modal-actions">
      <button class="btn btn-secondary" data-close>Закрыть</button>
    </div>
  `, { wide: true });
}

// ---------- EVENT HANDLERS ----------

// Sidebar nav
$$('.nav-item').forEach(btn => {
  btn.addEventListener('click', () => {
    const sec = btn.dataset.section;
    state.section = sec;
    $$('.nav-item').forEach(n => n.classList.toggle('active', n === btn));
    $$('.section').forEach(s => s.classList.toggle('active', s.id === `${sec}-section`));
    $('#sidebar').classList.remove('open');
    if (sec === 'references') showProjectsView();
  });
});

// Tabs
function moveTabIndicator() {
  const active = $('.tab.active');
  const indicator = $('#tab-indicator');
  if (!active || !indicator) return;
  indicator.style.width = `${active.offsetWidth}px`;
  indicator.style.left  = `${active.offsetLeft}px`;
}

$$('.tab').forEach(t => {
  t.addEventListener('click', () => {
    $$('.tab').forEach(x => x.classList.remove('active'));
    t.classList.add('active');
    state.network = t.dataset.network;
    moveTabIndicator();
    renderPrompts();
  });
});

// FAB
$('#fab').addEventListener('click', () => {
  if (state.section === 'prompts') {
    openPromptModal();
  } else {
    if (state.currentProjectId) {
      openCharacterModal();
    } else {
      openProjectModal();
    }
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

  if (action === 'edit') {
    e.stopPropagation();
    openPromptModal(prompt);
  } else if (action === 'delete') {
    e.stopPropagation();
    openConfirm({
      title: 'Удалить промпт?',
      text: `«${prompt.title}» будет удалён без возможности восстановления.`,
      onConfirm: async () => {
        await dbDelete('prompts', id);
        await loadPrompts();
        toast('Промпт удалён');
      },
    });
  } else if (action === 'copy') {
    e.stopPropagation();
    copyToClipboard(prompt.content);
  } else {
    // open copy modal
    openCopyModal(prompt);
  }
});

// Projects list delegation
$('#projects-list').addEventListener('click', (e) => {
  const card = e.target.closest('.project-card');
  if (!card) return;
  const id = card.dataset.id;
  const project = state.projects.find(p => p.id === id);
  if (!project) return;

  const action = e.target.closest('[data-action]')?.dataset.action;

  if (action === 'edit-project') {
    e.stopPropagation();
    openProjectModal(project);
  } else if (action === 'delete-project') {
    e.stopPropagation();
    openConfirm({
      title: 'Удалить проект?',
      text: `Проект «${project.name}» вместе со всеми персонажами и референсами будет удалён.`,
      onConfirm: async () => {
        const chars = state.characters.filter(c => c.projectId === id);
        for (const c of chars) {
          await dbDeleteWhere('references', 'characterId', c.id);
        }
        await dbDeleteWhere('characters', 'projectId', id);
        await dbDelete('projects', id);
        await loadProjectData();
        renderProjects();
        toast('Проект удалён');
      },
    });
  } else {
    openProject(id);
  }
});

// Characters list delegation
$('#characters-list').addEventListener('click', (e) => {
  const charEl = e.target.closest('.character-card');
  if (!charEl) return;
  const charId = charEl.dataset.characterId;
  const character = state.characters.find(c => c.id === charId);
  if (!character) return;

  const refEl = e.target.closest('.ref-card');
  const action = e.target.closest('[data-action]')?.dataset.action;

  if (action === 'edit-character') {
    openCharacterModal(character);
  } else if (action === 'delete-character') {
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
  } else if (action === 'add-ref') {
    openReferenceModal(charId);
  } else if (action === 'edit-ref' && refEl) {
    const ref = state.references.find(r => r.id === refEl.dataset.refId);
    if (ref) openReferenceModal(charId, ref);
  } else if (action === 'delete-ref' && refEl) {
    const refId = refEl.dataset.refId;
    openConfirm({
      title: 'Удалить референс?',
      text: 'Это действие нельзя отменить.',
      confirmText: 'Удалить',
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

// Back to projects
$('#back-to-projects').addEventListener('click', () => showProjectsView());

// Modal close
$('#modal-overlay').addEventListener('click', (e) => {
  if (e.target.id === 'modal-overlay' || e.target.dataset.close !== undefined || e.target.id === 'modal-close') {
    closeModal();
  }
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !$('#modal-overlay').hidden) closeModal();
});

// Mobile menu toggle
$('#menu-toggle').addEventListener('click', () => $('#sidebar').classList.toggle('open'));
document.addEventListener('click', (e) => {
  const sb = $('#sidebar');
  const tg = $('#menu-toggle');
  if (sb.classList.contains('open') && !sb.contains(e.target) && !tg.contains(e.target)) {
    sb.classList.remove('open');
  }
});

// Export / Import
$('#export-btn').addEventListener('click', async () => {
  const data = {
    version: 1,
    exportedAt: new Date().toISOString(),
    prompts: await dbGetAll('prompts'),
    projects: await dbGetAll('projects'),
    characters: await dbGetAll('characters'),
    references: await dbGetAll('references'),
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
      text: 'Существующие записи будут дополнены или заменены при совпадении ID. Продолжить?',
      confirmText: 'Импорт',
      onConfirm: async () => {
        for (const p of data.prompts || []) await dbPut('prompts', p);
        for (const p of data.projects || []) await dbPut('projects', p);
        for (const c of data.characters || []) await dbPut('characters', c);
        for (const r of data.references || []) await dbPut('references', r);
        await loadPrompts();
        if (state.section === 'references') {
          await loadProjectData();
          if (state.currentProjectId) renderProjectDetail();
          else renderProjects();
        }
        toast('Импорт завершён');
      },
    });
  } catch {
    toast('Неверный файл', 'error');
  } finally {
    e.target.value = '';
  }
});

window.addEventListener('resize', moveTabIndicator);

// ---------- INIT ----------
(async function init() {
  try {
    db = await openDB();
    await loadPrompts();
    await loadProjectData();
    moveTabIndicator();
  } catch (err) {
    console.error(err);
    toast('Ошибка инициализации БД', 'error');
  }
})();
