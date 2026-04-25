const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8091;
const DIR = __dirname;
const DATA_DIR = path.join(DIR, 'data');
const PLAYERS_FILE = path.join(DATA_DIR, 'players.json');
const LEADERBOARD_FILE = path.join(DATA_DIR, 'leaderboard.json');

const MIME = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// --- Data helpers ---

function ensureDataFiles() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(PLAYERS_FILE)) {
    fs.writeFileSync(PLAYERS_FILE, '[]', 'utf8');
  }
  if (!fs.existsSync(LEADERBOARD_FILE)) {
    fs.writeFileSync(LEADERBOARD_FILE, '[]', 'utf8');
  }
}

function readJSON(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (e) {
    return [];
  }
}

function writeJSON(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

// --- Request helpers ---

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

function sendJSON(res, statusCode, data) {
  const json = JSON.stringify(data);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  });
  res.end(json);
}

function addCORS(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

// --- API route handlers ---

async function handlePlayerCreate(req, res) {
  const { name, avatar } = await parseBody(req);
  if (!name) {
    return sendJSON(res, 400, { error: 'name is required' });
  }

  const players = readJSON(PLAYERS_FILE);
  let player = players.find(p => p.name === name);

  if (player) {
    player.avatar = avatar || player.avatar;
    writeJSON(PLAYERS_FILE, players);
  } else {
    player = {
      id: Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7),
      name,
      avatar: avatar || 'default',
      xp: 0,
      level: 1
    };
    players.push(player);
    writeJSON(PLAYERS_FILE, players);
  }

  sendJSON(res, 200, { id: player.id, name: player.name, avatar: player.avatar, xp: player.xp, level: player.level });
}

function handleLeaderboard(req, res) {
  const entries = readJSON(LEADERBOARD_FILE);
  const sorted = entries.sort((a, b) => b.score - a.score).slice(0, 50);
  sendJSON(res, 200, { players: sorted });
}

async function handleScoreSubmit(req, res) {
  const body = await parseBody(req);
  const { playerName, avatar, score, mode, packId, difficulty, correct, wrong, bestCombo, xp, level } = body;

  if (!playerName || score === undefined) {
    return sendJSON(res, 400, { error: 'playerName and score are required' });
  }

  const entry = {
    name: playerName,
    avatar: avatar || 'default',
    score: score || 0,
    mode: mode || 'classic',
    packId: packId || '',
    difficulty: difficulty || 'normal',
    correct: correct || 0,
    wrong: wrong || 0,
    bestCombo: bestCombo || 0,
    xp: xp || 0,
    level: level || 1,
    date: new Date().toISOString()
  };

  const entries = readJSON(LEADERBOARD_FILE);
  entries.push(entry);
  writeJSON(LEADERBOARD_FILE, entries);

  const sorted = entries.sort((a, b) => b.score - a.score);
  const rank = sorted.findIndex(e => e === entry) + 1;

  sendJSON(res, 200, { success: true, rank });
}

// --- Server ---

ensureDataFiles();

http.createServer(async (req, res) => {
  const url = req.url.split('?')[0];
  const method = req.method.toUpperCase();

  addCORS(res);

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // API routes
  try {
    if (url === '/api/player' && method === 'POST') {
      return await handlePlayerCreate(req, res);
    }
    if (url === '/api/leaderboard' && method === 'GET') {
      return handleLeaderboard(req, res);
    }
    if (url === '/api/score' && method === 'POST') {
      return await handleScoreSubmit(req, res);
    }
  } catch (err) {
    console.error('API error:', err.message);
    return sendJSON(res, 500, { error: 'Internal server error' });
  }

  // Static file serving
  let filePath = path.join(DIR, url === '/' ? '/index.html' : url);
  const ext = path.extname(filePath);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    res.writeHead(200, {
      'Content-Type': MIME[ext] || 'text/plain',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(data);
  });
}).listen(PORT, () => console.log(`Timeline Historia v2 running on http://localhost:${PORT}`));
