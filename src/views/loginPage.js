const { esc } = require('../utils');

function renderLoginPage({ error } = {}) {
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
  <title>QuickLib — Connexion</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@picocss/pico@2/css/pico.classless.min.css">
  <style>
    body { display: flex; align-items: center; justify-content: center; min-height: 100dvh; }
    main { width: 100%; max-width: 360px; padding: 2rem; }
    h1   { text-align: center; margin-bottom: 1.5rem; font-size: 1.5rem; }
    .error { color: var(--pico-color-red-500); margin-bottom: 1rem; font-size: 0.9rem; }
  </style>
  <script>
    (function(){
      var t = null;
      try { t = localStorage.getItem('ql_theme'); } catch(_) {}
      if (t !== 'light' && t !== 'dark') {
        t = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      document.documentElement.setAttribute('data-theme', t);
    })();
  </script>
</head>
<body>
  <main>
    <h1>QuickLib</h1>
    <form method="post" action="/login">
      <label>
        Identifiant
        <input type="text" name="username" autocomplete="username" autofocus required>
      </label>
      <label>
        Mot de passe
        <input type="password" name="password" autocomplete="current-password" required>
      </label>
      ${error ? `<p class="error">${esc(error)}</p>` : ''}
      <button type="submit">Se connecter</button>
    </form>
  </main>
</body>
</html>`;
}

module.exports = { renderLoginPage };
