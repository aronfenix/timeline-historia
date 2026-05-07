// ============================================================
// ONLINE LEADERBOARD - Timeline Historia
// Uses the same Firebase Realtime Database used by
// factura-luz-profe-alvaro. The existing rules allow REST reads
// and writes on leaderboard_energia, so each game marks its own
// entries with gameId to keep the rankings separated.
// ============================================================

const timelineFirebaseDatabaseUrl = 'https://factura-energia-default-rtdb.europe-west1.firebasedatabase.app';

window.TIMELINE_ONLINE_API = window.TIMELINE_ONLINE_API || {
  baseUrl: ''
};

class TimelineLeaderboardManager {
  constructor() {
    this.isFirebaseEnabled = true;
    this.baseUrl = timelineFirebaseDatabaseUrl.replace(/\/+$/, '');
    this.remotePath = 'leaderboard_energia';
    this.gameId = 'timeline_historia';
    this.localStorageKey = 'timeline_historia_v3_leaderboard';
    this.cacheVersion = 3;
    this.checkCacheVersion();
  }

  checkCacheVersion() {
    try {
      const versionKey = `${this.localStorageKey}_v`;
      const storedVersion = parseInt(localStorage.getItem(versionKey) || '0', 10);
      if (storedVersion < this.cacheVersion) {
        localStorage.removeItem(this.localStorageKey);
        localStorage.setItem(versionKey, String(this.cacheVersion));
      }
    } catch (e) {
      // If storage is blocked, the online leaderboard can still work.
    }
  }

  endpoint(path = '') {
    const cleanPath = String(path || '').replace(/^\/+/, '');
    return `${this.baseUrl}/${cleanPath}.json`;
  }

  normalizeEntry(entry) {
    const name = String(entry && entry.name ? entry.name : '').trim().replace(/\s+/g, ' ').slice(0, 24);
    return {
      name: name || 'Anonimo',
      gameId: entry.gameId || this.gameId,
      avatar: entry.avatar || 'default',
      score: Number(entry.score) || 0,
      mode: entry.mode || 'classic',
      packId: entry.packId || '',
      difficulty: entry.difficulty || 'normal',
      correct: Number(entry.correct) || 0,
      wrong: Number(entry.wrong) || 0,
      bestCombo: Number(entry.bestCombo) || 0,
      xp: Number(entry.xp) || 0,
      level: Number(entry.level) || 1,
      date: entry.date || new Date().toISOString()
    };
  }

  deduplicateByName(scores) {
    const best = {};
    (Array.isArray(scores) ? scores : []).forEach(rawEntry => {
      if (!rawEntry || rawEntry.gameId !== this.gameId) return;
      const entry = this.normalizeEntry(rawEntry);
      const key = entry.name.toUpperCase();
      if (!best[key] || entry.score > best[key].score || (entry.score === best[key].score && String(entry.date).localeCompare(String(best[key].date)) > 0)) {
        best[key] = entry;
      }
    });
    return Object.values(best).sort((a, b) => b.score - a.score || String(b.date).localeCompare(String(a.date)));
  }

  async saveScore(entry) {
    const normalized = this.normalizeEntry(entry);
    this.saveToLocalStorage(normalized);

    try {
      const response = await fetch(this.endpoint(this.remotePath), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...normalized,
          timestamp: Date.now()
        })
      });
      if (!response.ok) throw new Error(`Firebase REST save failed: ${response.status}`);
    } catch (error) {
      console.log('Error al guardar ranking timeline en Firebase:', error);
    }
  }

  async getScores(limit = 50) {
    try {
      const response = await fetch(this.endpoint(this.remotePath));
      if (!response.ok) throw new Error(`Firebase REST load failed: ${response.status}`);
      const payload = await response.json();
      const scores = Object.values(payload || {});
      const deduped = this.deduplicateByName(scores).slice(0, limit);
      try {
        localStorage.setItem(this.localStorageKey, JSON.stringify(deduped.slice(0, 50)));
      } catch (e) {
        // Keep the online result even if local cache is unavailable.
      }
      return deduped;
    } catch (error) {
      console.log('Error al obtener ranking timeline de Firebase:', error);
    }
    return this.getFromLocalStorage();
  }

  saveToLocalStorage(entry) {
    try {
      const scores = this.getFromLocalStorage();
      scores.push(entry);
      const deduped = this.deduplicateByName(scores);
      localStorage.setItem(this.localStorageKey, JSON.stringify(deduped.slice(0, 50)));
    } catch (e) {
      // Local cache is optional; Firebase remains the source of truth.
    }
  }

  getFromLocalStorage() {
    try {
      return JSON.parse(localStorage.getItem(this.localStorageKey) || '[]');
    } catch (e) {
      return [];
    }
  }
}

window.timelineLeaderboardManager = new TimelineLeaderboardManager();
