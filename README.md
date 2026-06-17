# QuickLib

A lightweight, read-only web browser for [Calibre](https://calibre-ebook.com/) libraries. Built with Node.js, Express 5, and the built-in `node:sqlite` module — no external database driver needed. The project originated from a frustration when using either overengineered solutions like Calibre-Web or Grimmory, or unstable ones like BicBucStriim, and also from the desire to have a drop-dead-simple solution to browse, search and download books from a personal library from anywhere in the world. AI was involved in the process.

![Node.js](https://img.shields.io/badge/Node.js-%3E%3D24-brightgreen) ![Express](https://img.shields.io/badge/Express-5-blue) ![Docker](https://img.shields.io/badge/Docker-ready-blue)

## Features

- **Grid & list views** — switch between a cover grid and a compact table layout
- **5 sort options** — by date added, title A→Z / Z→A, author A→Z / Z→A
- **Multi-word search** — searches both titles and descriptions simultaneously
- **Author filter** — click any author name to filter the library by that author
- **Tag filter** — dropdown with searchable checkboxes; supports multi-tag selection (AND logic); count badge reflects active filters
- **Pagination** — configurable per-page count (10 / 25 / 50 / 100), duplicated at top and bottom with the selector integrated in the navigation bar
- **Book detail popup** — cover, metadata (year, publisher, series, language, tags) and description in a modal
- **File download** — direct download of any format (EPUB, PDF, MOBI, AZW, CBZ…) with file size shown
- **Persistent preferences** — sort, view mode and per-page count are saved in `localStorage`
- **Dark / light theme toggle** — follows system preference by default, overridable per browser
- **Form-based authentication** — login page with session cookie, configurable session duration
- **Docker-ready** — single container, read-only library mount, no write access to the Calibre database

## Requirements

- Node.js ≥ 24 (uses the built-in `node:sqlite` module)
- A Calibre library with its `metadata.db` file

## Quick start (local)

```bash
npm install
set CALIBRE_LIBRARY_PATH=C:\path\to\your\calibre\library   # Windows CMD
node src/app.js
```

Open `http://localhost:9095`.

## Docker deployment

### 1. Configure environment

Create a `.env` file next to `docker-compose.yml`:

```env
CALIBRE_LIBRARY_PATH=/mnt/your/calibre/library
QUICKLIB_CONFIG_DIR=/path/to/config/dir
SESSION_SECRET=replace_with_a_long_random_string
SESSION_MAX_AGE_DAYS=30
```

Generate a secure secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. Set up authentication

Create a `users` file in your config directory (one user per line):

```
yourusername:sha256hashofyourpassword
```

Generate the SHA-256 hash of your password:
```bash
node -e "console.log(require('crypto').createHash('sha256').update(process.argv[1]).digest('hex'))" "yourpassword"
```

Lines starting with `#` are ignored. Reload requires a container restart.

Authentication is **disabled** when `AUTH_USERS_FILE` is not set (useful for local development).

### 3. Build and run

```bash
docker compose up -d --build
```

## Environment variables

| Variable | Default | Description |
|---|---|---|
| `CALIBRE_LIBRARY_PATH` | *(required)* | Path to the Calibre library directory |
| `PORT` | `9095` | HTTP port |
| `AUTH_USERS_FILE` | *(unset)* | Path to the users file — auth disabled if absent |
| `SESSION_SECRET` | *(required if auth enabled)* | Secret key for signing session cookies |
| `SESSION_MAX_AGE_DAYS` | `30` | Session cookie lifetime in days |

## Tech stack

- **[Express 5](https://expressjs.com/)** — web framework
- **[node:sqlite](https://nodejs.org/api/sqlite.html)** — built-in SQLite driver (Node ≥ 24)
- **[express-session](https://github.com/expressjs/session)** — session management
- **[PicoCSS v2](https://picocss.com/)** — classless CSS framework (CDN)

## AI assistance disclosure

AI code assistants Claude and DeepSeek-V4-Pro were involved in this project at various stages of planning, writting, reviewing, refactoring, testing or documenting. All AI-generated or AI-assisted changes are reviewed, tested, and accepted by the human maintainer before being committed. Responsibility for the final code remains with the repository maintainer.

## License

MIT
