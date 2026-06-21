const express = require('express');
const http    = require('http');
const path    = require('path');
const session = require('express-session');
const { FileSessionStore } = require('./sessionStore');

const app  = express();
const PORT = process.env.PORT || 9095;

const sessionSecret  = process.env.SESSION_SECRET;
const maxAgeDays     = parseInt(process.env.SESSION_MAX_AGE_DAYS) || 30;

if (!sessionSecret) {
  console.warn('[quicklib] SESSION_SECRET not set — using insecure default, set it in docker-compose.yml');
}

app.use(session({
  store: new FileSessionStore(),
  secret: sessionSecret || 'quicklib-change-me',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'strict',
    maxAge: maxAgeDays * 24 * 60 * 60 * 1000,
  },
}));

app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, '..', 'public')));

// Health check — must sit before auth middleware
app.get('/health', (_req, res) => {
  res.status(200).send('ok');
});

app.use('/', require('./routes/login'));

const { requireAuth } = require('./auth');
app.use(requireAuth);

app.use('/',         require('./routes/books'));
app.use('/api',      require('./routes/api'));
app.use('/covers',   require('./routes/covers'));
app.use('/download', require('./routes/download'));

app.use((err, req, res, _next) => {
  console.error(err);
  res.status(500).send('Erreur interne du serveur');
});

http.createServer(app).listen(PORT, '0.0.0.0', () => {
  console.log(`[quicklib] http://0.0.0.0:${PORT}  library=${process.env.CALIBRE_LIBRARY_PATH}`);
});
