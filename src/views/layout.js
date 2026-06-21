const { esc, buildUrl }  = require('../utils');
const { authEnabled }    = require('../auth');

const ICON_GRID = `<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
  <rect x="1" y="1" width="6" height="6" rx="1"/>
  <rect x="9" y="1" width="6" height="6" rx="1"/>
  <rect x="1" y="9" width="6" height="6" rx="1"/>
  <rect x="9" y="9" width="6" height="6" rx="1"/>
</svg>`;

const ICON_LIST = `<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
  <rect x="2" y="2"    width="12" height="2.5" rx="1.25"/>
  <rect x="2" y="6.75" width="12" height="2.5" rx="1.25"/>
  <rect x="2" y="11.5" width="12" height="2.5" rx="1.25"/>
</svg>`;

const ICON_THEME = `<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
  <path d="M8 2.5a5.5 5.5 0 1 0 0 11V2.5z"/>
  <circle cx="8" cy="8" r="5.5" fill="none" stroke="currentColor" stroke-width="1.5"/>
</svg>`;

const ICON_LOGOUT = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <path d="M6 2H3a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>
  <path d="M10.5 11 14 8l-3.5-3"/>
  <line x1="14" y1="8" x2="6" y2="8"/>
</svg>`;

const SORT_LABELS = {
  recent:      'Récents',
  title_asc:   'Titre A→Z',
  title_desc:  'Titre Z→A',
  author_asc:  'Auteur A→Z',
  author_desc: 'Auteur Z→A',
};

function renderPage({ content, topPagination, bottomPagination, search, author, tags, sort, perPage, view, total }) {
  const q = esc(search);
  const a = esc(author || '');
  const t = esc(tags || '');

  const sortOptions = Object.entries(SORT_LABELS).map(([val, label]) =>
    `<option value="${val}"${sort === val ? ' selected' : ''}>${label}</option>`
  ).join('');

  const gridUrl = buildUrl({ q: search, author, tags, sort, per_page: perPage, view: 'grid', page: 1 });
  const listUrl = buildUrl({ q: search, author, tags, sort, per_page: perPage, view: 'list', page: 1 });

  const logoutBtn = authEnabled ? `
      <form method="post" action="/logout" class="inline-form">
        <button id="button-logout" type="submit" class="icon-btn" title="Se déconnecter" aria-label="Se déconnecter">${ICON_LOGOUT}</button>
      </form>` : '';

  return `<!DOCTYPE html>
<html lang="fr" data-theme="auto">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="icon" type="image/svg+xml" href="/favicon/favicon.svg">
  <link rel="icon" type="image/png" sizes="96x96" href="/favicon/favicon-96x96.png">
  <link rel="shortcut icon" href="/favicon/favicon.ico">
  <link rel="apple-touch-icon" href="/favicon/apple-touch-icon.png">
  <link rel="manifest" href="/favicon/site.webmanifest">
  <title>QuickLib</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@picocss/pico@2/css/pico.classless.min.css">
  <link rel="stylesheet" href="/app.css">
</head>
<body>
  <header>
    <div class="header-inner">
      <a href="/" class="site-title" data-home-url="${buildUrl({ view, per_page: perPage })}">QuickLib</a>
      <div class="header-bar">
        <form id="search-form" method="get" action="/" role="search">
          <input type="hidden" name="sort"     value="${esc(sort)}">
          <input type="hidden" name="per_page" value="${perPage}">
          <input type="hidden" name="view"     value="${esc(view)}">
          <input type="hidden" name="page"     value="1">
          <input type="search" name="q" value="${q}" placeholder="Rechercher…" aria-label="Rechercher dans la bibliothèque">
        </form>
        <div class="header-actions">
          <a href="${gridUrl}" class="view-btn${view === 'grid' ? ' active' : ''}" title="Grille">${ICON_GRID}</a>
          <a href="${listUrl}" class="view-btn${view === 'list' ? ' active' : ''}" title="Liste">${ICON_LIST}</a>
          <button id="theme-toggle" class="icon-btn" type="button" title="Changer le thème" aria-label="Changer le thème">${ICON_THEME}</button>${logoutBtn}
        </div>
      </div>
    </div>
  </header>

  <main>
    <div class="controls-bar">
      <span class="result-count">${total.toLocaleString('fr-FR')} livre${total !== 1 ? 's' : ''}</span>
      <form id="controls-form" method="get" action="/">
        <input type="hidden" name="q"        value="${q}">
        ${a ? `<input type="hidden" name="author" value="${a}">` : ''}
        ${t ? `<input type="hidden" name="tags" value="${t}">` : ''}
        <input type="hidden" name="page"     value="1">
        <input type="hidden" name="view"     value="${esc(view)}">
        <input type="hidden" name="per_page" value="${perPage}">
        <select name="sort" aria-label="Tri">
          ${sortOptions}
        </select>
        <div class="tags-dropdown-wrapper">
          <button id="tags-dropdown-btn" class="tags-dropdown-btn" type="button" aria-haspopup="listbox">
            Tags<span id="tags-count-badge" class="tags-count-badge"></span>
          </button>
          <div id="tags-dropdown" class="tags-dropdown-panel" hidden>
            <input type="text" id="tags-filter" class="tags-filter-input" placeholder="Filtrer les tags…" autocomplete="off">
            <div id="tags-list" class="tags-list"></div>
            <div class="tags-actions">
              <button id="tags-reset" type="button" class="tags-action-btn tags-reset-btn" hidden>Réinitialiser</button>
              <button id="tags-apply" type="button" class="tags-action-btn tags-apply-btn">Appliquer</button>
            </div>
          </div>
        </div>
      </form>
    </div>

    ${topPagination}
    ${content}
    ${bottomPagination}
  </main>

  <dialog id="book-modal" aria-labelledby="modal-title">
    <article>
      <header>
        <button id="modal-close" rel="prev" aria-label="Fermer"></button>
        <strong id="modal-title"></strong>
      </header>
      <div id="modal-content"></div>
    </article>
  </dialog>

  <script src="/app.js"></script>
</body>
</html>`;
}

module.exports = { renderPage };
