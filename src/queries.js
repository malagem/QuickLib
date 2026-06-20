const { getDb } = require('./db');

const SORT_MAP = {
  recent:      'b.timestamp DESC',
  title_asc:   'b.sort ASC',
  title_desc:  'b.sort DESC',
  author_asc:  'b.author_sort ASC',
  author_desc: 'b.author_sort DESC',
};

function buildWhere(search, author, tags) {
  const conds = [];
  const params = [];

  if (search) {
    const words = search.trim().split(/\s+/).filter(Boolean);
    conds.push(words.map(() => '(b.title LIKE ? OR c.text LIKE ?)').join(' AND '));
    words.forEach(w => { params.push(`%${w}%`, `%${w}%`); });
  }

  if (author) {
    conds.push(`b.id IN (
      SELECT bal.book FROM books_authors_link bal
      JOIN authors a ON a.id = bal.author
      WHERE a.sort = ?
    )`);
    params.push(author);
  }

  if (tags && tags.length) {
    const ph = tags.map(() => '?').join(',');
    conds.push(`b.id IN (
      SELECT btl.book FROM books_tags_link btl
      JOIN tags t ON t.id = btl.tag
      WHERE t.name IN (${ph})
      GROUP BY btl.book
      HAVING COUNT(DISTINCT t.id) = ?
    )`);
    params.push(...tags, tags.length);
  }

  const clause = conds.length ? `WHERE ${conds.join(' AND ')}` : '';
  return { clause, params };
}

function getCount(search, author, tags) {
  const db = getDb();
  const { clause, params } = buildWhere(search, author, tags);
  return db.prepare(`
    SELECT COUNT(DISTINCT b.id) AS total
    FROM books b
    LEFT JOIN comments c ON c.book = b.id
    ${clause}
  `).get(...params).total;
}

// Authors and formats use subqueries to avoid DISTINCT + custom separator limitation
function getBooks({ search, author, tags, sort, limit, offset }) {
  const db = getDb();
  const { clause, params } = buildWhere(search, author, tags);
  const orderBy = SORT_MAP[sort] || SORT_MAP.recent;
  return db.prepare(`
    SELECT
      b.id, b.title, b.has_cover,
      (SELECT GROUP_CONCAT(a.sort, ' & ')
       FROM books_authors_link bal JOIN authors a ON a.id = bal.author
       WHERE bal.book = b.id) AS authors,
      (SELECT GROUP_CONCAT(d.format, ',')
       FROM data d WHERE d.book = b.id) AS formats
    FROM books b
    LEFT JOIN comments c ON c.book = b.id
    ${clause}
    GROUP BY b.id
    ORDER BY ${orderBy}
    LIMIT ? OFFSET ?
  `).all(...params, limit, offset);
}

function getBookPath(id) {
  const db = getDb();
  return db.prepare('SELECT path, has_cover FROM books WHERE id = ?').get(id);
}

function getBookFile(id, format) {
  const db = getDb();
  return db.prepare(`
    SELECT b.path, d.name
    FROM books b
    JOIN data d ON d.book = b.id
    WHERE b.id = ? AND d.format = ?
  `).get(id, format);
}

function getBookDetail(id) {
  const db = getDb();
  return db.prepare(`
    SELECT
      b.id, b.title, b.pubdate, b.has_cover, b.series_index,
      (SELECT GROUP_CONCAT(a.sort, ' & ')
       FROM books_authors_link bal JOIN authors a ON a.id = bal.author
       WHERE bal.book = b.id) AS authors,
      c.text AS description,
      (SELECT GROUP_CONCAT(t.name, ', ')
       FROM books_tags_link btl JOIN tags t ON t.id = btl.tag
       WHERE btl.book = b.id) AS tags,
      (SELECT p.name
       FROM books_publishers_link bpl JOIN publishers p ON p.id = bpl.publisher
       WHERE bpl.book = b.id LIMIT 1) AS publisher,
      (SELECT s.name
       FROM books_series_link bsl JOIN series s ON s.id = bsl.series
       WHERE bsl.book = b.id LIMIT 1) AS series_name,
      (SELECT l.lang_code
       FROM books_languages_link bll JOIN languages l ON l.id = bll.lang_code
       WHERE bll.book = b.id LIMIT 1) AS language,
      (SELECT GROUP_CONCAT(d.format || '|' || d.uncompressed_size, ',')
       FROM data d WHERE d.book = b.id) AS files
    FROM books b
    LEFT JOIN comments c ON c.book = b.id
    WHERE b.id = ?
  `).get(id);
}

function getTags(search, author) {
  const db = getDb();
  const { clause, params } = buildWhere(search, author);

  const subset = db.prepare(`
    SELECT t.name, COUNT(DISTINCT btl.book) AS count
    FROM tags t
    JOIN books_tags_link btl ON btl.tag = t.id
    JOIN books b ON b.id = btl.book
    LEFT JOIN comments c ON c.book = b.id
    ${clause}
    GROUP BY t.id
    ORDER BY t.name COLLATE NOCASE
  `).all(...params);

  const all = db.prepare(`
    SELECT t.name
    FROM tags t
    ORDER BY t.name COLLATE NOCASE
  `).all();

  return { subset, all };
}

module.exports = { getCount, getBooks, getBookPath, getBookFile, getBookDetail, getTags };
