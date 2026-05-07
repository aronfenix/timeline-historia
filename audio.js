// ============================================================
//  AUDIO.JS - Timeline Historia v2
//  Sistema de audio sintetizado con Web Audio API
//  Musica de fondo por era + efectos de sonido completos
// ============================================================

window.AudioManager = (() => {
  'use strict';

  let ctx = null;
  let masterGain = null;
  let musicGain = null;
  let sfxGain = null;
  let currentMusic = null;
  let musicEnabled = true;
  let sfxEnabled = true;

  function getCtx() {
    if (!ctx) {
      try {
        ctx = new (window.AudioContext || window.webkitAudioContext)();
        masterGain = ctx.createGain();
        masterGain.gain.value = 0.7;
        masterGain.connect(ctx.destination);
        musicGain = ctx.createGain();
        musicGain.gain.value = 0.35;
        musicGain.connect(masterGain);
        sfxGain = ctx.createGain();
        sfxGain.gain.value = 0.5;
        sfxGain.connect(masterGain);
      } catch (e) { return null; }
    }
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    return ctx;
  }

  function init() { getCtx(); }

  // --- Nota helper ---
  function noteFreq(note, octave) {
    const notes = { C:0, 'C#':1, D:2, 'D#':3, E:4, F:5, 'F#':6, G:7, 'G#':8, A:9, 'A#':10, B:11 };
    return 440 * Math.pow(2, (notes[note] + (octave - 4) * 12 - 9) / 12);
  }

  // --- Oscilador simple ---
  function playTone(freq, duration, type, gain, dest, startTime) {
    const c = getCtx(); if (!c) return;
    const t = startTime || c.currentTime;
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(gain || 0.15, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + duration);
    osc.connect(g);
    g.connect(dest || sfxGain);
    osc.start(t);
    osc.stop(t + duration + 0.05);
  }

  // --- Acorde ---
  function playChord(freqs, duration, type, gain, dest, startTime) {
    freqs.forEach(f => playTone(f, duration, type, (gain || 0.1) / freqs.length, dest, startTime));
  }

  // ==================== SFX ====================

  function playCorrect() {
    if (!sfxEnabled) return;
    const c = getCtx(); if (!c) return;
    const t = c.currentTime;
    playTone(523.25, 0.12, 'sine', 0.2, sfxGain, t);
    playTone(659.25, 0.12, 'sine', 0.2, sfxGain, t + 0.08);
    playTone(783.99, 0.2, 'sine', 0.25, sfxGain, t + 0.16);
  }

  function playWrong() {
    if (!sfxEnabled) return;
    const c = getCtx(); if (!c) return;
    const t = c.currentTime;
    playTone(311, 0.15, 'sawtooth', 0.12, sfxGain, t);
    playTone(277, 0.25, 'sawtooth', 0.1, sfxGain, t + 0.12);
  }

  function playCombo(n) {
    if (!sfxEnabled) return;
    const c = getCtx(); if (!c) return;
    const t = c.currentTime;
    const baseFreq = 440 + Math.min(n, 10) * 40;
    for (let i = 0; i < Math.min(n, 6); i++) {
      playTone(baseFreq + i * 80, 0.1, 'sine', 0.15, sfxGain, t + i * 0.06);
    }
    playTone(baseFreq + 480, 0.35, 'triangle', 0.2, sfxGain, t + 0.36);
  }

  function playCardPlace() {
    if (!sfxEnabled) return;
    const c = getCtx(); if (!c) return;
    const t = c.currentTime;
    // Whoosh + thud
    const noise = c.createBufferSource();
    const buf = c.createBuffer(1, c.sampleRate * 0.08, c.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    noise.buffer = buf;
    const filt = c.createBiquadFilter();
    filt.type = 'lowpass';
    filt.frequency.setValueAtTime(2000, t);
    filt.frequency.exponentialRampToValueAtTime(200, t + 0.08);
    const g = c.createGain();
    g.gain.setValueAtTime(0.2, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
    noise.connect(filt);
    filt.connect(g);
    g.connect(sfxGain);
    noise.start(t);
    noise.stop(t + 0.12);
    playTone(120, 0.1, 'sine', 0.15, sfxGain, t + 0.02);
  }

  function playCardFlip() {
    if (!sfxEnabled) return;
    const c = getCtx(); if (!c) return;
    const t = c.currentTime;
    playTone(800, 0.06, 'sine', 0.1, sfxGain, t);
    playTone(1200, 0.06, 'sine', 0.1, sfxGain, t + 0.05);
  }

  function playTick() {
    if (!sfxEnabled) return;
    const c = getCtx(); if (!c) return;
    playTone(1800, 0.03, 'sine', 0.08, sfxGain, c.currentTime);
  }

  function playTickUrgent() {
    if (!sfxEnabled) return;
    const c = getCtx(); if (!c) return;
    const t = c.currentTime;
    playTone(2200, 0.04, 'square', 0.1, sfxGain, t);
    playTone(1800, 0.04, 'square', 0.08, sfxGain, t + 0.05);
  }

  function playTimeout() {
    if (!sfxEnabled) return;
    const c = getCtx(); if (!c) return;
    const t = c.currentTime;
    for (let i = 0; i < 3; i++) {
      playTone(440 - i * 60, 0.15, 'sawtooth', 0.1, sfxGain, t + i * 0.15);
    }
  }

  function playPowerUp() {
    if (!sfxEnabled) return;
    const c = getCtx(); if (!c) return;
    const t = c.currentTime;
    [523, 659, 784, 1047].forEach((f, i) => {
      playTone(f, 0.12, 'sine', 0.15, sfxGain, t + i * 0.07);
    });
  }

  function playAchievement() {
    if (!sfxEnabled) return;
    const c = getCtx(); if (!c) return;
    const t = c.currentTime;
    const fanfare = [523, 659, 784, 1047, 784, 1047, 1319];
    fanfare.forEach((f, i) => {
      playTone(f, i === fanfare.length - 1 ? 0.5 : 0.12, 'sine', 0.12, sfxGain, t + i * 0.1);
    });
  }

  function playHover() {
    if (!sfxEnabled) return;
    const c = getCtx(); if (!c) return;
    playTone(1400, 0.04, 'sine', 0.04, sfxGain, c.currentTime);
  }

  function playClick() {
    if (!sfxEnabled) return;
    const c = getCtx(); if (!c) return;
    const t = c.currentTime;
    playTone(600, 0.05, 'sine', 0.12, sfxGain, t);
    playTone(900, 0.04, 'sine', 0.1, sfxGain, t + 0.03);
  }

  function playRoundStart() {
    if (!sfxEnabled) return;
    const c = getCtx(); if (!c) return;
    const t = c.currentTime;
    playChord([261.6, 329.6, 392], 0.3, 'sine', 0.2, sfxGain, t);
    playChord([329.6, 415.3, 523.2], 0.4, 'sine', 0.2, sfxGain, t + 0.3);
  }

  function playRoundEnd() {
    if (!sfxEnabled) return;
    const c = getCtx(); if (!c) return;
    const t = c.currentTime;
    playChord([392, 493.9, 587.3], 0.3, 'triangle', 0.15, sfxGain, t);
    playChord([523.2, 659.2, 784], 0.5, 'sine', 0.2, sfxGain, t + 0.35);
  }

  function playVictory() {
    if (!sfxEnabled) return;
    const c = getCtx(); if (!c) return;
    const t = c.currentTime;
    const melody = [523, 523, 587, 659, 587, 659, 784, 659, 784, 1047];
    melody.forEach((f, i) => {
      playTone(f, i === melody.length - 1 ? 0.6 : 0.15, 'sine', 0.12, sfxGain, t + i * 0.12);
    });
  }

  function playFreeze() {
    if (!sfxEnabled) return;
    const c = getCtx(); if (!c) return;
    const t = c.currentTime;
    playTone(2000, 0.3, 'sine', 0.08, sfxGain, t);
    playTone(1500, 0.4, 'sine', 0.06, sfxGain, t + 0.1);
    playTone(1000, 0.5, 'sine', 0.04, sfxGain, t + 0.2);
  }

  // ==================== MUSIC ====================

  function stopMusic(fadeTime) {
    if (!currentMusic) return;
    const c = getCtx(); if (!c) return;
    const fade = fadeTime || 1.0;
    try {
      currentMusic.gainNode.gain.setValueAtTime(currentMusic.gainNode.gain.value, c.currentTime);
      currentMusic.gainNode.gain.linearRampToValueAtTime(0, c.currentTime + fade);
      const ref = currentMusic;
      setTimeout(() => {
        try { ref.stop(); } catch (e) {}
      }, fade * 1000 + 100);
    } catch (e) {}
    currentMusic = null;
  }

  function playMenuMusic() {
    if (!musicEnabled) return;
    stopMusic(0.5);
    const c = getCtx(); if (!c) return;

    // Ambient pad with gentle arpeggios
    const t = c.currentTime;
    const g = c.createGain();
    g.gain.value = 0.0;
    g.connect(musicGain);

    // Pad
    const pad = c.createOscillator();
    pad.type = 'sine';
    pad.frequency.value = 220;
    const padG = c.createGain();
    padG.gain.value = 0.12;
    pad.connect(padG);
    padG.connect(g);
    pad.start(t);

    // LFO for movement
    const lfo = c.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.15;
    const lfoG = c.createGain();
    lfoG.gain.value = 15;
    lfo.connect(lfoG);
    lfoG.connect(pad.frequency);
    lfo.start(t);

    // Second voice
    const pad2 = c.createOscillator();
    pad2.type = 'triangle';
    pad2.frequency.value = 330;
    const padG2 = c.createGain();
    padG2.gain.value = 0.06;
    pad2.connect(padG2);
    padG2.connect(g);
    pad2.start(t);

    // Arpeggios via scheduled tones
    const arpNotes = [440, 523, 659, 784, 659, 523];
    let arpIndex = 0;
    const arpInterval = setInterval(() => {
      if (!currentMusic || !musicEnabled) { clearInterval(arpInterval); return; }
      try {
        const c2 = getCtx(); if (!c2) return;
        const osc = c2.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = arpNotes[arpIndex % arpNotes.length];
        const aG = c2.createGain();
        aG.gain.setValueAtTime(0.06, c2.currentTime);
        aG.gain.exponentialRampToValueAtTime(0.001, c2.currentTime + 0.8);
        osc.connect(aG);
        aG.connect(g);
        osc.start(c2.currentTime);
        osc.stop(c2.currentTime + 1.0);
        arpIndex++;
      } catch (e) {}
    }, 600);

    // Fade in
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(1.0, t + 2.0);

    currentMusic = {
      stop: () => { try { pad.stop(); pad2.stop(); lfo.stop(); clearInterval(arpInterval); } catch(e){} },
      gainNode: g
    };
  }

  function playGameMusic(era) {
    if (!musicEnabled) return;
    stopMusic(0.8);
    const c = getCtx(); if (!c) return;
    const t = c.currentTime;
    const g = c.createGain();
    g.gain.value = 0.0;
    g.connect(musicGain);

    // Different chord progressions per era
    let chords, bpm;
    if (era === 'moderna') {
      // Medieval/Renaissance feel - Dm, Am, Bb, C
      chords = [
        [146.8, 220, 293.7],
        [220, 277.2, 329.6],
        [233.1, 293.7, 349.2],
        [261.6, 329.6, 392]
      ];
      bpm = 70;
    } else if (era === 'contemporanea') {
      // More modern feel - Em, G, C, D
      chords = [
        [164.8, 246.9, 329.6],
        [196, 246.9, 392],
        [261.6, 329.6, 392],
        [293.7, 370, 440]
      ];
      bpm = 85;
    } else {
      // Epic mixed - Am, F, C, G
      chords = [
        [220, 277.2, 329.6],
        [174.6, 220, 261.6],
        [261.6, 329.6, 392],
        [196, 246.9, 392]
      ];
      bpm = 78;
    }

    const beatDur = 60 / bpm;
    const barDur = beatDur * 4;
    let chordIdx = 0;
    let running = true;

    // Sustained pads
    const pads = [];
    for (let v = 0; v < 3; v++) {
      const osc = c.createOscillator();
      osc.type = v === 0 ? 'sine' : 'triangle';
      const vg = c.createGain();
      vg.gain.value = v === 0 ? 0.08 : 0.04;
      osc.connect(vg);
      vg.connect(g);
      osc.frequency.value = chords[0][v] || 220;
      osc.start(t);
      pads.push({ osc, gain: vg });
    }

    // Change chords periodically
    const chordInterval = setInterval(() => {
      if (!running || !musicEnabled) { clearInterval(chordInterval); return; }
      chordIdx = (chordIdx + 1) % chords.length;
      const chord = chords[chordIdx];
      try {
        const now = getCtx().currentTime;
        pads.forEach((p, i) => {
          if (chord[i]) {
            p.osc.frequency.setValueAtTime(p.osc.frequency.value, now);
            p.osc.frequency.linearRampToValueAtTime(chord[i], now + 0.5);
          }
        });
      } catch (e) {}
    }, barDur * 1000 * 2);

    // Rhythmic pulse
    const pulseInterval = setInterval(() => {
      if (!running || !musicEnabled) { clearInterval(pulseInterval); return; }
      try {
        const c2 = getCtx(); if (!c2) return;
        const chord = chords[chordIdx];
        const f = chord[Math.floor(Math.random() * chord.length)] * 2;
        const osc = c2.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = f;
        const pg = c2.createGain();
        pg.gain.setValueAtTime(0.04, c2.currentTime);
        pg.gain.exponentialRampToValueAtTime(0.001, c2.currentTime + 0.4);
        osc.connect(pg);
        pg.connect(g);
        osc.start(c2.currentTime);
        osc.stop(c2.currentTime + 0.5);
      } catch (e) {}
    }, beatDur * 1000);

    // Soft cinematic drums and short brass-like calls. Kept synthetic so the
    // online version has no licensed audio dependency.
    let beatIndex = 0;
    const drumInterval = setInterval(() => {
      if (!running || !musicEnabled) { clearInterval(drumInterval); return; }
      try {
        const c2 = getCtx(); if (!c2) return;
        const now = c2.currentTime;
        const accent = beatIndex % 4 === 0;

        const kick = c2.createOscillator();
        const kickG = c2.createGain();
        kick.type = 'sine';
        kick.frequency.setValueAtTime(accent ? 92 : 68, now);
        kick.frequency.exponentialRampToValueAtTime(42, now + 0.18);
        kickG.gain.setValueAtTime(accent ? 0.12 : 0.055, now);
        kickG.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        kick.connect(kickG); kickG.connect(g);
        kick.start(now); kick.stop(now + 0.24);

        if (beatIndex % 8 === 4) {
          const noise = c2.createBufferSource();
          const buf = c2.createBuffer(1, Math.floor(c2.sampleRate * 0.08), c2.sampleRate);
          const data = buf.getChannelData(0);
          for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
          noise.buffer = buf;
          const filt = c2.createBiquadFilter();
          filt.type = 'bandpass';
          filt.frequency.value = 420;
          const snareG = c2.createGain();
          snareG.gain.setValueAtTime(0.045, now);
          snareG.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
          noise.connect(filt); filt.connect(snareG); snareG.connect(g);
          noise.start(now); noise.stop(now + 0.12);
        }

        if (beatIndex % 16 === 0) {
          const chord = chords[chordIdx];
          chord.forEach((f, i) => {
            const horn = c2.createOscillator();
            const hornG = c2.createGain();
            horn.type = 'sawtooth';
            horn.frequency.value = f * 2;
            hornG.gain.setValueAtTime(0.018 / (i + 1), now + i * 0.04);
            hornG.gain.exponentialRampToValueAtTime(0.001, now + 0.75 + i * 0.04);
            horn.connect(hornG); hornG.connect(g);
            horn.start(now + i * 0.04); horn.stop(now + 0.85 + i * 0.04);
          });
        }
        beatIndex++;
      } catch (e) {}
    }, beatDur * 500);

    // Fade in
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(1.0, t + 2.0);

    currentMusic = {
      stop: () => {
        running = false;
        clearInterval(chordInterval);
        clearInterval(pulseInterval);
        clearInterval(drumInterval);
        try { pads.forEach(p => p.osc.stop()); } catch(e){}
      },
      gainNode: g
    };
  }

  function playResultsMusic() {
    if (!musicEnabled) return;
    stopMusic(0.5);
    const c = getCtx(); if (!c) return;
    const t = c.currentTime;
    const g = c.createGain();
    g.gain.value = 0.0;
    g.connect(musicGain);

    // Triumphant pads
    const chord = [261.6, 329.6, 392, 523.2];
    const oscs = chord.map(f => {
      const osc = c.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = f;
      const og = c.createGain();
      og.gain.value = 0.06;
      osc.connect(og);
      og.connect(g);
      osc.start(t);
      return osc;
    });

    // Gentle shimmer
    const shimmerInterval = setInterval(() => {
      if (!currentMusic || !musicEnabled) { clearInterval(shimmerInterval); return; }
      try {
        const c2 = getCtx(); if (!c2) return;
        const f = chord[Math.floor(Math.random() * chord.length)] * (Math.random() > 0.5 ? 2 : 4);
        const osc = c2.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = f;
        const sg = c2.createGain();
        sg.gain.setValueAtTime(0.03, c2.currentTime);
        sg.gain.exponentialRampToValueAtTime(0.001, c2.currentTime + 1.2);
        osc.connect(sg);
        sg.connect(g);
        osc.start(c2.currentTime);
        osc.stop(c2.currentTime + 1.5);
      } catch(e) {}
    }, 800);

    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(1.0, t + 1.5);

    currentMusic = {
      stop: () => { clearInterval(shimmerInterval); try { oscs.forEach(o => o.stop()); } catch(e){} },
      gainNode: g
    };
  }

  // ==================== NEW SFX (v3) ====================

  function playLevelUp() {
    if (!sfxEnabled) return;
    const c = getCtx(); if (!c) return;
    const t = c.currentTime;
    // Triumphant ascending arpeggio with shimmer
    const notes = [523, 587, 659, 784, 880, 1047, 1175, 1319, 1568];
    notes.forEach((f, i) => {
      playTone(f, i === notes.length - 1 ? 0.8 : 0.12, 'sine', 0.14, sfxGain, t + i * 0.08);
      if (i > 5) playTone(f * 1.5, 0.2, 'triangle', 0.06, sfxGain, t + i * 0.08);
    });
    // Final chord
    playChord([1047, 1319, 1568], 1.0, 'sine', 0.15, sfxGain, t + 0.72);
  }

  function playBonusCorrect() {
    if (!sfxEnabled) return;
    const c = getCtx(); if (!c) return;
    const t = c.currentTime;
    // Bright sparkle sound
    [784, 988, 1175, 1568, 1175, 1568, 2093].forEach((f, i) => {
      playTone(f, 0.1, 'sine', 0.12, sfxGain, t + i * 0.06);
    });
    playTone(1568, 0.4, 'triangle', 0.08, sfxGain, t + 0.42);
  }

  function playBonusWrong() {
    if (!sfxEnabled) return;
    const c = getCtx(); if (!c) return;
    const t = c.currentTime;
    playTone(400, 0.2, 'triangle', 0.08, sfxGain, t);
    playTone(350, 0.3, 'triangle', 0.06, sfxGain, t + 0.15);
  }

  function playGuessClose() {
    if (!sfxEnabled) return;
    const c = getCtx(); if (!c) return;
    const t = c.currentTime;
    playTone(659, 0.1, 'sine', 0.12, sfxGain, t);
    playTone(784, 0.15, 'sine', 0.15, sfxGain, t + 0.08);
    playTone(1047, 0.3, 'sine', 0.18, sfxGain, t + 0.18);
  }

  function playGuessFar() {
    if (!sfxEnabled) return;
    const c = getCtx(); if (!c) return;
    const t = c.currentTime;
    playTone(523, 0.15, 'triangle', 0.1, sfxGain, t);
    playTone(440, 0.2, 'triangle', 0.08, sfxGain, t + 0.12);
  }

  function playVSWin() {
    if (!sfxEnabled) return;
    const c = getCtx(); if (!c) return;
    const t = c.currentTime;
    // Triumphant brass-like fanfare
    [392, 523, 659, 784, 659, 784, 1047].forEach((f, i) => {
      playTone(f, i === 6 ? 0.7 : 0.18, 'sawtooth', 0.06, sfxGain, t + i * 0.12);
      playTone(f, i === 6 ? 0.7 : 0.18, 'sine', 0.1, sfxGain, t + i * 0.12);
    });
  }

  function playCountdown() {
    if (!sfxEnabled) return;
    const c = getCtx(); if (!c) return;
    const t = c.currentTime;
    playTone(880, 0.08, 'sine', 0.15, sfxGain, t);
  }

  function playSlider() {
    if (!sfxEnabled) return;
    const c = getCtx(); if (!c) return;
    playTone(600 + Math.random() * 400, 0.04, 'sine', 0.05, sfxGain, c.currentTime);
  }

  function playReveal() {
    if (!sfxEnabled) return;
    const c = getCtx(); if (!c) return;
    const t = c.currentTime;
    playTone(440, 0.08, 'sine', 0.1, sfxGain, t);
    playTone(554, 0.08, 'sine', 0.1, sfxGain, t + 0.06);
    playTone(659, 0.15, 'sine', 0.12, sfxGain, t + 0.12);
  }

  // ==================== ENHANCED MUSIC (v3) ====================

  function playMenuMusicV3() {
    if (!musicEnabled) return;
    stopMusic(0.5);
    const c = getCtx(); if (!c) return;
    const t = c.currentTime;
    const g = c.createGain();
    g.gain.value = 0.0;
    g.connect(musicGain);

    // Rich ambient pad with multiple voices
    const pad1 = c.createOscillator(); pad1.type = 'sine'; pad1.frequency.value = 174.6;
    const pad1G = c.createGain(); pad1G.gain.value = 0.08; pad1.connect(pad1G); pad1G.connect(g); pad1.start(t);

    const pad2 = c.createOscillator(); pad2.type = 'triangle'; pad2.frequency.value = 261.6;
    const pad2G = c.createGain(); pad2G.gain.value = 0.05; pad2.connect(pad2G); pad2G.connect(g); pad2.start(t);

    const pad3 = c.createOscillator(); pad3.type = 'sine'; pad3.frequency.value = 329.6;
    const pad3G = c.createGain(); pad3G.gain.value = 0.04; pad3.connect(pad3G); pad3G.connect(g); pad3.start(t);

    // Slow LFO modulation
    const lfo = c.createOscillator(); lfo.type = 'sine'; lfo.frequency.value = 0.1;
    const lfoG = c.createGain(); lfoG.gain.value = 8;
    lfo.connect(lfoG); lfoG.connect(pad1.frequency); lfo.start(t);

    const lfo2 = c.createOscillator(); lfo2.type = 'sine'; lfo2.frequency.value = 0.07;
    const lfoG2 = c.createGain(); lfoG2.gain.value = 5;
    lfo2.connect(lfoG2); lfoG2.connect(pad3.frequency); lfo2.start(t);

    // Rich arpeggio pattern (pentatonic)
    const arpNotes = [440, 523, 659, 784, 880, 784, 659, 523, 440, 349, 440, 523];
    let arpIdx = 0;
    const arpInterval = setInterval(() => {
      if (!currentMusic || !musicEnabled) { clearInterval(arpInterval); return; }
      try {
        const c2 = getCtx(); if (!c2) return;
        const note = arpNotes[arpIdx % arpNotes.length];
        const osc = c2.createOscillator(); osc.type = 'sine'; osc.frequency.value = note;
        const aG = c2.createGain();
        aG.gain.setValueAtTime(0.05, c2.currentTime);
        aG.gain.exponentialRampToValueAtTime(0.001, c2.currentTime + 1.2);
        osc.connect(aG); aG.connect(g);
        osc.start(c2.currentTime); osc.stop(c2.currentTime + 1.5);
        // Echo/reverb-like delayed copy
        if (arpIdx % 3 === 0) {
          const osc2 = c2.createOscillator(); osc2.type = 'sine'; osc2.frequency.value = note * 2;
          const aG2 = c2.createGain();
          aG2.gain.setValueAtTime(0.02, c2.currentTime + 0.15);
          aG2.gain.exponentialRampToValueAtTime(0.001, c2.currentTime + 0.8);
          osc2.connect(aG2); aG2.connect(g);
          osc2.start(c2.currentTime + 0.15); osc2.stop(c2.currentTime + 1.0);
        }
        arpIdx++;
      } catch(e) {}
    }, 500);

    // Sub bass pulse
    const bassInterval = setInterval(() => {
      if (!currentMusic || !musicEnabled) { clearInterval(bassInterval); return; }
      try {
        const c2 = getCtx(); if (!c2) return;
        const osc = c2.createOscillator(); osc.type = 'sine'; osc.frequency.value = 87.3;
        const bG = c2.createGain();
        bG.gain.setValueAtTime(0.06, c2.currentTime);
        bG.gain.exponentialRampToValueAtTime(0.001, c2.currentTime + 1.8);
        osc.connect(bG); bG.connect(g);
        osc.start(c2.currentTime); osc.stop(c2.currentTime + 2.0);
      } catch(e) {}
    }, 2400);

    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(1.0, t + 3.0);

    currentMusic = {
      stop: () => { try { pad1.stop(); pad2.stop(); pad3.stop(); lfo.stop(); lfo2.stop(); clearInterval(arpInterval); clearInterval(bassInterval); } catch(e){} },
      gainNode: g
    };
  }

  // ==================== CONTROLS ====================

  function toggleMusic() {
    musicEnabled = !musicEnabled;
    if (!musicEnabled) stopMusic(0.3);
    return musicEnabled;
  }

  function toggleSfx() {
    sfxEnabled = !sfxEnabled;
    return sfxEnabled;
  }

  function isMusicOn() { return musicEnabled; }
  function isSfxOn() { return sfxEnabled; }

  function setMusicVolume(v) { if (musicGain) musicGain.gain.value = v; }
  function setSfxVolume(v) { if (sfxGain) sfxGain.gain.value = v; }

  return {
    init, getCtx,
    // SFX
    playCorrect, playWrong, playCombo, playCardPlace, playCardFlip,
    playTick, playTickUrgent, playTimeout, playPowerUp, playAchievement,
    playHover, playClick, playRoundStart, playRoundEnd, playVictory, playFreeze,
    // New SFX (v3)
    playLevelUp, playBonusCorrect, playBonusWrong, playGuessClose, playGuessFar,
    playVSWin, playCountdown, playSlider, playReveal,
    // Music
    playMenuMusic, playMenuMusicV3, playGameMusic, playResultsMusic, stopMusic,
    // Controls
    toggleMusic, toggleSfx, isMusicOn, isSfxOn,
    setMusicVolume, setSfxVolume
  };
})();
