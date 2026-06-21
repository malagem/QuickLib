const Store = require('express-session/session/store');
const fs   = require('fs');
const path = require('path');

const sessionsDir = process.env.SESSIONS_DIR || './data/sessions';

class FileSessionStore extends Store {
  constructor() {
    super();
    fs.mkdirSync(sessionsDir, { recursive: true });
    this._pruneTimer = setInterval(() => this._prune(), 60 * 60 * 1000);
    console.log(`[quicklib] Session store: ${sessionsDir}`);
  }

  _filePath(sid) {
    return path.join(sessionsDir, `${sid}.json`);
  }

  // ── express-session Store interface ──────────────────────────────────────

  get(sid, callback) {
    try {
      const fp = this._filePath(sid);
      if (!fs.existsSync(fp)) return callback(null, null);

      const raw  = fs.readFileSync(fp, 'utf8');
      const data = JSON.parse(raw);

      if (data.__expires && data.__expires <= Date.now()) {
        try { fs.unlinkSync(fp); } catch (_) {}
        return callback(null, null);
      }

      delete data.__expires;
      callback(null, data);
    } catch (err) {
      try { fs.unlinkSync(this._filePath(sid)); } catch (_) {}
      callback(null, null);
    }
  }

  set(sid, session, callback) {
    try {
      const expires = session.cookie && session.cookie.expires
        ? new Date(session.cookie.expires).getTime()
        : Date.now() + 30 * 24 * 60 * 60 * 1000;

      const data = Object.assign({ __expires: expires }, session);

      fs.writeFileSync(this._filePath(sid), JSON.stringify(data), 'utf8');
      callback();
    } catch (err) {
      callback(err);
    }
  }

  destroy(sid, callback) {
    try {
      const fp = this._filePath(sid);
      if (fs.existsSync(fp)) fs.unlinkSync(fp);
      callback();
    } catch (_) {
      callback();
    }
  }

  touch(sid, session, callback) {
    try {
      const expires = session.cookie && session.cookie.expires
        ? new Date(session.cookie.expires).getTime()
        : Date.now() + 30 * 24 * 60 * 60 * 1000;

      const fp = this._filePath(sid);
      if (!fs.existsSync(fp)) return callback();

      const raw  = fs.readFileSync(fp, 'utf8');
      const data = JSON.parse(raw);
      data.__expires = expires;
      fs.writeFileSync(fp, JSON.stringify(data), 'utf8');
      callback();
    } catch (err) {
      callback(err);
    }
  }

  // ── Maintenance ─────────────────────────────────────────────────────────

  _prune() {
    try {
      let count = 0;
      const now = Date.now();
      for (const f of fs.readdirSync(sessionsDir)) {
        if (!f.endsWith('.json')) continue;
        const fp = path.join(sessionsDir, f);
        try {
          const data = JSON.parse(fs.readFileSync(fp, 'utf8'));
          if (data.__expires && data.__expires <= now) {
            fs.unlinkSync(fp);
            count++;
          }
        } catch (_) { /* corrupt — skip */ }
      }
      if (count) console.log(`[quicklib] Pruned ${count} expired session(s)`);
    } catch (_) { /* noop */ }
  }
}

module.exports = { FileSessionStore };