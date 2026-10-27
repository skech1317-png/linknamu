// 링크나무 서버 (Node 내장 모듈만 사용)
// - GET /          : 메인(공개 프로필) 페이지. data/profile.json을 읽어 그린다
// - GET /go/{id}   : 클릭 수 +1 후 실제 링크로 이동
// - 그 외          : public/ 폴더의 정적 파일
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');
const DATA_FILE = path.join(__dirname, 'data', 'profile.json');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
};

// ---------- 데이터 ----------
const profile = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));

function save() {
  // 임시 파일에 쓴 뒤 바꿔치기해서, 저장 도중 꺼져도 파일이 깨지지 않게 한다
  const tmp = DATA_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(profile, null, 2) + '\n');
  fs.renameSync(tmp, DATA_FILE);
}

// ---------- 유틸 ----------
function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// 'instagram.com/abc'처럼 적어도 https://를 붙이고, http/https가 아니면 null
function normalizeUrl(raw) {
  let url = String(raw || '').trim();
  if (!url) return null;
  if (!/^[a-z][a-z0-9+.-]*:/i.test(url)) url = 'https://' + url;
  try {
    const u = new URL(url);
    return u.protocol === 'http:' || u.protocol === 'https:' ? u.href : null;
  } catch { return null; }
}

function domainOf(url) {
  try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return ''; }
}

// ---------- 메인 페이지 ----------
function renderMain() {
  const name = String(profile.name || '').slice(0, 40);
  const bio = String(profile.bio || '').slice(0, 120);
  const links = profile.links.filter(l => normalizeUrl(l.url));

  const avatar = profile.avatar
    ? `<img src="${esc(profile.avatar)}" alt="${esc(name)} 프로필 사진">`
    : esc(name.trim().charAt(0) || '?');

  const cards = links.length
    ? links.map(l => `
    <a class="link-card" href="/go/${encodeURIComponent(l.id)}">
      <span class="link-title">${esc(l.title)}</span>
      <span class="link-domain">${esc(domainOf(normalizeUrl(l.url)))}</span>
    </a>`).join('')
    : '\n    <p class="empty">아직 등록된 링크가 없어요.</p>';

  return `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(name)}</title>
<meta name="description" content="${esc(bio)}">
<meta property="og:title" content="${esc(name)}">
<meta property="og:description" content="${esc(bio)}">
<link rel="stylesheet" href="/style.css">
</head>
<body>
<main class="profile">
  <!-- 프로필: 원형 사진 → 이름 → 한 줄 소개 -->
  <header class="profile-head">
    <div class="avatar"${profile.avatar ? '' : ' aria-hidden="true"'}>${avatar}</div>
    <h1 class="name">${esc(name)}</h1>
    ${bio ? `<p class="bio">${esc(bio)}</p>` : ''}
  </header>

  <!-- 링크 카드 목록 -->
  <nav class="links" aria-label="링크 목록">${cards}
  </nav>
</main>
</body>
</html>`;
}

// ---------- 라우터 ----------
function send(res, status, body, type = 'text/plain; charset=utf-8', headers = {}) {
  res.writeHead(status, { 'Content-Type': type, ...headers });
  res.end(body);
}

const server = http.createServer((req, res) => {
  const { pathname } = new URL(req.url, 'http://localhost');

  if (pathname === '/') return send(res, 200, renderMain(), MIME['.html'], { 'Cache-Control': 'no-store' });

  const go = /^\/go\/([^/]+)$/.exec(pathname);
  if (go) {
    const link = profile.links.find(l => l.id === decodeURIComponent(go[1]));
    const url = link && normalizeUrl(link.url);
    if (!url) return send(res, 404, '링크를 찾을 수 없어요.');
    link.clicks = (link.clicks || 0) + 1;
    save();
    return send(res, 302, '', undefined, { Location: url, 'Cache-Control': 'no-store' });
  }

  // 정적 파일 (public 폴더 밖으로 나가는 경로는 차단)
  const file = path.join(PUBLIC_DIR, path.normalize(pathname));
  if (!file.startsWith(PUBLIC_DIR + path.sep)) return send(res, 403, 'Forbidden');
  fs.readFile(file, (err, data) => {
    if (err) return send(res, 404, '페이지를 찾을 수 없어요.');
    send(res, 200, data, MIME[path.extname(file).toLowerCase()] || 'application/octet-stream');
  });
});

server.listen(PORT, () => {
  console.log(`링크나무 실행 중 → http://localhost:${PORT}`);
});
