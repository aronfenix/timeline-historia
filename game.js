// ============================================================
//  GAME.JS - Timeline Historia v3
//  Motor principal - TODAS las escenas (9)
//  Botones con rectangulo interactivo directo (sin container input)
// ============================================================

(() => {
  'use strict';

  const W = 1280, H = 720;
  const TD = window.TIMELINE_DATA;
  const FX = window.EffectsManager;
  const Audio = window.AudioManager;
  const Sprites = window.SpriteGenerator;
  const VISUALS = (TD && TD.VISUALS) || { backgrounds: {}, events: {} };

  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
  function hexToInt(hex) {
    try { return Phaser.Display.Color.HexStringToColor(hex).color; } catch (e) { return 0x444444; }
  }
  function byYear(a, b) { return a.year !== b.year ? a.year - b.year : a.id.localeCompare(b.id); }
  function hasTexture(scene, key) {
    return !!(key && scene && scene.textures && scene.textures.exists(key));
  }
  function getEventVisual(ev) {
    if (!ev) return null;
    return ev.visual || VISUALS.events[ev.id] || null;
  }
  function getAvatarById(id) {
    return AVATARS.find(a => a.id === id) || AVATARS[0];
  }
  function getAvatarVisual(avatarOrId) {
    const avatar = typeof avatarOrId === 'string' ? getAvatarById(avatarOrId) : avatarOrId;
    if (!avatar) return null;
    return avatar.visual || (VISUALS.avatars && VISUALS.avatars[avatar.id]) || null;
  }
  function getPackBackground(packId, era) {
    if (packId === 'edad_contemporanea' || era === 'contemporanea') return VISUALS.backgrounds.contemporanea || null;
    if (packId === 'mixto' || era === 'mixto') return VISUALS.backgrounds.menu || null;
    return VISUALS.backgrounds.moderna || null;
  }
  function createAvatarPortrait(scene, avatarOrId, x, y, size, depth, opts) {
    const avatar = typeof avatarOrId === 'string' ? getAvatarById(avatarOrId) : avatarOrId;
    const visual = getAvatarVisual(avatar);
    const alpha = (opts && opts.alpha) || 1;
    const label = (opts && opts.label) || (avatar && avatar.emoji) || '\u{1F464}';

    let node;
    if (hasTexture(scene, visual && visual.key)) {
      node = scene.add.image(x, y, visual.key).setDisplaySize(size, size);
    } else {
      node = scene.add.text(x, y, label, { fontSize: `${Math.round(size * 0.65)}px` }).setOrigin(0.5);
    }
    node.setDepth(depth).setAlpha(alpha);

    return {
      node,
      setSelected(selected) {
        if (!node) return;
        if (node.setScale) node.setScale(selected ? 1.06 : 0.96);
        node.setAlpha(selected ? 1 : alpha);
      },
      destroy() { if (node && node.destroy) node.destroy(); }
    };
  }

  // --- LEVELS (XP progression) ---
  const LEVELS = (TD && TD.LEVELS) || [
    { level: 1, title: 'Aprendiz', xpNeeded: 0 },
    { level: 2, title: 'Explorador', xpNeeded: 80 },
    { level: 3, title: 'Cronista', xpNeeded: 200 },
    { level: 4, title: 'Historiador', xpNeeded: 400 },
    { level: 5, title: 'Erudito', xpNeeded: 700 },
    { level: 6, title: 'Sabio', xpNeeded: 1100 },
    { level: 7, title: 'Maestro del Tiempo', xpNeeded: 1600 },
    { level: 8, title: 'Leyenda', xpNeeded: 2200 },
    { level: 9, title: 'Oraculo', xpNeeded: 3000 },
    { level: 10, title: 'Inmortal', xpNeeded: 4000 }
  ];

  // --- AVATARS ---
  const AVATARS = (TD && TD.AVATARS) || [
    { id: 'knight', emoji: '\u{1F9D1}\u200D\u{1F3A4}', name: 'Caballero' },
    { id: 'queen', emoji: '\u{1F478}', name: 'Reina' },
    { id: 'wizard', emoji: '\u{1F9D9}', name: 'Mago' },
    { id: 'pirate', emoji: '\u{1F3F4}\u200D\u2620\uFE0F', name: 'Pirata' },
    { id: 'explorer', emoji: '\u{1F9ED}', name: 'Explorador' },
    { id: 'scholar', emoji: '\u{1F393}', name: 'Erudito' },
    { id: 'viking', emoji: '\u2694\uFE0F', name: 'Viking' },
    { id: 'pharaoh', emoji: '\u{1F3FA}', name: 'Faraon' }
  ];

  // --- Stats ---
  const SK = 'timeline_historia_v3';
  function defaultStats() {
    return {
      playerName: '', playerAvatar: '',
      xp: 0, level: 1,
      gamesCompleted: 0, totalCorrect: 0, totalWrong: 0,
      bestCombo: 0, perfectRounds: 0, fastestPlacement: 999,
      packsPlayed: [], winsNoPowerups: 0, unlockedAchievements: [],
      seenEvents: [],
      bonusCorrect: 0
    };
  }
  function loadStats() {
    try {
      const r = localStorage.getItem(SK);
      if (r) {
        const s = JSON.parse(r);
        // Ensure all fields exist
        const d = defaultStats();
        Object.keys(d).forEach(k => { if (s[k] === undefined) s[k] = d[k]; });
        // Convert packsPlayed to Set for compatibility
        if (Array.isArray(s.packsPlayed)) s.packsPlayed = new Set(s.packsPlayed);
        else s.packsPlayed = new Set();
        if (Array.isArray(s.seenEvents)) s.seenEvents = new Set(s.seenEvents);
        else s.seenEvents = new Set();
        return s;
      }
    } catch (e) { }
    const d = defaultStats();
    d.packsPlayed = new Set();
    d.seenEvents = new Set();
    return d;
  }
  function saveStats(s) {
    try {
      localStorage.setItem(SK, JSON.stringify({
        ...s,
        packsPlayed: [...(s.packsPlayed || [])],
        seenEvents: [...(s.seenEvents || [])]
      }));
    } catch (e) { }
  }

  function getLevelInfo(xp) {
    let lvl = LEVELS[0];
    for (let i = LEVELS.length - 1; i >= 0; i--) {
      if (xp >= LEVELS[i].xpNeeded) { lvl = LEVELS[i]; break; }
    }
    const next = LEVELS[Math.min(lvl.level, LEVELS.length - 1)];
    const xpInLevel = xp - lvl.xpNeeded;
    const xpForNext = (next.xpNeeded > lvl.xpNeeded) ? next.xpNeeded - lvl.xpNeeded : 999;
    return { level: lvl.level, title: lvl.title, xpInLevel, xpForNext, nextTitle: next.title };
  }

  // --- Server API ---
  const ONLINE_API = window.TIMELINE_ONLINE_API || {};
  const API_BASE = String(ONLINE_API.baseUrl || '').replace(/\/+$/, '');
  const LOCAL_LB_KEY = 'timeline_historia_v3_leaderboard';
  function canUseRelativeApi() {
    return ['localhost', '127.0.0.1'].includes(window.location.hostname);
  }
  function isOnlineLeaderboardConfigured() {
    return !!(window.timelineLeaderboardManager && window.timelineLeaderboardManager.isFirebaseEnabled) || !!API_BASE || canUseRelativeApi();
  }
  function apiUrl(path) {
    if (API_BASE) return `${API_BASE}${path}`;
    if (canUseRelativeApi()) return path;
    return null;
  }
  async function apiPost(url, data) {
    const target = apiUrl(url);
    if (!target) return null;
    try {
      const r = await fetch(target, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      return await r.json();
    } catch (e) { return null; }
  }
  async function apiGet(url) {
    const target = apiUrl(url);
    if (!target) return null;
    try { const r = await fetch(target); return await r.json(); } catch (e) { return null; }
  }
  function loadLocalLeaderboard() {
    try {
      const raw = localStorage.getItem(LOCAL_LB_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) { return []; }
  }
  function saveLocalLeaderboard(entries) {
    try { localStorage.setItem(LOCAL_LB_KEY, JSON.stringify(entries)); } catch (e) { }
  }
  function normalizeLeaderboardData(payload) {
    if (Array.isArray(payload)) return payload;
    if (payload && Array.isArray(payload.players)) return payload.players;
    return [];
  }
  function playerScoreKey(entry) {
    return String(entry && entry.name ? entry.name : '').trim().toLowerCase();
  }
  function mergeLeaderboardEntries(primary, secondary) {
    const bestByPlayer = new Map();
    [...primary, ...secondary].forEach(entry => {
      if (!entry) return;
      const key = playerScoreKey(entry);
      if (!key) return;
      const current = bestByPlayer.get(key);
      const score = entry.score || 0;
      const currentScore = current ? (current.score || 0) : -1;
      if (!current || score > currentScore || (score === currentScore && String(entry.date || '').localeCompare(String(current.date || '')) > 0)) {
        bestByPlayer.set(key, entry);
      }
    });
    const out = [...bestByPlayer.values()];
    out.sort((a, b) => {
      if ((b.score || 0) !== (a.score || 0)) return (b.score || 0) - (a.score || 0);
      return String(b.date || '').localeCompare(String(a.date || ''));
    });
    return out.slice(0, 50);
  }
  async function submitPlayerProfile(name, avatar) {
    return await apiPost('/api/player', { name, avatar });
  }
  async function submitScoreEntry(entry) {
    const localEntries = loadLocalLeaderboard();
    const localEntry = {
      name: entry.playerName,
      avatar: entry.avatar || 'default',
      score: entry.score || 0,
      mode: entry.mode || 'classic',
      packId: entry.packId || '',
      difficulty: entry.difficulty || 'normal',
      correct: entry.correct || 0,
      wrong: entry.wrong || 0,
      bestCombo: entry.bestCombo || 0,
      xp: entry.xp || 0,
      level: entry.level || 1,
      date: entry.date || new Date().toISOString()
    };
    localEntries.push(localEntry);
    saveLocalLeaderboard(mergeLeaderboardEntries(localEntries, []));

    if (window.timelineLeaderboardManager) {
      return await window.timelineLeaderboardManager.saveScore(localEntry);
    }
    return await apiPost('/api/score', entry);
  }
  async function fetchLeaderboardEntries() {
    const localEntries = loadLocalLeaderboard();
    if (window.timelineLeaderboardManager && window.timelineLeaderboardManager.isFirebaseEnabled) {
      const firebaseEntries = await window.timelineLeaderboardManager.getScores(50);
      const mergedFirebase = mergeLeaderboardEntries(firebaseEntries, localEntries);
      if (mergedFirebase.length) saveLocalLeaderboard(mergedFirebase);
      return mergedFirebase;
    }
    const remotePayload = await apiGet('/api/leaderboard');
    const remoteEntries = normalizeLeaderboardData(remotePayload);
    const merged = mergeLeaderboardEntries(remoteEntries, localEntries);
    if (merged.length) saveLocalLeaderboard(merged);
    return merged;
  }

  // ===================================================================
  //  BOTON: rectangulo interactivo + texto encima (SIN container input)
  //  Devuelve { bg, lbl, setActive, destroy, setDepth }
  // ===================================================================
  function makeBtn(scene, x, y, w, h, text, opts) {
    const primary = opts && opts.primary;
    const fs = (opts && opts.fontSize) || '20px';
    const depth = (opts && opts.depth) || 0;
    const bgColor = (opts && opts.bgColor) || (primary ? 0xffa040 : 0x182a44);
    const bgAlpha = primary ? 0.95 : 0.85;

    const bg = scene.add.rectangle(x, y, w, h, bgColor, bgAlpha);
    bg.setStrokeStyle(primary ? 2 : 1, primary ? 0xffeebb : 0x3a6a9a, primary ? 0.9 : 0.5);
    bg.setInteractive({ useHandCursor: true });
    bg.setDepth(depth);

    const lbl = scene.add.text(x, y, text, {
      fontFamily: 'Nunito', fontSize: fs, fontStyle: primary ? '900' : '700',
      color: primary ? '#1a1020' : '#ccddff',
      align: 'center', wordWrap: { width: w - 10 }
    }).setOrigin(0.5).setDepth(depth + 1);

    let active = false;

    bg.on('pointerover', () => {
      if (!active) bg.setFillStyle(primary ? 0xffb868 : 0x243a5c, 0.95);
      try { Audio.playHover(); } catch (e) { }
    });
    bg.on('pointerout', () => {
      if (!active) bg.setFillStyle(bgColor, bgAlpha);
    });

    const btn = {
      bg, lbl,
      setActive(a) {
        active = a;
        bg.setFillStyle(a ? 0xffa040 : bgColor, a ? 0.95 : bgAlpha);
        bg.setStrokeStyle(a ? 2 : 1, a ? 0xffeebb : 0x3a6a9a, a ? 0.9 : 0.5);
        lbl.setColor(a ? '#1a1020' : '#ccddff');
        lbl.setFontStyle(a ? '900' : '700');
      },
      on(evt, fn) { bg.on(evt, fn); return btn; },
      destroy() { bg.destroy(); lbl.destroy(); },
      setDepthVal(d) { bg.setDepth(d); lbl.setDepth(d + 1); },
      setAlpha(a) { bg.setAlpha(a); lbl.setAlpha(a); },
      setVisible(v) { bg.setVisible(v); lbl.setVisible(v); }
    };
    return btn;
  }

  // ========================================================
  //  BOOT SCENE
  // ========================================================
  class BootScene extends Phaser.Scene {
    constructor() { super('boot'); }
    preload() {
      const backgrounds = Object.values(VISUALS.backgrounds || {});
      const avatars = Object.values(VISUALS.avatars || {});
      const events = Object.values(VISUALS.events || {});
      [...backgrounds, ...avatars, ...events].forEach(asset => {
        if (asset && asset.key && asset.src) this.load.image(asset.key, asset.src);
      });
    }
    create() {
      try { Sprites.generateAll(this); } catch(e) { console.error('Sprites error:', e.message); }
      this.add.rectangle(W / 2, H / 2, W, H, 0x060d1a);
      this.add.text(W / 2, H / 2 - 60, 'TIMELINE HISTORIA', { fontFamily: 'Bungee', fontSize: '48px', color: '#ffd700' }).setOrigin(0.5);
      this.add.text(W / 2, H / 2 - 10, 'Cargando...', { fontFamily: 'Nunito', fontSize: '20px', color: '#8cb6ff', fontStyle: '700' }).setOrigin(0.5);
      this.add.rectangle(W / 2, H / 2 + 50, 400, 16, 0x1a2744).setStrokeStyle(1, 0x3a5a8a);
      const barFill = this.add.rectangle(W / 2 - 198, H / 2 + 50, 0, 12, 0xffd700).setOrigin(0, 0.5);
      let ticks = 0;
      this.time.addEvent({
        delay: 50, repeat: 19,
        callback: () => {
          ticks++;
          barFill.width = (ticks / 20) * 396;
          if (ticks >= 20) {
            this.time.delayedCall(200, () => {
              const stats = loadStats();
              if (stats.playerName && stats.playerName.length >= 2) {
                this.scene.start('menu');
              } else {
                this.scene.start('identity');
              }
            });
          }
        }
      });
    }
  }

  // ========================================================
  //  IDENTITY SCENE
  // ========================================================
  class IdentityScene extends Phaser.Scene {
    constructor() { super('identity'); }
    create() {
      Audio.init();
      this.add.rectangle(W / 2, H / 2, W, H, 0x060d1a);
      FX.createFloatingParticles(this, 40, 0x4488ff);
      const stats = loadStats();

      this.add.text(W / 2, 80, '\u00A1Bienvenido, viajero del tiempo!', {
        fontFamily: 'Bungee', fontSize: '34px', color: '#ffd700'
      }).setOrigin(0.5);

      this.add.text(W / 2, 130, '\u00BFC\u00F3mo te llamas?', {
        fontFamily: 'Nunito', fontSize: '22px', color: '#8cb6ff', fontStyle: '700'
      }).setOrigin(0.5);

      // HTML input for name
      const input = document.createElement('input');
      input.type = 'text';
      input.placeholder = 'Tu nombre...';
      input.maxLength = 15;
      input.value = stats.playerName || '';
      input.style.cssText = 'font-family:Nunito;font-size:24px;padding:10px 20px;border-radius:10px;border:2px solid #ffd700;background:#0d1829;color:#fff;text-align:center;width:280px;outline:none;';
      this.add.dom(W / 2, 190, input);

      // Avatar selection title
      this.add.text(W / 2, 250, 'Elige tu avatar:', {
        fontFamily: 'Nunito', fontSize: '20px', color: '#aaccff', fontStyle: '700'
      }).setOrigin(0.5);

      // 4x2 avatar grid
      this.selAvatar = stats.playerAvatar || AVATARS[0].id;
      this.avatarBtns = [];
      AVATARS.forEach((av, i) => {
        const col = i % 4, row = Math.floor(i / 4);
        const ax = W / 2 - 225 + col * 150;
        const ay = 310 + row * 90;
        const btn = makeBtn(this, ax, ay, 135, 84, av.name, { fontSize: '15px' });
        btn.lbl.setY(ay + 22);
        const portrait = createAvatarPortrait(this, av, ax, ay - 10, 54, 2, { alpha: 0.94, label: av.emoji });
        btn.on('pointerdown', () => {
          try { Audio.playClick(); } catch (e) { }
          this.selAvatar = av.id;
          this._refreshAvatars();
        });
        this.avatarBtns.push({ id: av.id, btn, portrait });
      });

      // Error text
      this.errorText = this.add.text(W / 2, 510, '', {
        fontFamily: 'Nunito', fontSize: '16px', color: '#ff6666', fontStyle: '700'
      }).setOrigin(0.5);

      const startAdventure = () => {
        const name = input.value.trim();
        if (name.length < 2) {
          this.errorText.setText('El nombre debe tener al menos 2 caracteres');
          return;
        }
        if (!this.selAvatar) {
          this.errorText.setText('Elige un avatar');
          return;
        }
        try { Audio.playClick(); } catch (e) { }
        const freshStats = loadStats();
        freshStats.playerName = name;
        freshStats.playerAvatar = this.selAvatar;
        saveStats(freshStats);
        submitPlayerProfile(name, this.selAvatar);
        this.scene.start('menu');
      };

      // Start button
      const startBtn = makeBtn(this, W / 2, 560, 340, 56, 'EMPEZAR AVENTURA', { primary: true, fontSize: '24px' });
      startBtn.on('pointerdown', startAdventure);
      this.tweens.add({ targets: startBtn.bg, scaleX: 1.02, scaleY: 1.02, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.InOut' });

      this.add.text(W / 2, 605, 'Pulsa Enter despues de escribir tu nombre', {
        fontFamily: 'Nunito', fontSize: '14px', color: '#667799', fontStyle: '700'
      }).setOrigin(0.5);

      input.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter') startAdventure();
      });

      this._refreshAvatars();
    }

    _refreshAvatars() {
      this.avatarBtns.forEach(b => {
        const active = b.id === this.selAvatar;
        b.btn.setActive(active);
        if (b.portrait) b.portrait.setSelected(active);
      });
    }
  }

  // ========================================================
  //  MENU SCENE
  // ========================================================
  class MenuScene extends Phaser.Scene {
    constructor() { super('menu'); }
    create() {
      this.selPack = 'edad_moderna';
      this.selDiff = 'normal';
      this.selRounds = 3;
      this.selMode = 'classic';
      try { Audio.playMenuMusicV3 ? Audio.playMenuMusicV3() : Audio.playMenuMusic(); } catch (e) { }

      // Animated BG
      this.add.rectangle(W / 2, H / 2, W, H, 0x080e1e);
      if (hasTexture(this, VISUALS.backgrounds.menu && VISUALS.backgrounds.menu.key)) {
        this.add.image(W / 2, H / 2, VISUALS.backgrounds.menu.key).setDisplaySize(W, H).setAlpha(0.92);
      }
      this.add.rectangle(W / 2, H / 2, W, H, 0x07111f, 0.48);
      // Moving gradient circles
      const c1 = this.add.circle(200, 120, 200, 0x1a2f5a, 0.24);
      const c2 = this.add.circle(1050, 580, 260, 0x3a1a4a, 0.2);
      const c3 = this.add.circle(640, 350, 180, 0x1a3a5a, 0.14);
      this.tweens.add({ targets: c1, x: 280, y: 180, duration: 8000, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
      this.tweens.add({ targets: c2, x: 980, y: 500, duration: 10000, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
      this.tweens.add({ targets: c3, x: 700, y: 300, duration: 12000, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
      FX.createFloatingParticles(this, 60, 0x6688cc);

      // Slow rotating decorative elements
      try {
        const dec1 = this.add.image(100, 650, 'compass').setScale(1.2).setAlpha(0.15);
        const dec2 = this.add.image(1180, 80, 'scroll').setScale(1.2).setAlpha(0.15);
        this.tweens.add({ targets: dec1, angle: 360, duration: 30000, repeat: -1 });
        this.tweens.add({ targets: dec2, angle: -360, duration: 25000, repeat: -1 });
      } catch (e) { }

      // Player card (top left)
      const stats = loadStats();
      const lvlInfo = getLevelInfo(stats.xp);
      const avatar = getAvatarById(stats.playerAvatar);

      this.add.rectangle(160, 42, 280, 60, 0x0d1829, 0.9).setStrokeStyle(1, 0x3a5a8a, 0.5).setDepth(5);
      createAvatarPortrait(this, avatar, 42, 42, 42, 6, { label: avatar.emoji });
      this.add.text(75, 22, stats.playerName || 'Viajero', { fontFamily: 'Nunito', fontSize: '16px', color: '#ffd700', fontStyle: '900' }).setDepth(6);
      this.add.text(75, 44, `Nv.${lvlInfo.level} ${lvlInfo.title}`, { fontFamily: 'Nunito', fontSize: '13px', color: '#8cb6ff', fontStyle: '700' }).setDepth(6);
      // XP bar
      this.add.rectangle(235, 52, 100, 8, 0x1a2744).setDepth(6);
      const xpRatio = clamp(lvlInfo.xpInLevel / lvlInfo.xpForNext, 0, 1);
      this.add.rectangle(235 - 49 + (98 * xpRatio) / 2, 52, Math.max(2, 98 * xpRatio), 6, 0xffd700).setOrigin(0, 0.5).setDepth(7);
      this.add.text(235, 38, `${stats.xp} XP`, { fontFamily: 'Nunito', fontSize: '10px', color: '#aab8cc', fontStyle: '700' }).setOrigin(0.5).setDepth(7);

      // Title with golden glow
      const titleGlow = this.add.text(W / 2, 68, 'TIMELINE HISTORIA', { fontFamily: 'Bungee', fontSize: '52px', color: '#ffd700' }).setOrigin(0.5).setAlpha(0.3).setScale(1.02);
      const titleMain = this.add.text(W / 2, 68, 'TIMELINE HISTORIA', { fontFamily: 'Bungee', fontSize: '52px', color: '#ffd700' }).setOrigin(0.5);
      this.tweens.add({ targets: titleGlow, alpha: 0.15, scaleX: 1.04, scaleY: 1.04, duration: 2000, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
      this.tweens.add({ targets: titleMain, y: '+=3', duration: 2000, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
      this.add.text(W / 2, 108, 'Aventura Cronologica para el Aula', { fontFamily: 'Nunito', fontSize: '18px', color: '#aaccff', fontStyle: '800' }).setOrigin(0.5);

      // Panel background
      this.add.rectangle(W / 2, 395, 1000, 430, 0x0d1829, 0.85).setStrokeStyle(1, 0x3a5a8a, 0.4);

      // MODE SELECTION
      this.add.text(W / 2, 140, 'MODO DE JUEGO', { fontFamily: 'Bungee', fontSize: '15px', color: '#ffd700' }).setOrigin(0.5);
      this.modeBtns = [];
      const modes = [
        { id: 'classic', emoji: '\u{1F3AF}', label: 'Clasico', desc: 'Ordena eventos en el timeline' },
        { id: 'vs', emoji: '\u2694\uFE0F', label: 'VS Duelo', desc: '2 jugadores, mismo dispositivo' }
      ];
      modes.forEach((m, i) => {
        const bx = W / 2 - 160 + i * 320;
        const btn = makeBtn(this, bx, 178, 280, 50, `${m.emoji} ${m.label}\n${m.desc}`, { fontSize: '14px' });
        btn.on('pointerdown', () => {
          try { Audio.playClick(); } catch (e) { }
          this.selMode = m.id;
          this._rMode();
        });
        this.modeBtns.push({ id: m.id, btn });
      });

      // PACK
      this.add.text(W / 2, 218, 'EPOCA', { fontFamily: 'Bungee', fontSize: '15px', color: '#ffd700' }).setOrigin(0.5);
      this.packBtns = [];
      const packW = 260;
      TD.PACK_OPTIONS.forEach((opt, i) => {
        const bx = W / 2 - packW - 20 + i * (packW + 20);
        const btn = makeBtn(this, bx, 250, packW, 42, `${opt.emoji}  ${opt.label}`);
        btn.on('pointerdown', () => { this.selPack = opt.id; this._rPack(); try { Audio.playClick(); } catch (e) { } });
        this.packBtns.push({ id: opt.id, btn });
      });

      // DIFFICULTY
      this.add.text(W / 2, 290, 'DIFICULTAD', { fontFamily: 'Bungee', fontSize: '15px', color: '#ffd700' }).setOrigin(0.5);
      this.diffBtns = [];
      const diffs = Object.entries(TD.DIFFICULTY);
      const dw = 180, dtw = diffs.length * dw + (diffs.length - 1) * 12, dsx = W / 2 - dtw / 2 + dw / 2;
      diffs.forEach(([key, val], i) => {
        const btn = makeBtn(this, dsx + i * (dw + 12), 324, dw, 42, val.label);
        btn.on('pointerdown', () => { this.selDiff = key; this._rDiff(); try { Audio.playClick(); } catch (e) { } });
        this.diffBtns.push({ id: key, btn });
      });

      // ROUNDS
      this.add.text(W / 2, 362, 'RONDAS', { fontFamily: 'Bungee', fontSize: '15px', color: '#ffd700' }).setOrigin(0.5);
      this.rndBtns = [];
      [3, 5, 7].forEach((n, i) => {
        const btn = makeBtn(this, W / 2 - 100 + i * 100, 396, 85, 42, String(n));
        btn.on('pointerdown', () => { this.selRounds = n; this._rRnd(); try { Audio.playClick(); } catch (e) { } });
        this.rndBtns.push({ id: n, btn });
      });

      this._rMode(); this._rPack(); this._rDiff(); this._rRnd();

      // START button
      const startBtn = makeBtn(this, W / 2, 465, 400, 60, 'COMENZAR PARTIDA', { primary: true, fontSize: '26px' });
      startBtn.on('pointerdown', () => {
        try { Audio.playClick(); Audio.stopMusic(0.5); } catch (e) { }
        const diff = TD.DIFFICULTY[this.selDiff];
        this.scene.start('game', {
          packId: this.selPack, difficulty: this.selDiff, rounds: this.selRounds,
          cardsPerRound: diff.cardsPerRound, turnTime: diff.turnTime, lives: diff.lives,
          mode: this.selMode
        });
      });
      this.tweens.add({ targets: startBtn.bg, scaleX: 1.02, scaleY: 1.02, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.InOut' });

      // Bottom row buttons
      const lbBtn = makeBtn(this, W / 2 - 200, 540, 240, 44, '\u{1F4CA} Clasificacion');
      lbBtn.on('pointerdown', () => { try { Audio.playClick(); Audio.stopMusic(0.5); } catch (e) { } this.scene.start('leaderboard'); });
      const colBtn = makeBtn(this, W / 2 + 200, 540, 240, 44, '\u{1F4DA} Coleccion');
      colBtn.on('pointerdown', () => { try { Audio.playClick(); Audio.stopMusic(0.5); } catch (e) { } this.scene.start('collection'); });

      // Audio toggles (top right)
      const musicBtn = this.add.text(W - 30, 20, 'Musica: ON', { fontFamily: 'Nunito', fontSize: '15px', color: '#6688aa', fontStyle: '700' }).setOrigin(1, 0).setInteractive({ useHandCursor: true }).setDepth(5);
      musicBtn.on('pointerdown', () => { const on = Audio.toggleMusic(); musicBtn.setText(`Musica: ${on ? 'ON' : 'OFF'}`); if (on) try { Audio.playMenuMusicV3 ? Audio.playMenuMusicV3() : Audio.playMenuMusic(); } catch (e) { } });
      const sfxBtn = this.add.text(W - 30, 42, 'Efectos: ON', { fontFamily: 'Nunito', fontSize: '15px', color: '#6688aa', fontStyle: '700' }).setOrigin(1, 0).setInteractive({ useHandCursor: true }).setDepth(5);
      sfxBtn.on('pointerdown', () => { const on = Audio.toggleSfx(); sfxBtn.setText(`Efectos: ${on ? 'ON' : 'OFF'}`); });

      // Stats line
      this.add.text(W / 2, H - 18, `Partidas: ${stats.gamesCompleted}  |  Aciertos: ${stats.totalCorrect}  |  Mejor combo: ${stats.bestCombo}  |  Logros: ${stats.unlockedAchievements.length}/${TD.ACHIEVEMENTS.length}`, { fontFamily: 'Nunito', fontSize: '13px', color: '#445566', fontStyle: '700' }).setOrigin(0.5);
    }

    _rMode() { this.modeBtns.forEach(b => b.btn.setActive(b.id === this.selMode)); }
    _rPack() { this.packBtns.forEach(b => b.btn.setActive(b.id === this.selPack)); }
    _rDiff() { this.diffBtns.forEach(b => b.btn.setActive(b.id === this.selDiff)); }
    _rRnd() { this.rndBtns.forEach(b => b.btn.setActive(b.id === this.selRounds)); }
  }

  // ========================================================
  //  GAME SCENE
  // ========================================================
  class GameScene extends Phaser.Scene {
    constructor() { super('game'); }

    init(data) {
      this.packId = data.packId || 'edad_moderna';
      this.difficulty = data.difficulty || 'normal';
      this.totalRounds = data.rounds || 3;
      this.cardsPerRound = data.cardsPerRound || 10;
      this.turnTimeMax = data.turnTime || 22;
      this.maxLives = data.lives || 3;
      this.pack = TD.getPack(this.packId);
      this.usedIds = new Set();
      this.currentRound = 1;
      this.score = 0;
      this.lives = this.maxLives;
      this.combo = 0;
      this.bestCombo = 0;
      this.totalCorrect = 0;
      this.totalWrong = 0;
      this.totalTimeout = 0;
      this.bonusCorrect = 0;
      this.powerups = {};
      Object.keys(TD.POWERUPS).forEach(k => { this.powerups[k] = { ...TD.POWERUPS[k], usesLeft: TD.POWERUPS[k].maxUses }; });
      this.powerupsUsed = 0;
      this.activeDoublePoints = false;
      this.activeSecondLife = false;
      this.frozen = false;
      this.timeline = [];
      this.roundDeck = [];
      this.currentEvent = null;
      this.currentCard = null;
      this.floatingTween = null;
      this.insertionZones = [];
      this.timelineCards = [];
      this.turnTimer = null;
      this.timeLeft = 0;
      this.turnOpen = false;
      this.turnStartTime = 0;
      this.roundStats = null;
      this.timelineY = 480;
      this.timelineSpacing = 120;
      this.timelineXPositions = [];
      this._overlayItems = [];
      this.roundEvents = []; // events played in round for review

      // VS mode
      this.vsMode = data.mode === 'vs';
      this.currentPlayer = 0;
      if (this.vsMode) {
        const stats = loadStats();
        const p2name = window.prompt('Nombre del Jugador 2:', 'Jugador 2') || 'Jugador 2';
        this.players = [
          { name: stats.playerName || 'Jugador 1', score: 0, lives: this.maxLives, combo: 0, bestCombo: 0, correct: 0, wrong: 0, timeout: 0 },
          { name: p2name, score: 0, lives: this.maxLives, combo: 0, bestCombo: 0, correct: 0, wrong: 0, timeout: 0 }
        ];
      }
    }

    create() {
      this._drawBG();
      this._createHud();
      this._createPuBar();
      this._createRail();

      // Drag handlers - once per scene
      this.input.on('dragstart', (ptr, obj) => {
        if (obj !== this.currentCard) return;
        if (this.floatingTween) { this.floatingTween.stop(); this.floatingTween = null; }
      });
      this.input.on('drag', (ptr, obj, dragX, dragY) => {
        if (obj !== this.currentCard || !this.turnOpen) return;
        obj.x = dragX;
        obj.y = dragY;
        this._hlZone(dragX);
      });
      this.input.on('dragend', (ptr, obj) => {
        if (obj !== this.currentCard || !this.turnOpen) return;
        const idx = this._nearZone(obj.x);
        if (idx >= 0 && obj.y > 330) {
          this.handleChoice(idx, false);
        } else {
          this.tweens.add({ targets: obj, x: W / 2, y: 210, duration: 250, ease: 'Back.Out', onComplete: () => this._float() });
        }
        this._clearHL();
      });

      try { Audio.playGameMusic(this.pack.era); } catch (e) { }

      if (this.vsMode) {
        this._showVSBanner(() => this.startRound());
      } else {
        this.startRound();
      }
    }

    _showVSBanner(cb) {
      const items = [];
      const bg = this.add.rectangle(W / 2, H / 2, 600, 200, 0x0d1829, 0.96).setStrokeStyle(2, 0xffd700, 0.7).setDepth(60);
      items.push(bg);
      const t1 = this.add.text(W / 2, H / 2 - 50, `${this.players[0].name}  VS  ${this.players[1].name}`, {
        fontFamily: 'Bungee', fontSize: '32px', color: '#ffd700'
      }).setOrigin(0.5).setDepth(61);
      items.push(t1);
      const t2 = this.add.text(W / 2, H / 2 + 10, '\u2694\uFE0F DUELO HISTORICO \u2694\uFE0F', {
        fontFamily: 'Nunito', fontSize: '22px', color: '#ff8c42', fontStyle: '800'
      }).setOrigin(0.5).setDepth(61);
      items.push(t2);
      const t3 = this.add.text(W / 2, H / 2 + 50, 'Turnos alternados - \u00A1Que gane el mejor!', {
        fontFamily: 'Nunito', fontSize: '16px', color: '#8cb6ff', fontStyle: '700'
      }).setOrigin(0.5).setDepth(61);
      items.push(t3);
      FX.confettiExplosion(this, W / 2, H / 2, 25, 65);
      this.time.delayedCall(2500, () => {
        items.forEach(it => { if (it && it.destroy) it.destroy(); });
        if (cb) cb();
      });
    }

    _drawBG() {
      this.add.rectangle(W / 2, H / 2, W, H, 0x070e1c);
      const bgVisual = getPackBackground(this.packId, this.pack && this.pack.era);
      if (hasTexture(this, bgVisual && bgVisual.key)) {
        this.add.image(W / 2, H / 2, bgVisual.key).setDisplaySize(W, H).setAlpha(0.5);
      }
      this.add.rectangle(W / 2, H / 2, W, H, 0x07111f, 0.5);
      this.add.circle(250, 100, 220, 0x1a2f5a, 0.18);
      this.add.circle(1050, 620, 280, 0x3a1a4a, 0.16);
      FX.createFloatingParticles(this, 35, 0x4466aa);
      this.add.rectangle(W / 2, this.timelineY + 10, 1220, 170, 0x0c1525, 0.65).setStrokeStyle(1, 0x2a4a6a, 0.25);
    }

    _createHud() {
      this.add.rectangle(W / 2, 38, 1240, 64, 0x0d1829, 0.85).setStrokeStyle(1, 0x3a5a8a, 0.4).setDepth(20);
      this.packText = this.add.text(25, 16, '', { fontFamily: 'Bungee', fontSize: '16px', color: '#ffd700' }).setDepth(21);
      this.roundText = this.add.text(25, 42, '', { fontFamily: 'Nunito', fontSize: '14px', color: '#8cb6ff', fontStyle: '700' }).setDepth(21);
      this.scoreText = this.add.text(W / 2, 16, '', { fontFamily: 'Bungee', fontSize: '22px', color: '#ffd700' }).setOrigin(0.5, 0).setDepth(21);
      this.livesText = this.add.text(W / 2, 42, '', { fontFamily: 'Nunito', fontSize: '15px', color: '#ff8888', fontStyle: '800' }).setOrigin(0.5, 0).setDepth(21);
      this.comboText = this.add.text(W - 240, 14, '', { fontFamily: 'Bungee', fontSize: '20px', color: '#ff8c42' }).setDepth(21);
      this.deckText = this.add.text(W - 240, 42, '', { fontFamily: 'Nunito', fontSize: '14px', color: '#8cb6ff', fontStyle: '700' }).setDepth(21);
      this.add.rectangle(W - 70, 38, 120, 50, 0x0a1224, 0.9).setStrokeStyle(1, 0x3a5a8a, 0.6).setDepth(21);
      this.timerFill = this.add.rectangle(W - 128, 38, 114, 42, 0x5de0ff, 0.9).setOrigin(0, 0.5).setDepth(22);
      this.timerLabel = this.add.text(W - 70, 38, '', { fontFamily: 'Bungee', fontSize: '20px', color: '#fff' }).setOrigin(0.5).setDepth(23);
      this.toast = this.add.text(W / 2, 90, '', { fontFamily: 'Nunito', fontSize: '22px', color: '#ffd700', fontStyle: '800', align: 'center', backgroundColor: '#1a2a46cc', padding: { left: 16, right: 16, top: 8, bottom: 8 } }).setOrigin(0.5).setDepth(30).setAlpha(0);
      this.dragHint = this.add.text(W / 2, 320, '\u2B07  Arrastra la carta o pulsa una posicion  \u2B07', { fontFamily: 'Nunito', fontSize: '18px', color: '#667799', fontStyle: '700' }).setOrigin(0.5).setDepth(15).setAlpha(0);

      // VS mode HUD
      if (this.vsMode) {
        this.vsP1Text = this.add.text(380, 22, '', { fontFamily: 'Nunito', fontSize: '14px', color: '#66ccff', fontStyle: '800' }).setDepth(21);
        this.vsP2Text = this.add.text(380, 44, '', { fontFamily: 'Nunito', fontSize: '14px', color: '#ff8888', fontStyle: '800' }).setDepth(21);
        this.vsArrow = this.add.text(365, 22, '\u25B6', { fontFamily: 'Nunito', fontSize: '14px', color: '#ffd700', fontStyle: '900' }).setDepth(21);
      }
    }

    _createPuBar() {
      this.puBtns = [];
      if (this.vsMode) return; // no powerups in VS
      const entries = Object.entries(this.powerups);
      this.add.text(25, H - 36, 'PODERES:', { fontFamily: 'Bungee', fontSize: '13px', color: '#556677' }).setDepth(21);
      entries.forEach(([key, pu], i) => {
        const btn = makeBtn(this, 190 + i * 145, H - 32, 130, 28, `${pu.label} (${pu.usesLeft})`, { fontSize: '12px', depth: 21 });
        btn.on('pointerdown', () => this._usePU(key));
        this.puBtns.push({ key, btn });
      });
    }

    _updatePuBar() {
      this.puBtns.forEach(b => {
        const pu = this.powerups[b.key];
        b.btn.lbl.setText(`${pu.label} (${pu.usesLeft})`);
        if (pu.usesLeft <= 0) { b.btn.bg.setFillStyle(0x111a2e, 0.5); b.btn.lbl.setColor('#445566'); }
      });
    }

    _usePU(key) {
      const pu = this.powerups[key];
      if (pu.usesLeft <= 0 || !this.turnOpen) return;
      pu.usesLeft--; this.powerupsUsed++;
      this._updatePuBar();
      try { Audio.playPowerUp(); } catch (e) { }
      if (key === 'hint' && this.currentEvent) this._toast(`Pista: ${this.currentEvent.hint}`, '#88ddff');
      else if (key === 'freeze') { this.frozen = true; this._toast('Tiempo congelado 10s!', '#88ffff'); try { Audio.playFreeze(); } catch (e) { } this.time.delayedCall(10000, () => { this.frozen = false; }); }
      else if (key === 'secondLife') { this.activeSecondLife = true; this._toast('Segunda oportunidad!', '#ff88aa'); }
      else if (key === 'doublePoints') { this.activeDoublePoints = true; this._toast('Doble puntos!', '#ffdd44'); }
    }

    _createRail() {
      const y = this.timelineY + 55;
      this.add.rectangle(W / 2, y, 1160, 3, 0x3a6a9a, 0.5);
      this.add.triangle(90, y, 0, -5, 0, 5, -8, 0, 0x3a6a9a, 0.4);
      this.add.triangle(W - 90, y, 0, -5, 0, 5, 8, 0, 0x3a6a9a, 0.4);
      this.add.text(80, y + 12, 'ANTIGUO', { fontFamily: 'Nunito', fontSize: '10px', color: '#445566', fontStyle: '700' }).setOrigin(0.5);
      this.add.text(W - 80, y + 12, 'RECIENTE', { fontFamily: 'Nunito', fontSize: '10px', color: '#445566', fontStyle: '700' }).setOrigin(0.5);
    }

    // ==================== ROUND ====================

    startRound() {
      this._clearTurn();
      this._destroyOverlay();
      this.roundEvents = [];

      this.lives = this.maxLives;
      this.combo = 0;
      this.frozen = false;
      this.activeDoublePoints = false;
      this.activeSecondLife = false;
      this.roundStats = { correct: 0, wrong: 0, timeout: 0, turns: 0 };

      if (this.vsMode) {
        this.players.forEach(p => { p.lives = this.maxLives; p.combo = 0; });
        this.currentPlayer = 0;
      }

      const need = this.cardsPerRound + 1;
      let pool = this.pack.events.filter(e => !this.usedIds.has(e.id));
      if (pool.length < need) { this.usedIds.clear(); pool = [...this.pack.events]; }
      const picked = TD.shuffle(pool).slice(0, need);
      picked.forEach(e => this.usedIds.add(e.id));

      this.timeline = [picked[0]];
      this.roundDeck = TD.shuffle(picked.slice(1));

      // Track seen events
      const stats = loadStats();
      picked.forEach(e => stats.seenEvents.add(e.id));
      saveStats(stats);

      this._renderTL();
      this._updateHud();
      this._showRoundBanner();
    }

    _showRoundBanner() {
      const items = [];
      const bg = this.add.rectangle(W / 2, H / 2 - 50, 580, 170, 0x0d1829, 0.95).setStrokeStyle(2, 0xffd700, 0.6).setDepth(50);
      items.push(bg);
      const t1 = this.add.text(W / 2, H / 2 - 105, `RONDA ${this.currentRound} / ${this.totalRounds}`, { fontFamily: 'Bungee', fontSize: '36px', color: '#ffd700' }).setOrigin(0.5).setDepth(51);
      items.push(t1);
      const t2 = this.add.text(W / 2, H / 2 - 55, this.pack.title, { fontFamily: 'Nunito', fontSize: '24px', color: '#d8e6ff', fontStyle: '800' }).setOrigin(0.5).setDepth(51);
      items.push(t2);
      const t3 = this.add.text(W / 2, H / 2 - 12, `${this.cardsPerRound} cartas | ${this.turnTimeMax}s/turno | ${this.lives} vidas`, { fontFamily: 'Nunito', fontSize: '16px', color: '#778899', fontStyle: '700' }).setOrigin(0.5).setDepth(51);
      items.push(t3);

      bg.setScale(0.8).setAlpha(0);
      t1.setAlpha(0); t2.setAlpha(0); t3.setAlpha(0);
      this.tweens.add({ targets: [bg, t1, t2, t3], alpha: 1, duration: 350, ease: 'Cubic.Out' });
      this.tweens.add({ targets: bg, scaleX: 1, scaleY: 1, duration: 350, ease: 'Back.Out' });

      try { Audio.playRoundStart(); } catch (e) { }
      this.time.delayedCall(1500, () => {
        this.tweens.add({
          targets: [bg, t1, t2, t3], alpha: 0, duration: 300,
          onComplete: () => { items.forEach(it => it.destroy()); this._nextTurn(); }
        });
      });
    }

    // ==================== TURN ====================

    _nextTurn() {
      this.turnOpen = false;
      this._clearZones();
      if (this.currentCard) { this.currentCard.destroy(); this.currentCard = null; }

      // Check end conditions
      if (this.vsMode) {
        const cp = this.players[this.currentPlayer];
        if (this.roundDeck.length === 0 || (cp.lives <= 0 && this.players.every(p => p.lives <= 0))) { this._finishRound(); return; }
        // Skip player with no lives
        if (cp.lives <= 0) {
          this.currentPlayer = (this.currentPlayer + 1) % 2;
          if (this.players[this.currentPlayer].lives <= 0) { this._finishRound(); return; }
        }
      } else {
        if (this.roundDeck.length === 0 || this.lives <= 0) { this._finishRound(); return; }
      }

      this.roundStats.turns++;
      this.currentEvent = this.roundDeck.shift();
      this.roundEvents.push(this.currentEvent);
      this.turnStartTime = Date.now();

      this.currentCard = this._makeCard(this.currentEvent, false, false, 310, 160);
      this.currentCard.setPosition(W + 200, 210).setDepth(26);
      this.currentCard.setSize(310, 160);
      this.currentCard.setInteractive(new Phaser.Geom.Rectangle(-155, -80, 310, 160), Phaser.Geom.Rectangle.Contains);
      this.input.setDraggable(this.currentCard);

      this.tweens.add({
        targets: this.currentCard, x: W / 2, y: 210,
        duration: 400, ease: 'Back.Out',
        onComplete: () => {
          this.turnOpen = true;
          this._renderZones();
          this._startTimer();
          this._float();
          if (this.roundStats.turns <= 2 && this.currentRound === 1) {
            this.tweens.add({ targets: this.dragHint, alpha: 0.8, duration: 400 });
            this.time.delayedCall(3000, () => { if (this.dragHint) this.tweens.add({ targets: this.dragHint, alpha: 0, duration: 300 }); });
          }
        }
      });
      try { Audio.playCardFlip(); } catch (e) { }
      this._updateHud();
    }

    _float() {
      if (!this.currentCard) return;
      this.floatingTween = this.tweens.add({ targets: this.currentCard, y: 218, duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    }

    // ==================== TIMER ====================

    _startTimer() {
      this.timeLeft = this.turnTimeMax;
      this._updateTimerVis();
      this._stopTimer();
      this.turnTimer = this.time.addEvent({
        delay: 1000, loop: true,
        callback: () => {
          if (this.frozen) return;
          this.timeLeft--;
          this._updateTimerVis();
          if (this.timeLeft <= 5 && this.timeLeft > 0) { try { Audio.playTickUrgent(); } catch (e) { } FX.timerUrgentParticles(this, W - 70, 38); }
          else if (this.timeLeft > 5) { try { Audio.playTick(); } catch (e) { } }
          if (this.timeLeft <= 0) this.handleChoice(0, true);
        }
      });
    }
    _stopTimer() { if (this.turnTimer) { this.turnTimer.remove(false); this.turnTimer = null; } }
    _updateTimerVis() {
      const r = clamp(this.timeLeft / this.turnTimeMax, 0, 1);
      this.timerFill.width = Math.max(0, 114 * r);
      this.timerFill.setFillStyle(r > 0.5 ? 0x5de0ff : r > 0.25 ? 0xffcc44 : 0xff5555, 0.9);
      this.timerLabel.setText(`${Math.max(0, this.timeLeft)}s`);
      this.timerLabel.setColor(r > 0.25 ? '#ffffff' : '#ffcccc');
    }

    // ==================== ZONES ====================

    _renderZones() {
      this._clearZones();
      const count = this.timeline.length;
      const zY = this.timelineY + 55;

      for (let i = 0; i <= count; i++) {
        const x = this._getInsX(i);
        const zW = Math.max(48, this.timelineSpacing * 0.65);
        const zH = 56;

        const bg = this.add.rectangle(x, zY, zW, zH, 0x1a3355, 0.55);
        bg.setStrokeStyle(2, 0x66d8ff, 0.7);
        bg.setInteractive({ useHandCursor: true });
        bg.setDepth(23);

        const num = this.add.text(x, zY - 8, String(i + 1), { fontFamily: 'Bungee', fontSize: '16px', color: '#88ccff' }).setOrigin(0.5).setDepth(24);
        const hint = this.add.text(x, zY + 12, 'AQUI', { fontFamily: 'Nunito', fontSize: '10px', color: '#5588aa', fontStyle: '800' }).setOrigin(0.5).setDepth(24);

        const idx = i;
        bg.on('pointerover', () => { bg.setFillStyle(0x2a5580, 0.85); bg.setStrokeStyle(3, 0xaaeeff, 0.95); num.setColor('#ffffff'); bg.setScale(1.06); });
        bg.on('pointerout', () => { bg.setFillStyle(0x1a3355, 0.55); bg.setStrokeStyle(2, 0x66d8ff, 0.7); num.setColor('#88ccff'); bg.setScale(1); });
        bg.on('pointerdown', () => this.handleChoice(idx, false));

        this.tweens.add({ targets: bg, alpha: 0.85, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.InOut', delay: i * 60 });

        this.insertionZones.push({ bg, num, hint });
      }
    }

    _clearZones() {
      this.insertionZones.forEach(z => { z.bg.destroy(); z.num.destroy(); z.hint.destroy(); });
      this.insertionZones = [];
    }

    _getInsX(index) {
      const xs = this.timelineXPositions;
      if (!xs || xs.length === 0) return W / 2;
      if (xs.length === 1) return xs[0] + (index === 0 ? -this.timelineSpacing * 0.65 : this.timelineSpacing * 0.65);
      if (index === 0) return xs[0] - this.timelineSpacing * 0.6;
      if (index >= xs.length) return xs[xs.length - 1] + this.timelineSpacing * 0.6;
      return (xs[index - 1] + xs[index]) / 2;
    }

    _hlZone(x) {
      const best = this._nearZone(x);
      this.insertionZones.forEach((z, i) => {
        if (i === best) {
          z.bg.setFillStyle(0x3a7aaa, 0.9); z.bg.setStrokeStyle(3, 0xffdd44, 1); z.num.setColor('#ffdd44'); z.bg.setScale(1.1);
        } else {
          z.bg.setFillStyle(0x1a3355, 0.55); z.bg.setStrokeStyle(2, 0x66d8ff, 0.7); z.num.setColor('#88ccff'); z.bg.setScale(1);
        }
      });
    }
    _clearHL() {
      this.insertionZones.forEach(z => {
        z.bg.setFillStyle(0x1a3355, 0.55); z.bg.setStrokeStyle(2, 0x66d8ff, 0.7); z.num.setColor('#88ccff'); z.bg.setScale(1);
      });
    }
    _nearZone(x) {
      let best = -1, bd = Infinity;
      this.insertionZones.forEach((z, i) => { const d = Math.abs(z.bg.x - x); if (d < bd) { bd = d; best = i; } });
      return bd < 140 ? best : -1;
    }

    // ==================== CHOICE ====================

    handleChoice(sel, timeout) {
      if (!this.turnOpen) return;
      this.turnOpen = false;
      this._stopTimer();
      this._clearZones();
      if (this.floatingTween) { this.floatingTween.stop(); this.floatingTween = null; }
      try { Audio.playCardPlace(); } catch (e) { }

      const tx = timeout ? W / 2 : this._getInsX(sel);
      this.tweens.killTweensOf(this.currentCard);
      this.tweens.add({
        targets: this.currentCard, x: tx, y: 350, scale: 0.65,
        duration: 250, ease: 'Sine.Out',
        onComplete: () => this._resolve(sel, timeout)
      });
    }

    _resolve(sel, timeout) {
      const ev = this.currentEvent;
      const ci = this._correctIdx(ev);
      const ok = !timeout && sel === ci;
      const pt = (Date.now() - this.turnStartTime) / 1000;

      if (ok) {
        this.roundStats.correct++; this.totalCorrect++;
        if (this.vsMode) {
          const cp = this.players[this.currentPlayer];
          cp.correct++; cp.combo++;
          if (cp.combo > cp.bestCombo) cp.bestCombo = cp.combo;
          let pts = 2; if (cp.combo >= 3) pts += cp.combo;
          cp.score += pts; this.score += pts;
        } else {
          this.combo++;
          if (this.combo > this.bestCombo) this.bestCombo = this.combo;
          let pts = 2;
          if (this.combo >= 3) pts += this.combo;
          if (this.activeDoublePoints) { pts *= 2; this.activeDoublePoints = false; }
          this.score += pts;
          if (this.combo >= 3) { try { Audio.playCombo(this.combo); } catch (e) { } FX.comboEffect(this, this.currentCard.x, this.currentCard.y - 30, this.combo); }
        }
        try { Audio.playCorrect(); } catch (e) { }
        FX.correctEffect(this, this.currentCard.x, this.currentCard.y);
        if (!this.vsMode && this.combo < 3) {
          FX.floatingText(this, this.currentCard.x, this.currentCard.y - 40, TD.randomMsg('correct'), { fontSize: '26px', color: '#6bcb77' }, 60);
        }
        const st = loadStats(); if (pt < st.fastestPlacement) { st.fastestPlacement = pt; saveStats(st); }
      } else if (timeout) {
        this.roundStats.timeout++; this.totalTimeout++;
        if (this.vsMode) {
          const cp = this.players[this.currentPlayer];
          cp.timeout++; cp.combo = 0;
          cp.lives--; cp.score = Math.max(0, cp.score - 1);
        } else {
          this.combo = 0;
          if (this.activeSecondLife) { this.activeSecondLife = false; this._toast('Segunda oportunidad te salvo!', '#ff88aa'); }
          else { this.lives--; this.score = Math.max(0, this.score - 1); }
        }
        try { Audio.playTimeout(); } catch (e) { } FX.timeoutEffect(this);
        FX.floatingText(this, W / 2, H / 2 - 60, TD.randomMsg('timeout'), { fontSize: '26px', color: '#ff8c42' }, 60);
      } else {
        this.roundStats.wrong++; this.totalWrong++;
        if (this.vsMode) {
          const cp = this.players[this.currentPlayer];
          cp.wrong++; cp.combo = 0;
          cp.lives--; cp.score = Math.max(0, cp.score - 1);
        } else {
          this.combo = 0;
          if (this.activeSecondLife) { this.activeSecondLife = false; this._toast('Segunda oportunidad te salvo!', '#ff88aa'); }
          else { this.lives--; this.score = Math.max(0, this.score - 1); }
        }
        try { Audio.playWrong(); } catch (e) { } FX.wrongEffect(this, this.currentCard.x, this.currentCard.y);
        FX.floatingText(this, this.currentCard.x, this.currentCard.y - 40, `${TD.randomMsg('wrong')} (pos ${ci + 1})`, { fontSize: '22px', color: '#ff6b6b' }, 60);
      }

      // After resolve: flip, place in timeline, then bonus question or continue
      this._flipReveal(this.currentCard, ev.year, () => {
        this.timeline.splice(ci, 0, ev);
        this.tweens.add({
          targets: this.currentCard, alpha: 0, scale: 0.4, duration: 250,
          onComplete: () => {
            if (this.currentCard) this.currentCard.destroy();
            this.currentCard = null;
            this._renderTL(ev.id);
            this._updateHud();

            if (ok && ev.quizQuestion) {
              // Show bonus question
              this.time.delayedCall(700, () => this._showBonusQuestion(ev));
            } else if (!ok) {
              // Show fun fact toast for wrong/timeout
              const fact = ev.funFact || ev.description;
              this._toast(fact, '#ffaa44');
              this.time.delayedCall(2200, () => {
                if (this.vsMode) this.currentPlayer = (this.currentPlayer + 1) % 2;
                this._nextTurn();
              });
            } else {
              this.time.delayedCall(700, () => {
                if (this.vsMode) this.currentPlayer = (this.currentPlayer + 1) % 2;
                this._nextTurn();
              });
            }
          }
        });
      });
    }

    _showBonusQuestion(ev) {
      const items = [];
      // Overlay
      const overlay = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.75).setDepth(70);
      items.push(overlay);

      const panel = this.add.rectangle(W / 2, H / 2, 700, 420, 0x0d1829, 0.97).setStrokeStyle(2, 0xffd700, 0.7).setDepth(71);
      items.push(panel);

      // Fun fact
      const fact = ev.funFact || ev.description;
      const factText = this.add.text(W / 2, H / 2 - 155, `\u2728 ${fact}`, {
        fontFamily: 'Nunito', fontSize: '16px', color: '#ffd700', fontStyle: '700',
        align: 'center', wordWrap: { width: 620 }
      }).setOrigin(0.5).setDepth(72);
      items.push(factText);

      // Question
      const q = ev.quizQuestion;
      const qText = this.add.text(W / 2, H / 2 - 90, q.question, {
        fontFamily: 'Nunito', fontSize: '20px', color: '#d8e6ff', fontStyle: '800',
        align: 'center', wordWrap: { width: 620 }
      }).setOrigin(0.5).setDepth(72);
      items.push(qText);

      // Timer
      let bonusTime = 12;
      const bonusTimerText = this.add.text(W / 2, H / 2 - 55, `${bonusTime}s`, {
        fontFamily: 'Bungee', fontSize: '18px', color: '#88ccff'
      }).setOrigin(0.5).setDepth(72);
      items.push(bonusTimerText);

      let answered = false;
      const bonusTimer = this.time.addEvent({
        delay: 1000, loop: true,
        callback: () => {
          bonusTime--;
          bonusTimerText.setText(`${Math.max(0, bonusTime)}s`);
          if (bonusTime <= 3) bonusTimerText.setColor('#ff6666');
          if (bonusTime <= 0 && !answered) {
            answered = true;
            bonusTimer.remove(false);
            // Timeout
            const correctOpt = q.options[q.correct];
            const rText = this.add.text(W / 2, H / 2 + 130, `La respuesta era: ${correctOpt}`, {
              fontFamily: 'Nunito', fontSize: '18px', color: '#ff6666', fontStyle: '800'
            }).setOrigin(0.5).setDepth(73);
            items.push(rText);
            this.time.delayedCall(2000, () => {
              items.forEach(it => { if (it && it.destroy) it.destroy(); });
              if (this.vsMode) this.currentPlayer = (this.currentPlayer + 1) % 2;
              this._nextTurn();
            });
          }
        }
      });

      // Option buttons
      q.options.forEach((opt, i) => {
        const oy = H / 2 - 20 + i * 50;
        const btn = makeBtn(this, W / 2, oy, 580, 42, opt, { fontSize: '16px', depth: 72 });
        items.push(btn);
        btn.on('pointerdown', () => {
          if (answered) return;
          answered = true;
          bonusTimer.remove(false);
          try { Audio.playClick(); } catch (e) { }

          if (i === q.correct) {
            this.bonusCorrect++;
            if (this.vsMode) this.players[this.currentPlayer].score += 3;
            else this.score += 3;
            btn.setActive(true);
            try { Audio.playCorrect(); } catch (e) { }
            FX.floatingText(this, W / 2, oy - 30, '\u00A1Sabio! +3', { fontSize: '24px', color: '#6bcb77' }, 75);
            FX.screenFlash(this, 0x66ff66, 0.2, 300);
          } else {
            btn.bg.setFillStyle(0x662222, 0.9);
            btn.lbl.setColor('#ff6666');
            const correctOpt = q.options[q.correct];
            const rText = this.add.text(W / 2, H / 2 + 165, `La respuesta era: ${correctOpt}`, {
              fontFamily: 'Nunito', fontSize: '16px', color: '#ff6666', fontStyle: '700'
            }).setOrigin(0.5).setDepth(73);
            items.push(rText);
            try { Audio.playWrong(); } catch (e) { }
          }
          this._updateHud();
          this.time.delayedCall(2000, () => {
            items.forEach(it => { if (it && it.destroy) it.destroy(); });
            if (this.vsMode) this.currentPlayer = (this.currentPlayer + 1) % 2;
            this._nextTurn();
          });
        });
      });
    }

    _flipReveal(card, year, cb) {
      const yt = card.getData('yearText');
      try { Audio.playCardFlip(); } catch (e) { }
      this.tweens.add({
        targets: card, scaleX: 0.05, duration: 140,
        onComplete: () => { if (yt) yt.setText(String(year)); this.tweens.add({ targets: card, scaleX: 0.65, duration: 160, onComplete: cb }); }
      });
    }

    _correctIdx(ev) {
      for (let i = 0; i < this.timeline.length; i++) {
        if (ev.year < this.timeline[i].year) return i;
        if (ev.year === this.timeline[i].year && ev.id < this.timeline[i].id) return i;
      }
      return this.timeline.length;
    }

    // ==================== TIMELINE ====================

    _renderTL(hlId) {
      this.timelineCards.forEach(c => c.destroy());
      this.timelineCards = [];
      const ordered = [...this.timeline].sort(byYear);
      this.timeline = ordered;
      const n = ordered.length;
      const cw = clamp(130 - n * 4, 70, 130);
      const ch = 90;
      this.timelineSpacing = cw + 12;
      const tot = n * this.timelineSpacing;
      const sx = W / 2 - tot / 2 + this.timelineSpacing / 2;
      this.timelineXPositions = [];

      for (let i = 0; i < n; i++) {
        const ev = ordered[i];
        const x = sx + i * this.timelineSpacing;
        this.timelineXPositions.push(x);
        const card = this._makeCard(ev, true, true, cw, ch);
        card.setPosition(x, this.timelineY).setScale(0.3).setAlpha(0.3).setDepth(14);
        this.timelineCards.push(card);
        this.tweens.add({ targets: card, scale: 1, alpha: 1, duration: 250, delay: i * 15, ease: 'Back.Out' });
        if (hlId && ev.id === hlId) {
          FX.cardGlow(this, x, this.timelineY, cw, ch, 0x6bcb77, 14);
          this.tweens.add({ targets: card, y: this.timelineY - 10, duration: 250, yoyo: true, repeat: 2, ease: 'Sine.InOut' });
        }
      }
    }

    // ==================== CARD ====================

    _makeCard(ev, revealYear, compact, cw, ch) {
      const w = cw || (compact ? 120 : 310), h = ch || (compact ? 90 : 160);
      const pal = ev.palette || ['#444466', '#8888aa'];
      const c = this.add.container(0, 0);
      const back = this.add.rectangle(0, 0, w, h, hexToInt(pal[0]), 0.95).setStrokeStyle(2, 0xf3e4c9, 0.6);
      const accent = this.add.rectangle(0, -h * 0.24, w - 4, h * 0.32, hexToInt(pal[1]), compact ? 0.3 : 0.18);
      const visual = getEventVisual(ev);
      let hero = null;
      if (!compact && hasTexture(this, visual && visual.key)) {
        hero = this.add.image(0, -38, visual.key).setDisplaySize(w - 6, 76).setAlpha(0.95);
      }
      const heroShade = !compact ? this.add.rectangle(0, -38, w - 6, 76, 0x07111f, hero ? 0.28 : 0) : null;
      let icon;
      const iconY = compact ? -h / 2 + 12 : -h / 2 + 14;
      try { icon = this.add.image(w / 2 - 12, iconY, ev.icon || 'scroll').setScale(compact ? 0.5 : 0.58).setAlpha(compact ? 1 : 0.95); } catch (e) { icon = this.add.circle(w / 2 - 12, iconY, 4, 0xffd700); }
      const title = this.add.text(0, compact ? -4 : 10, ev.title, { fontFamily: 'Nunito', fontSize: compact ? '12px' : '17px', fontStyle: '900', color: '#fff5de', align: 'center', wordWrap: { width: w - 16, useAdvancedWrap: true } }).setOrigin(0.5);
      let desc = null;
      if (!compact) desc = this.add.text(0, 58, ev.description, { fontFamily: 'Nunito', fontSize: '12px', fontStyle: '700', color: '#dde4ff', align: 'center', wordWrap: { width: w - 24, useAdvancedWrap: true } }).setOrigin(0.5);
      const ytW = compact ? w * 0.75 : w * 0.55;
      const ytag = this.add.rectangle(0, h / 2 - 14, ytW, compact ? 18 : 22, 0x0d1829, 0.9).setStrokeStyle(1, 0xffd700, 0.6);
      const ytxt = this.add.text(0, h / 2 - 14, revealYear ? String(ev.year) : 'Año ?', { fontFamily: 'Bungee', fontSize: compact ? '12px' : '16px', color: revealYear ? '#ffd700' : '#88aacc' }).setOrigin(0.5);
      const els = [back];
      if (hero) els.push(hero);
      if (heroShade) els.push(heroShade);
      els.push(accent, icon, title, ytag, ytxt);
      if (desc) els.push(desc);
      c.add(els);
      c.setData('yearText', ytxt);
      c.setData('event', ev);
      return c;
    }

    // ==================== FINISH ====================

    _finishRound() {
      this._clearTurn();
      this._clearZones();
      try { Audio.playRoundEnd(); } catch (e) { }
      const perfect = this.roundStats.wrong === 0 && this.roundStats.timeout === 0;
      if (perfect) { const s = loadStats(); s.perfectRounds = (s.perfectRounds || 0) + 1; saveStats(s); }
      this._showRoundResult(perfect);
    }

    _showRoundResult(perfect) {
      this._destroyOverlay();
      const items = [];

      const bg = this.add.rectangle(W / 2, H / 2, 640, 380, 0x0d1829, 0.96).setStrokeStyle(2, 0xffd700, 0.6).setDepth(60);
      items.push(bg);
      const t1 = this.add.text(W / 2, H / 2 - 155, `FIN DE RONDA ${this.currentRound}`, { fontFamily: 'Bungee', fontSize: '32px', color: '#ffd700' }).setOrigin(0.5).setDepth(61);
      items.push(t1);
      const acc = this.roundStats.turns > 0 ? this.roundStats.correct / this.roundStats.turns : 0;
      const sc = perfect ? 5 : Math.max(1, Math.round(acc * 5));
      let ss = '';
      for (let i = 0; i < 5; i++) ss += i < sc ? '\u2605 ' : '\u2606 ';
      const stars = this.add.text(W / 2, H / 2 - 108, ss, { fontFamily: 'Nunito', fontSize: '34px', color: '#ffd700' }).setOrigin(0.5).setDepth(61);
      items.push(stars);
      const lines = `Aciertos: ${this.roundStats.correct}  |  Errores: ${this.roundStats.wrong}  |  Timeout: ${this.roundStats.timeout}\nCombo: x${this.vsMode ? Math.max(this.players[0].bestCombo, this.players[1].bestCombo) : this.bestCombo}  |  Puntos: ${this.score}`;
      const sum = this.add.text(W / 2, H / 2 - 30, lines, { fontFamily: 'Nunito', fontSize: '22px', color: '#d8e6ff', fontStyle: '800', align: 'center', lineSpacing: 8 }).setOrigin(0.5).setDepth(61);
      items.push(sum);
      if (perfect) FX.confettiExplosion(this, W / 2, H / 2 - 60, 35, 65);

      const nextLabel = this.currentRound < this.totalRounds ? 'Siguiente ronda' : 'Resultado final';
      const nextBtn = makeBtn(this, W / 2, H / 2 + 70, 280, 44, nextLabel, { primary: true, depth: 62 });
      items.push(nextBtn);
      nextBtn.on('pointerdown', () => {
        try { Audio.playClick(); } catch (e) { }
        this._destroyOverlay();
        if (this.currentRound < this.totalRounds) { this.currentRound++; this.startRound(); }
        else { this._endGame(); }
      });

      const menuBtn = makeBtn(this, W / 2, H / 2 + 122, 280, 40, 'Volver al menu', { depth: 62 });
      items.push(menuBtn);
      menuBtn.on('pointerdown', () => {
        try { Audio.playClick(); Audio.stopMusic(0.5); } catch (e) { }
        this.scene.start('menu');
      });

      this._overlayItems = items;
    }

    _destroyOverlay() {
      this._overlayItems.forEach(item => {
        if (item && item.destroy) item.destroy();
      });
      this._overlayItems = [];
    }

    _endGame() {
      const stats = loadStats();
      stats.gamesCompleted++;
      stats.totalCorrect += this.totalCorrect;
      stats.totalWrong += this.totalWrong;
      if (this.bestCombo > stats.bestCombo) stats.bestCombo = this.bestCombo;
      stats.packsPlayed.add(this.packId);
      if (this.powerupsUsed === 0 && this.lives > 0) stats.winsNoPowerups++;
      saveStats(stats);
      this._checkAch(stats);
      try { Audio.stopMusic(0.8); } catch (e) { }

      // Go to review scene first
      this.scene.start('review', {
        events: this.roundEvents,
        score: this.score, totalCorrect: this.totalCorrect, totalWrong: this.totalWrong,
        totalTimeout: this.totalTimeout, bestCombo: this.bestCombo, lives: this.lives,
        maxLives: this.maxLives, rounds: this.totalRounds, packTitle: this.pack.title,
        difficulty: this.difficulty, packId: this.packId,
        mode: this.vsMode ? 'vs' : 'classic',
        players: this.vsMode ? this.players : null,
        bonusCorrect: this.bonusCorrect
      });
    }

    _checkAch(stats) {
      TD.ACHIEVEMENTS.forEach(a => {
        if (stats.unlockedAchievements.includes(a.id)) return;
        try { if (a.condition(stats)) { stats.unlockedAchievements.push(a.id); saveStats(stats); try { Audio.playAchievement(); } catch (e) { } FX.achievementPopup(this, a.title, a.description); } } catch (e) { }
      });
    }

    _updateHud() {
      this.packText.setText(this.pack.title);
      this.roundText.setText(`Ronda ${this.currentRound}/${this.totalRounds}`);

      if (this.vsMode) {
        this.scoreText.setText(`${this.players[0].score} - ${this.players[1].score}`);
        const cp = this.players[this.currentPlayer];
        let h = '';
        for (let i = 0; i < this.maxLives; i++) h += i < cp.lives ? '\u2764 ' : '\u{1F5A4} ';
        this.livesText.setText(h);
        this.vsP1Text.setText(`${this.players[0].name}: ${this.players[0].score}`);
        this.vsP2Text.setText(`${this.players[1].name}: ${this.players[1].score}`);
        this.vsArrow.setY(this.currentPlayer === 0 ? 22 : 44);
        this.comboText.setText('');
      } else {
        this.scoreText.setText(`${this.score} pts`);
        let h = '';
        for (let i = 0; i < this.maxLives; i++) h += i < this.lives ? '\u2764 ' : '\u{1F5A4} ';
        this.livesText.setText(h);
        this.comboText.setText(this.combo >= 2 ? `x${this.combo} COMBO` : '');
      }
      this.deckText.setText(`Quedan: ${this.roundDeck.length + (this.turnOpen ? 1 : 0)} cartas`);
      if (!this.vsMode) this._updatePuBar();
    }

    _toast(msg, color) {
      this.toast.setText(msg).setColor(color || '#ffd700');
      this.tweens.killTweensOf(this.toast);
      this.toast.setAlpha(0).setY(90);
      this.tweens.add({ targets: this.toast, alpha: 1, y: 96, duration: 200 });
      this.time.delayedCall(1500, () => { this.tweens.add({ targets: this.toast, alpha: 0, y: 85, duration: 250 }); });
    }

    _clearTurn() {
      this.turnOpen = false;
      this._stopTimer();
      this.frozen = false;
      if (this.floatingTween) { this.floatingTween.stop(); this.floatingTween = null; }
      if (this.currentCard) { this.currentCard.destroy(); this.currentCard = null; }
    }
  }

  // ========================================================
  //  REVIEW SCENE
  // ========================================================
  class ReviewScene extends Phaser.Scene {
    constructor() { super('review'); }
    init(data) { this.d = data; }
    create() {
      this.add.rectangle(W / 2, H / 2, W, H, 0x060d1a);
      FX.createFloatingParticles(this, 30, 0x4488ff);

      this.add.text(W / 2, 40, '\u{1F4D6} REPASO DE LA RONDA', { fontFamily: 'Bungee', fontSize: '32px', color: '#ffd700' }).setOrigin(0.5);

      const events = [...(this.d.events || [])].sort(byYear);
      this.allEvents = events;
      this.pageIndex = 0;
      this.perPage = 5;

      // Card area
      this.cardItems = [];
      this._renderPage();

      // Navigation
      this.prevBtn = makeBtn(this, W / 2 - 140, H - 50, 120, 40, '\u25C0 Anterior');
      this.prevBtn.on('pointerdown', () => {
        if (this.pageIndex > 0) { this.pageIndex--; this._renderPage(); }
        try { Audio.playClick(); } catch (e) { }
      });
      this.nextBtn = makeBtn(this, W / 2 + 140, H - 50, 120, 40, 'Siguiente \u25B6');
      this.nextBtn.on('pointerdown', () => {
        if ((this.pageIndex + 1) * this.perPage < this.allEvents.length) { this.pageIndex++; this._renderPage(); }
        try { Audio.playClick(); } catch (e) { }
      });

      const contBtn = makeBtn(this, W / 2, H - 50, 200, 44, 'Continuar \u2192', { primary: true });
      contBtn.on('pointerdown', () => {
        try { Audio.playClick(); } catch (e) { }
        this.scene.start('results', this.d);
      });
    }

    _renderPage() {
      this.cardItems.forEach(it => { if (it && it.destroy) it.destroy(); });
      this.cardItems = [];
      const start = this.pageIndex * this.perPage;
      const end = Math.min(start + this.perPage, this.allEvents.length);
      const pageCount = Math.ceil(this.allEvents.length / this.perPage);

      const pageLabel = this.add.text(W / 2, 75, `Pagina ${this.pageIndex + 1}/${pageCount}`, {
        fontFamily: 'Nunito', fontSize: '14px', color: '#667799', fontStyle: '700'
      }).setOrigin(0.5);
      this.cardItems.push(pageLabel);

      for (let i = start; i < end; i++) {
        const ev = this.allEvents[i];
        const yPos = 120 + (i - start) * 110;
        const pal = ev.palette || ['#334466', '#6688aa'];

        const cardBg = this.add.rectangle(W / 2, yPos, 1000, 95, hexToInt(pal[0]), 0.85).setStrokeStyle(1, 0xffd700, 0.4);
        this.cardItems.push(cardBg);

        const yearText = this.add.text(80, yPos - 18, String(ev.year), { fontFamily: 'Bungee', fontSize: '24px', color: '#ffd700' }).setOrigin(0, 0.5);
        this.cardItems.push(yearText);

        const titleText = this.add.text(200, yPos - 22, ev.title, { fontFamily: 'Nunito', fontSize: '18px', color: '#fff5de', fontStyle: '900' });
        this.cardItems.push(titleText);

        const descText = this.add.text(200, yPos + 5, ev.description, { fontFamily: 'Nunito', fontSize: '13px', color: '#aabbcc', fontStyle: '700', wordWrap: { width: 600 } });
        this.cardItems.push(descText);

        const fact = ev.funFact || '';
        if (fact) {
          const factText = this.add.text(200, yPos + 28, `\u2728 ${fact}`, { fontFamily: 'Nunito', fontSize: '12px', color: '#ffd700', fontStyle: '700', wordWrap: { width: 600 } });
          this.cardItems.push(factText);
        }

        try {
          const icon = this.add.image(1180, yPos, ev.icon || 'scroll').setScale(0.7).setAlpha(0.6);
          this.cardItems.push(icon);
        } catch (e) { }
      }
    }
  }

  // ========================================================
  //  RESULT SCENE
  // ========================================================
  class ResultScene extends Phaser.Scene {
    constructor() { super('results'); }
    init(data) { this.d = data; }
    create() {
      const d = this.d;
      try { Audio.playResultsMusic(); } catch (e) { }
      this.add.rectangle(W / 2, H / 2, W, H, 0x060d1a);
      FX.createFloatingParticles(this, 40, 0xffd700);

      this.add.text(W / 2, 40, 'PARTIDA COMPLETADA', { fontFamily: 'Bungee', fontSize: '38px', color: '#ffd700' }).setOrigin(0.5);

      const tot = d.totalCorrect + d.totalWrong + d.totalTimeout;
      const acc = tot > 0 ? d.totalCorrect / tot : 0;
      const sn = d.lives > 0 ? Math.max(1, Math.round(acc * 5)) : 0;
      for (let i = 0; i < 5; i++) {
        const s = this.add.star(W / 2 + (i - 2) * 55, 100, 5, 12, 28, i < sn ? 0xffd700 : 0x333355);
        s.setAlpha(0).setScale(0);
        this.tweens.add({ targets: s, alpha: 1, scale: 1, duration: 400, delay: 300 + i * 180, ease: 'Back.Out' });
        if (i < sn) this.time.delayedCall(300 + i * 180, () => { FX.sparkle(this, W / 2 + (i - 2) * 55, 100, 0xffd700, 50); try { Audio.playTick(); } catch (e) { } });
      }

      // VS Results
      if (d.mode === 'vs' && d.players) {
        this._showVSResults(d);
      } else {
        this._showClassicResults(d, acc);
      }

      // XP Animation
      this.time.delayedCall(1500, () => this._showXP(d, acc));

      // Buttons
      this.time.delayedCall(2500, () => {
        const bonusBtn = makeBtn(this, W / 2 - 220, 620, 200, 48, '\u{1F3B2} Ronda Bonus', { primary: true });
        bonusBtn.on('pointerdown', () => {
          try { Audio.stopMusic(0.5); } catch (e) { }
          this.scene.start('guessyear', d);
        });
        bonusBtn.setAlpha(0); this.tweens.add({ targets: [bonusBtn.bg, bonusBtn.lbl], alpha: 1, duration: 400 });

        const lbBtn = makeBtn(this, W / 2, 620, 200, 48, '\u{1F4CA} Clasificacion');
        lbBtn.on('pointerdown', () => { try { Audio.stopMusic(0.5); } catch (e) { } this.scene.start('leaderboard'); });
        lbBtn.setAlpha(0); this.tweens.add({ targets: [lbBtn.bg, lbBtn.lbl], alpha: 1, duration: 400 });

        const menuBtn = makeBtn(this, W / 2 + 220, 620, 200, 48, '\u{1F504} Jugar otra vez');
        menuBtn.on('pointerdown', () => { try { Audio.stopMusic(0.5); } catch (e) { } this.scene.start('menu'); });
        menuBtn.setAlpha(0); this.tweens.add({ targets: [menuBtn.bg, menuBtn.lbl], alpha: 1, duration: 400 });
      });
    }

    _showClassicResults(d, acc) {
      this.add.rectangle(W / 2, 270, 680, 200, 0x0d1829, 0.9).setStrokeStyle(1, 0x3a5a8a, 0.5);
      const items = [
        { l: 'Puntuacion', v: String(d.score), c: '#ffd700' },
        { l: 'Aciertos', v: String(d.totalCorrect), c: '#6bcb77' },
        { l: 'Errores', v: String(d.totalWrong), c: '#ff6b6b' },
        { l: 'Timeout', v: String(d.totalTimeout), c: '#ff8c42' },
        { l: 'Mejor combo', v: `x${d.bestCombo}`, c: '#ff8c42' },
        { l: 'Vidas', v: `${d.lives}/${d.maxLives}`, c: '#ff8888' }
      ];
      items.forEach((s, i) => {
        const col = i < 3 ? 0 : 1, row = i % 3;
        const bx = W / 2 - 140 + col * 280, by = 195 + row * 55;
        this.add.text(bx - 90, by, s.l, { fontFamily: 'Nunito', fontSize: '18px', color: '#8899bb', fontStyle: '700' });
        const val = this.add.text(bx + 90, by, s.v, { fontFamily: 'Bungee', fontSize: '22px', color: s.c }).setOrigin(0.5, 0).setAlpha(0);
        this.tweens.add({ targets: val, alpha: 1, duration: 300, delay: 800 + i * 120 });
      });

      const good = acc >= 0.6 && d.lives > 0;
      const msg = good ? TD.randomMsg('finalGood') : TD.randomMsg('finalBad');
      const msgTxt = this.add.text(W / 2, 375, msg, { fontFamily: 'Nunito', fontSize: '22px', color: good ? '#6bcb77' : '#ff8c42', fontStyle: '900' }).setOrigin(0.5).setAlpha(0);
      this.tweens.add({ targets: msgTxt, alpha: 1, duration: 400, delay: 1800 });
      if (good) this.time.delayedCall(1000, () => { try { Audio.playVictory(); } catch (e) { } FX.victoryFireworks(this); });

      this.add.text(W / 2, 405, `${d.packTitle}  |  ${TD.DIFFICULTY[d.difficulty]?.label || d.difficulty}  |  ${d.rounds} rondas`, { fontFamily: 'Nunito', fontSize: '14px', color: '#445566', fontStyle: '700' }).setOrigin(0.5);

      // Submit score
      const stats = loadStats();
      submitScoreEntry({
        playerName: stats.playerName,
        avatar: stats.playerAvatar,
        score: d.score,
        mode: d.mode || 'classic',
        packId: d.packId,
        difficulty: d.difficulty,
        correct: d.totalCorrect,
        wrong: d.totalWrong + d.totalTimeout,
        bestCombo: d.bestCombo,
        xp: stats.xp,
        level: stats.level
      });
    }

    _showVSResults(d) {
      const p1 = d.players[0], p2 = d.players[1];
      const winner = p1.score > p2.score ? p1 : (p2.score > p1.score ? p2 : null);

      this.add.rectangle(W / 2, 280, 700, 250, 0x0d1829, 0.9).setStrokeStyle(1, 0x3a5a8a, 0.5);

      // Player 1
      this.add.text(W / 2 - 160, 185, p1.name, { fontFamily: 'Bungee', fontSize: '22px', color: '#66ccff' }).setOrigin(0.5);
      this.add.text(W / 2 - 160, 220, `${p1.score} pts`, { fontFamily: 'Bungee', fontSize: '28px', color: '#ffd700' }).setOrigin(0.5);
      this.add.text(W / 2 - 160, 260, `Aciertos: ${p1.correct}`, { fontFamily: 'Nunito', fontSize: '16px', color: '#6bcb77', fontStyle: '700' }).setOrigin(0.5);
      this.add.text(W / 2 - 160, 285, `Errores: ${p1.wrong}`, { fontFamily: 'Nunito', fontSize: '16px', color: '#ff6b6b', fontStyle: '700' }).setOrigin(0.5);
      this.add.text(W / 2 - 160, 310, `Mejor combo: x${p1.bestCombo}`, { fontFamily: 'Nunito', fontSize: '14px', color: '#ff8c42', fontStyle: '700' }).setOrigin(0.5);

      // VS
      this.add.text(W / 2, 220, 'VS', { fontFamily: 'Bungee', fontSize: '30px', color: '#ff8c42' }).setOrigin(0.5);

      // Player 2
      this.add.text(W / 2 + 160, 185, p2.name, { fontFamily: 'Bungee', fontSize: '22px', color: '#ff8888' }).setOrigin(0.5);
      this.add.text(W / 2 + 160, 220, `${p2.score} pts`, { fontFamily: 'Bungee', fontSize: '28px', color: '#ffd700' }).setOrigin(0.5);
      this.add.text(W / 2 + 160, 260, `Aciertos: ${p2.correct}`, { fontFamily: 'Nunito', fontSize: '16px', color: '#6bcb77', fontStyle: '700' }).setOrigin(0.5);
      this.add.text(W / 2 + 160, 285, `Errores: ${p2.wrong}`, { fontFamily: 'Nunito', fontSize: '16px', color: '#ff6b6b', fontStyle: '700' }).setOrigin(0.5);
      this.add.text(W / 2 + 160, 310, `Mejor combo: x${p2.bestCombo}`, { fontFamily: 'Nunito', fontSize: '14px', color: '#ff8c42', fontStyle: '700' }).setOrigin(0.5);

      // Winner
      if (winner) {
        const winText = this.add.text(W / 2, 370, `\u{1F451} ${winner.name} gana! \u{1F451}`, {
          fontFamily: 'Bungee', fontSize: '28px', color: '#ffd700'
        }).setOrigin(0.5).setAlpha(0).setScale(0.5);
        this.tweens.add({ targets: winText, alpha: 1, scale: 1, duration: 600, delay: 1200, ease: 'Back.Out' });
        this.time.delayedCall(1200, () => { FX.confettiExplosion(this, W / 2, 370, 40, 50); try { Audio.playVictory(); } catch (e) { } });
      } else {
        this.add.text(W / 2, 370, '\u{1F91D} Empate!', { fontFamily: 'Bungee', fontSize: '28px', color: '#88ccff' }).setOrigin(0.5);
      }

      this.add.text(W / 2, 410, `${d.packTitle}  |  ${TD.DIFFICULTY[d.difficulty]?.label || d.difficulty}  |  ${d.rounds} rondas`, { fontFamily: 'Nunito', fontSize: '14px', color: '#445566', fontStyle: '700' }).setOrigin(0.5);
    }

    _showXP(d, acc) {
      const stats = loadStats();
      const perfect = d.totalWrong === 0 && d.totalTimeout === 0;
      const xpEarned = 30 + (d.totalCorrect * 8) + (d.bestCombo * 5) + ((d.bonusCorrect || 0) * 10) + (perfect ? 50 : 0);
      const oldXp = stats.xp;
      const oldLevel = getLevelInfo(oldXp);
      stats.xp += xpEarned;
      const newLevel = getLevelInfo(stats.xp);
      stats.level = newLevel.level;
      stats.bonusCorrect = (stats.bonusCorrect || 0) + (d.bonusCorrect || 0);
      saveStats(stats);

      // XP earned text
      const xpY = (d.mode === 'vs') ? 450 : 440;
      const xpLabel = this.add.text(W / 2, xpY, 'XP ganado: +0', {
        fontFamily: 'Bungee', fontSize: '24px', color: '#ffd700'
      }).setOrigin(0.5).setAlpha(0);
      this.tweens.add({ targets: xpLabel, alpha: 1, duration: 300 });

      // Count up animation
      let counted = 0;
      const countUp = this.time.addEvent({
        delay: 30, repeat: xpEarned - 1,
        callback: () => {
          counted++;
          xpLabel.setText(`XP ganado: +${counted}`);
        }
      });

      // XP bar
      const barY = xpY + 35;
      this.add.rectangle(W / 2, barY, 300, 14, 0x1a2744).setStrokeStyle(1, 0x3a5a8a);
      const xpBar = this.add.rectangle(W / 2 - 148, barY, 0, 10, 0xffd700).setOrigin(0, 0.5);
      const ratio = clamp(newLevel.xpInLevel / newLevel.xpForNext, 0, 1);
      this.tweens.add({ targets: xpBar, width: 296 * ratio, duration: 1500, delay: 500, ease: 'Cubic.Out' });
      this.add.text(W / 2, barY + 16, `Nv.${newLevel.level} ${newLevel.title}`, {
        fontFamily: 'Nunito', fontSize: '14px', color: '#8cb6ff', fontStyle: '700'
      }).setOrigin(0.5);

      // Level up check
      if (newLevel.level > oldLevel.level) {
        this.time.delayedCall(2000, () => {
          FX.confettiExplosion(this, W / 2, xpY - 20, 50, 50);
          FX.screenFlash(this, 0xffd700, 0.3, 600);
          const lvlUp = this.add.text(W / 2, xpY - 30, `\u00A1SUBISTE DE NIVEL!\n${newLevel.title}`, {
            fontFamily: 'Bungee', fontSize: '26px', color: '#ffd700', align: 'center'
          }).setOrigin(0.5).setAlpha(0).setScale(0.5);
          this.tweens.add({ targets: lvlUp, alpha: 1, scale: 1, duration: 600, ease: 'Back.Out' });
          try { Audio.playAchievement(); } catch (e) { }
        });
      }
    }
  }

  // ========================================================
  //  GUESS YEAR SCENE
  // ========================================================
  class GuessYearScene extends Phaser.Scene {
    constructor() { super('guessyear'); }
    init(data) { this.d = data; }
    create() {
      this.add.rectangle(W / 2, H / 2, W, H, 0x060d1a);
      FX.createFloatingParticles(this, 25, 0xffd700);

      this.add.text(W / 2, 35, '\u{1F3AF} ADIVINA EL AÑO', { fontFamily: 'Bungee', fontSize: '34px', color: '#ffd700' }).setOrigin(0.5);

      // Pick 5 random events from the pack
      const pack = TD.getPack(this.d.packId || 'edad_moderna');
      const allEvents = TD.shuffle(pack.events).slice(0, 5);
      this.guessEvents = allEvents;
      this.currentGuess = 0;
      this.totalBonusScore = 0;
      this.guessItems = [];

      // Get year range
      const years = pack.events.map(e => e.year);
      this.minYear = Math.min(...years);
      this.maxYear = Math.max(...years);

      this._showGuessEvent();
    }

    _showGuessEvent() {
      this.guessItems.forEach(it => { if (it && it.destroy) it.destroy(); });
      this.guessItems = [];

      if (this.currentGuess >= this.guessEvents.length) {
        this._showGuessResults();
        return;
      }

      const ev = this.guessEvents[this.currentGuess];
      const progressText = this.add.text(W / 2, 75, `${this.currentGuess + 1} / ${this.guessEvents.length}`, {
        fontFamily: 'Nunito', fontSize: '16px', color: '#667799', fontStyle: '700'
      }).setOrigin(0.5);
      this.guessItems.push(progressText);

      // Event title and description (no year)
      const pal = ev.palette || ['#334466', '#6688aa'];
      const cardBg = this.add.rectangle(W / 2, 160, 800, 120, hexToInt(pal[0]), 0.85).setStrokeStyle(1, 0xffd700, 0.4);
      this.guessItems.push(cardBg);

      try {
        const icon = this.add.image(W / 2 - 360, 145, ev.icon || 'scroll').setScale(0.8);
        this.guessItems.push(icon);
      } catch (e) { }

      const titleText = this.add.text(W / 2, 135, ev.title, { fontFamily: 'Nunito', fontSize: '24px', color: '#fff5de', fontStyle: '900' }).setOrigin(0.5);
      this.guessItems.push(titleText);
      const descText = this.add.text(W / 2, 175, ev.description, { fontFamily: 'Nunito', fontSize: '16px', color: '#aabbcc', fontStyle: '700', wordWrap: { width: 700 }, align: 'center' }).setOrigin(0.5);
      this.guessItems.push(descText);

      // Slider
      const sliderY = 320;
      const sliderLeft = 140, sliderRight = 1140;
      const sliderW = sliderRight - sliderLeft;

      // Slider line
      const sliderLine = this.add.rectangle((sliderLeft + sliderRight) / 2, sliderY, sliderW, 6, 0x3a6a9a, 0.7);
      this.guessItems.push(sliderLine);

      // Min/max labels
      const minLabel = this.add.text(sliderLeft, sliderY + 20, String(this.minYear), { fontFamily: 'Bungee', fontSize: '14px', color: '#667799' }).setOrigin(0.5);
      this.guessItems.push(minLabel);
      const maxLabel = this.add.text(sliderRight, sliderY + 20, String(this.maxYear), { fontFamily: 'Bungee', fontSize: '14px', color: '#667799' }).setOrigin(0.5);
      this.guessItems.push(maxLabel);

      // Draggable marker
      const startX = (sliderLeft + sliderRight) / 2;
      const marker = this.add.circle(startX, sliderY, 18, 0xffd700, 1).setStrokeStyle(3, 0xffeebb);
      marker.setInteractive({ useHandCursor: true, draggable: true });
      this.guessItems.push(marker);

      // Selected year display
      let selectedYear = Math.round((this.minYear + this.maxYear) / 2);
      const yearDisplay = this.add.text(startX, sliderY - 45, String(selectedYear), {
        fontFamily: 'Bungee', fontSize: '36px', color: '#ffd700'
      }).setOrigin(0.5);
      this.guessItems.push(yearDisplay);

      // Drag handlers for marker
      this.input.on('drag', (ptr, obj, dragX) => {
        if (obj !== marker) return;
        const nx = clamp(dragX, sliderLeft, sliderRight);
        obj.x = nx;
        const ratio = (nx - sliderLeft) / sliderW;
        selectedYear = Math.round(this.minYear + ratio * (this.maxYear - this.minYear));
        yearDisplay.setText(String(selectedYear));
        yearDisplay.x = nx;
      });

      // Left/Right buttons
      const leftBtn = makeBtn(this, sliderLeft - 50, sliderY, 40, 40, '\u25C0', { fontSize: '18px' });
      leftBtn.on('pointerdown', () => {
        selectedYear = Math.max(this.minYear, selectedYear - 1);
        const ratio = (selectedYear - this.minYear) / (this.maxYear - this.minYear);
        marker.x = sliderLeft + ratio * sliderW;
        yearDisplay.setText(String(selectedYear));
        yearDisplay.x = marker.x;
        try { Audio.playTick(); } catch (e) { }
      });
      this.guessItems.push(leftBtn);

      const rightBtn = makeBtn(this, sliderRight + 50, sliderY, 40, 40, '\u25B6', { fontSize: '18px' });
      rightBtn.on('pointerdown', () => {
        selectedYear = Math.min(this.maxYear, selectedYear + 1);
        const ratio = (selectedYear - this.minYear) / (this.maxYear - this.minYear);
        marker.x = sliderLeft + ratio * sliderW;
        yearDisplay.setText(String(selectedYear));
        yearDisplay.x = marker.x;
        try { Audio.playTick(); } catch (e) { }
      });
      this.guessItems.push(rightBtn);

      // Confirm button
      const confirmBtn = makeBtn(this, W / 2, 420, 260, 52, 'Confirmar', { primary: true, fontSize: '22px' });
      this.guessItems.push(confirmBtn);

      confirmBtn.on('pointerdown', () => {
        try { Audio.playClick(); } catch (e) { }
        // Disable further input
        confirmBtn.bg.disableInteractive();
        marker.disableInteractive();
        leftBtn.bg.disableInteractive();
        rightBtn.bg.disableInteractive();

        // Calculate score
        const diff = Math.abs(selectedYear - ev.year);
        let pts = 0;
        if (diff === 0) pts = 10;
        else if (diff <= 5) pts = 8;
        else if (diff <= 10) pts = 6;
        else if (diff <= 25) pts = 4;
        else if (diff <= 50) pts = 2;
        this.totalBonusScore += pts;

        // Show result
        const resultY = 480;
        const correctText = this.add.text(W / 2, resultY, `Año correcto: ${ev.year}`, {
          fontFamily: 'Bungee', fontSize: '26px', color: '#ffd700'
        }).setOrigin(0.5).setAlpha(0);
        this.guessItems.push(correctText);
        this.tweens.add({ targets: correctText, alpha: 1, duration: 300 });

        const diffText = this.add.text(W / 2, resultY + 40, diff === 0 ? '\u00A1Exacto! +10' : `Diferencia: ${diff} años | +${pts} puntos`, {
          fontFamily: 'Nunito', fontSize: '20px', color: diff === 0 ? '#6bcb77' : (pts >= 6 ? '#88ccff' : '#ff8c42'), fontStyle: '800'
        }).setOrigin(0.5).setAlpha(0);
        this.guessItems.push(diffText);
        this.tweens.add({ targets: diffText, alpha: 1, duration: 300, delay: 200 });

        if (diff === 0) { FX.confettiExplosion(this, W / 2, resultY, 20, 50); try { Audio.playCorrect(); } catch (e) { } }
        else if (pts >= 6) { try { Audio.playCorrect(); } catch (e) { } }
        else { try { Audio.playWrong(); } catch (e) { } }

        // Fun fact
        const fact = ev.funFact || ev.hint || '';
        if (fact) {
          const factText = this.add.text(W / 2, resultY + 80, `\u2728 ${fact}`, {
            fontFamily: 'Nunito', fontSize: '15px', color: '#ffd700', fontStyle: '700', wordWrap: { width: 700 }, align: 'center'
          }).setOrigin(0.5).setAlpha(0);
          this.guessItems.push(factText);
          this.tweens.add({ targets: factText, alpha: 1, duration: 300, delay: 400 });
        }

        // Next button
        this.time.delayedCall(1500, () => {
          const nextLabel = this.currentGuess < this.guessEvents.length - 1 ? 'Siguiente' : 'Ver resultado';
          const nextBtn = makeBtn(this, W / 2, resultY + 130, 220, 44, nextLabel, { primary: true });
          this.guessItems.push(nextBtn);
          nextBtn.on('pointerdown', () => {
            try { Audio.playClick(); } catch (e) { }
            this.currentGuess++;
            // Remove drag handler for this marker
            this.input.off('drag');
            this._showGuessEvent();
          });
        });
      });
    }

    _showGuessResults() {
      this.guessItems.forEach(it => { if (it && it.destroy) it.destroy(); });
      this.guessItems = [];

      this.add.text(W / 2, 120, 'RONDA BONUS COMPLETADA', { fontFamily: 'Bungee', fontSize: '34px', color: '#ffd700' }).setOrigin(0.5);
      this.add.text(W / 2, 175, `Puntuacion bonus: ${this.totalBonusScore} / 50`, {
        fontFamily: 'Bungee', fontSize: '28px', color: '#88ccff'
      }).setOrigin(0.5);

      // Add XP
      const xpBonus = this.totalBonusScore * 3;
      const stats = loadStats();
      stats.xp += xpBonus;
      stats.level = getLevelInfo(stats.xp).level;
      saveStats(stats);

      this.add.text(W / 2, 230, `XP bonus: +${xpBonus}`, {
        fontFamily: 'Bungee', fontSize: '22px', color: '#ffd700'
      }).setOrigin(0.5);

      if (this.totalBonusScore >= 40) {
        FX.confettiExplosion(this, W / 2, 200, 40, 50);
        try { Audio.playVictory(); } catch (e) { }
      }

      this.time.delayedCall(1000, () => {
        const menuBtn = makeBtn(this, W / 2, 340, 280, 52, 'Volver al menu', { primary: true, fontSize: '22px' });
        menuBtn.on('pointerdown', () => { try { Audio.stopMusic(0.5); } catch (e) { } this.scene.start('menu'); });
      });
    }
  }

  // ========================================================
  //  LEADERBOARD SCENE
  // ========================================================
  class LeaderboardScene extends Phaser.Scene {
    constructor() { super('leaderboard'); }
    create() {
      this.add.rectangle(W / 2, H / 2, W, H, 0x060d1a);
      FX.createFloatingParticles(this, 25, 0x4488ff);

      this.add.text(W / 2, 40, '\u{1F4CA} CLASIFICACION', { fontFamily: 'Bungee', fontSize: '34px', color: '#ffd700' }).setOrigin(0.5);

      const loadingText = this.add.text(W / 2, H / 2, 'Cargando...', {
        fontFamily: 'Nunito', fontSize: '22px', color: '#8cb6ff', fontStyle: '700'
      }).setOrigin(0.5);

      const statusLabel = isOnlineLeaderboardConfigured()
        ? 'Ranking online activo'
        : 'Ranking de este dispositivo';
      this.add.text(W / 2, 72, statusLabel, {
        fontFamily: 'Nunito', fontSize: '14px',
        color: isOnlineLeaderboardConfigured() ? '#6bcb77' : '#ffcc66',
        fontStyle: '800'
      }).setOrigin(0.5);

      const backBtn = makeBtn(this, W / 2, H - 40, 200, 44, 'Volver', { primary: true });
      backBtn.on('pointerdown', () => { try { Audio.playClick(); } catch (e) { } this.scene.start('menu'); });

      fetchLeaderboardEntries().then(data => {
        loadingText.destroy();
        if (!data || !data.length) {
          this.add.text(W / 2, H / 2, 'Aun no hay puntuaciones guardadas', {
            fontFamily: 'Nunito', fontSize: '20px', color: '#8cb6ff', fontStyle: '700'
          }).setOrigin(0.5);
          return;
        }

        const stats = loadStats();
        const myName = stats.playerName;

        // Table header
        const hy = 90;
        const cols = [100, 180, 450, 750, 950];
        const headers = ['#', 'Avatar', 'Nombre', 'Nivel', 'Puntos'];
        headers.forEach((h, i) => {
          this.add.text(cols[i], hy, h, { fontFamily: 'Bungee', fontSize: '16px', color: '#ffd700' }).setOrigin(0.5);
        });
        this.add.rectangle(W / 2, hy + 18, 1100, 2, 0x3a5a8a, 0.5);

        // Rows
        const entries = data.slice(0, 20);
        entries.forEach((entry, i) => {
          const ry = 125 + i * 28;
          const isMine = entry.name === myName;
          if (isMine) {
            this.add.rectangle(W / 2, ry, 1100, 26, 0x3a3a10, 0.5);
          }
          const color = isMine ? '#ffd700' : '#ccddff';
          const rankEmoji = i === 0 ? '\u{1F947}' : i === 1 ? '\u{1F948}' : i === 2 ? '\u{1F949}' : String(i + 1);
          this.add.text(cols[0], ry, rankEmoji, { fontFamily: 'Nunito', fontSize: '14px', color, fontStyle: '800' }).setOrigin(0.5);
          const av = getAvatarById(entry.avatar);
          createAvatarPortrait(this, av, cols[1], ry, 24, 1, { label: av ? av.emoji : '\u{1F464}' });
          this.add.text(cols[2], ry, entry.name || '???', { fontFamily: 'Nunito', fontSize: '14px', color, fontStyle: '700' }).setOrigin(0.5);
          const lvl = getLevelInfo(entry.xp || 0);
          this.add.text(cols[3], ry, `Nv.${lvl.level} ${lvl.title}`, { fontFamily: 'Nunito', fontSize: '13px', color: '#8cb6ff', fontStyle: '700' }).setOrigin(0.5);
          this.add.text(cols[4], ry, String(entry.score || 0), { fontFamily: 'Bungee', fontSize: '16px', color: '#ffd700' }).setOrigin(0.5);
        });
      });
    }
  }

  // ========================================================
  //  COLLECTION SCENE
  // ========================================================
  class CollectionScene extends Phaser.Scene {
    constructor() { super('collection'); }
    create() {
      this.add.rectangle(W / 2, H / 2, W, H, 0x060d1a);
      if (hasTexture(this, VISUALS.backgrounds.collection && VISUALS.backgrounds.collection.key)) {
        this.add.image(W / 2, H / 2, VISUALS.backgrounds.collection.key).setDisplaySize(W, H).setAlpha(0.72);
      }
      this.add.rectangle(W / 2, H / 2, W, H, 0x06101c, 0.55);
      FX.createFloatingParticles(this, 20, 0x4488ff);

      const stats = loadStats();
      const seenSet = stats.seenEvents;

      // Get all events sorted by year
      const mixPack = TD.getPack('mixto');
      this.allEvents = [...mixPack.events].sort(byYear);
      const totalEvents = this.allEvents.length;
      const seenCount = this.allEvents.filter(e => seenSet.has(e.id)).length;

      this.add.text(W / 2, 35, '\u{1F4DA} COLECCION - Linea del Tiempo', { fontFamily: 'Bungee', fontSize: '28px', color: '#ffd700' }).setOrigin(0.5);

      // Progress bar
      this.add.rectangle(W / 2, 70, 400, 14, 0x1a2744).setStrokeStyle(1, 0x3a5a8a);
      const progressRatio = totalEvents > 0 ? seenCount / totalEvents : 0;
      this.add.rectangle(W / 2 - 198, 70, Math.max(2, 396 * progressRatio), 10, 0x6bcb77).setOrigin(0, 0.5);
      this.add.text(W / 2, 90, `${seenCount}/${totalEvents} eventos descubiertos`, {
        fontFamily: 'Nunito', fontSize: '14px', color: '#8cb6ff', fontStyle: '700'
      }).setOrigin(0.5);

      this.seenSet = seenSet;
      this.pageIndex = 0;
      this.perPage = 10;
      this.cardItems = [];
      this.overlayItems = [];

      this._renderCollectionPage();

      // Navigation buttons
      this.prevBtn = makeBtn(this, 60, H / 2, 50, 50, '\u25C0', { fontSize: '22px' });
      this.prevBtn.on('pointerdown', () => {
        if (this.pageIndex > 0) { this.pageIndex--; this._renderCollectionPage(); }
        try { Audio.playClick(); } catch (e) { }
      });
      this.nextBtn = makeBtn(this, W - 60, H / 2, 50, 50, '\u25B6', { fontSize: '22px' });
      this.nextBtn.on('pointerdown', () => {
        if ((this.pageIndex + 1) * this.perPage < this.allEvents.length) { this.pageIndex++; this._renderCollectionPage(); }
        try { Audio.playClick(); } catch (e) { }
      });

      const backBtn = makeBtn(this, W / 2, H - 35, 200, 40, 'Volver', { primary: true });
      backBtn.on('pointerdown', () => { try { Audio.playClick(); } catch (e) { } this.scene.start('menu'); });
    }

    _renderCollectionPage() {
      this.cardItems.forEach(it => { if (it && it.destroy) it.destroy(); });
      this.cardItems = [];

      const start = this.pageIndex * this.perPage;
      const end = Math.min(start + this.perPage, this.allEvents.length);
      const pageCount = Math.ceil(this.allEvents.length / this.perPage);

      const pageLabel = this.add.text(W / 2, 112, `Pagina ${this.pageIndex + 1}/${pageCount}`, {
        fontFamily: 'Nunito', fontSize: '13px', color: '#556677', fontStyle: '700'
      }).setOrigin(0.5);
      this.cardItems.push(pageLabel);

      // Timeline rail
      const railY = 580;
      const rail = this.add.rectangle(W / 2, railY, 1060, 3, 0x3a6a9a, 0.4);
      this.cardItems.push(rail);

      const count = end - start;
      const spacing = count > 1 ? 1060 / count : 200;
      const startX = W / 2 - (count - 1) * spacing / 2;

      for (let i = start; i < end; i++) {
        const ev = this.allEvents[i];
        const seen = this.seenSet.has(ev.id);
        const col = i - start;
        const cx = startX + col * spacing;
        const cy = 350;

        if (seen) {
          const pal = ev.palette || ['#334466', '#6688aa'];
          const cardBg = this.add.rectangle(cx, cy, 100, 280, hexToInt(pal[0]), 0.85).setStrokeStyle(1, 0xffd700, 0.3);
          this.cardItems.push(cardBg);

          const yearT = this.add.text(cx, cy - 120, String(ev.year), { fontFamily: 'Bungee', fontSize: '14px', color: '#ffd700' }).setOrigin(0.5);
          this.cardItems.push(yearT);

          const visual = getEventVisual(ev);
          if (hasTexture(this, visual && visual.key)) {
            const img = this.add.image(cx, cy - 62, visual.key).setDisplaySize(88, 88).setAlpha(0.96);
            const imgFrame = this.add.rectangle(cx, cy - 62, 90, 90, 0x0b1423, 0.18).setStrokeStyle(1, 0xffd700, 0.35);
            this.cardItems.push(img, imgFrame);
          } else {
            try {
              const ic = this.add.image(cx, cy - 80, ev.icon || 'scroll').setScale(0.5).setAlpha(0.7);
              this.cardItems.push(ic);
            } catch (e) { }
          }

          const titleT = this.add.text(cx, cy + 34, ev.title, {
            fontFamily: 'Nunito', fontSize: '11px', color: '#fff5de', fontStyle: '800',
            align: 'center', wordWrap: { width: 90 }
          }).setOrigin(0.5);
          this.cardItems.push(titleT);

          // Click to show detail
          cardBg.setInteractive({ useHandCursor: true });
          cardBg.on('pointerdown', () => this._showEventDetail(ev));

          // Dot on rail
          const dot = this.add.circle(cx, railY, 5, hexToInt(pal[1] || '#6688aa'));
          this.cardItems.push(dot);
        } else {
          const cardBg = this.add.rectangle(cx, cy, 100, 280, 0x222233, 0.7).setStrokeStyle(1, 0x333355, 0.5);
          this.cardItems.push(cardBg);

          const yearRange = `${Math.floor(ev.year / 100) * 100}s`;
          const yearT = this.add.text(cx, cy - 120, yearRange, { fontFamily: 'Bungee', fontSize: '13px', color: '#445566' }).setOrigin(0.5);
          this.cardItems.push(yearT);

          const unkT = this.add.text(cx, cy, '???', { fontFamily: 'Bungee', fontSize: '20px', color: '#445566' }).setOrigin(0.5);
          this.cardItems.push(unkT);

          const dot = this.add.circle(cx, railY, 4, 0x333355);
          this.cardItems.push(dot);
        }
      }
    }

    _showEventDetail(ev) {
      this.overlayItems.forEach(it => { if (it && it.destroy) it.destroy(); });
      this.overlayItems = [];

      const overlay = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.7).setDepth(70);
      overlay.setInteractive(); // block clicks behind
      this.overlayItems.push(overlay);

      const pal = ev.palette || ['#334466', '#6688aa'];
      const visual = getEventVisual(ev);
      const hasHero = hasTexture(this, visual && visual.key);
      const panel = this.add.rectangle(W / 2, H / 2, hasHero ? 860 : 600, hasHero ? 430 : 380, hexToInt(pal[0]), 0.97).setStrokeStyle(2, 0xffd700, 0.7).setDepth(71);
      this.overlayItems.push(panel);

      if (hasHero) {
        const imageFrame = this.add.rectangle(W / 2 - 205, H / 2 - 12, 320, 230, 0x08101e, 0.22).setStrokeStyle(1, 0xffd700, 0.35).setDepth(72);
        const hero = this.add.image(W / 2 - 205, H / 2 - 12, visual.key).setDisplaySize(316, 226).setDepth(72);
        this.overlayItems.push(imageFrame, hero);
      } else {
        try {
          const ic = this.add.image(W / 2, H / 2 - 140, ev.icon || 'scroll').setScale(1).setDepth(72);
          this.overlayItems.push(ic);
        } catch (e) { }
      }

      const textX = hasHero ? W / 2 + 130 : W / 2;
      const textWidth = hasHero ? 330 : 520;
      const yearY = hasHero ? H / 2 - 150 : H / 2 - 100;
      const titleY = hasHero ? H / 2 - 110 : H / 2 - 60;
      const descY = hasHero ? H / 2 - 28 : H / 2 - 20;
      const factY = hasHero ? H / 2 + 58 : H / 2 + 30;
      const catY = hasHero ? H / 2 + 128 : H / 2 + 80;
      const closeY = hasHero ? H / 2 + 172 : H / 2 + 140;

      const yearT = this.add.text(textX, yearY, String(ev.year), { fontFamily: 'Bungee', fontSize: '30px', color: '#ffd700' }).setOrigin(0.5).setDepth(72);
      this.overlayItems.push(yearT);

      const titleT = this.add.text(textX, titleY, ev.title, {
        fontFamily: 'Nunito', fontSize: hasHero ? '24px' : '22px', color: '#fff5de', fontStyle: '900',
        align: 'center', wordWrap: { width: textWidth }
      }).setOrigin(0.5).setDepth(72);
      this.overlayItems.push(titleT);

      const descT = this.add.text(textX, descY, ev.description, {
        fontFamily: 'Nunito', fontSize: '16px', color: '#dde4ff', fontStyle: '700',
        align: 'center', wordWrap: { width: textWidth }
      }).setOrigin(0.5).setDepth(72);
      this.overlayItems.push(descT);

      const fact = ev.funFact || '';
      if (fact) {
        const factT = this.add.text(textX, factY, `\u2728 ${fact}`, {
          fontFamily: 'Nunito', fontSize: '14px', color: '#ffd700', fontStyle: '700',
          align: 'center', wordWrap: { width: textWidth }
        }).setOrigin(0.5).setDepth(72);
        this.overlayItems.push(factT);
      }

      const catT = this.add.text(textX, catY, `Categoria: ${ev.category || ''}  |  Era: ${ev.era || ''}`, {
        fontFamily: 'Nunito', fontSize: '13px', color: '#667799', fontStyle: '700'
      }).setOrigin(0.5).setDepth(72);
      this.overlayItems.push(catT);

      const closeBtn = makeBtn(this, W / 2, closeY, 160, 40, 'Cerrar', { primary: true, depth: 72 });
      this.overlayItems.push(closeBtn);
      closeBtn.on('pointerdown', () => {
        try { Audio.playClick(); } catch (e) { }
        this.overlayItems.forEach(it => { if (it && it.destroy) it.destroy(); });
        this.overlayItems = [];
      });
    }
  }

  // ========================================================
  //  CONFIG
  // ========================================================
  new Phaser.Game({
    type: Phaser.AUTO,
    parent: 'game-container',
    width: W, height: H,
    scene: [BootScene, IdentityScene, MenuScene, GameScene, ReviewScene, ResultScene, GuessYearScene, LeaderboardScene, CollectionScene],
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    backgroundColor: '#060d1a',
    render: { antialias: true, pixelArt: false },
    input: { activePointers: 2 },
    dom: { createContainer: true },
    autoFocus: false,
    disableVisibilityChange: true,
    fps: { forceSetTimeOut: true, target: 60 }
  });
})();
