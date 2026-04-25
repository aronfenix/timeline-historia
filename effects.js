// ============================================================
//  EFFECTS.JS - Timeline Historia v2
//  Sistema de efectos visuales: particulas, confeti, ondas,
//  brillos, estrellas, fuego, nieve, etc.
// ============================================================

window.EffectsManager = (() => {
  'use strict';

  // --- Particulas flotantes (fondo ambiental) ---
  function createFloatingParticles(scene, count, tint, area) {
    const particles = [];
    const w = area ? area.width : 1280;
    const h = area ? area.height : 720;
    const ox = area ? area.x : 0;
    const oy = area ? area.y : 0;

    for (let i = 0; i < count; i++) {
      const dot = scene.add.circle(
        ox + Phaser.Math.Between(0, w),
        oy + Phaser.Math.Between(0, h),
        Phaser.Math.Between(1, 3),
        tint || 0x9cd9ff,
        Phaser.Math.FloatBetween(0.1, 0.4)
      );
      dot.setDepth(1);

      scene.tweens.add({
        targets: dot,
        y: dot.y + Phaser.Math.Between(-30, 30),
        x: dot.x + Phaser.Math.Between(-15, 15),
        alpha: Phaser.Math.FloatBetween(0.05, 0.5),
        duration: Phaser.Math.Between(2000, 5000),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.InOut'
      });
      particles.push(dot);
    }
    return particles;
  }

  // --- Explosion de confeti ---
  function confettiExplosion(scene, x, y, count, depth) {
    const colors = [0xff6b6b, 0xffd93d, 0x6bcb77, 0x4d96ff, 0xc084fc, 0xff8c42, 0x00d2ff];
    const d = depth || 100;

    for (let i = 0; i < (count || 40); i++) {
      const size = Phaser.Math.Between(3, 8);
      const isRect = Math.random() > 0.5;
      let piece;
      if (isRect) {
        piece = scene.add.rectangle(x, y, size, size * 2, Phaser.Utils.Array.GetRandom(colors));
      } else {
        piece = scene.add.circle(x, y, size / 2, Phaser.Utils.Array.GetRandom(colors));
      }
      piece.setDepth(d);

      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const speed = Phaser.Math.Between(150, 500);
      const dx = Math.cos(angle) * speed;
      const dy = Math.sin(angle) * speed - 200;

      scene.tweens.add({
        targets: piece,
        x: x + dx * 0.6,
        y: y + dy * 0.3 + Phaser.Math.Between(100, 300),
        rotation: Phaser.Math.FloatBetween(-6, 6),
        alpha: 0,
        scaleX: Phaser.Math.FloatBetween(0.3, 1.5),
        duration: Phaser.Math.Between(800, 2000),
        ease: 'Cubic.Out',
        onComplete: () => piece.destroy()
      });
    }
  }

  // --- Onda expansiva circular ---
  function shockwave(scene, x, y, color, maxRadius, duration, depth) {
    const ring = scene.add.circle(x, y, 10, color || 0x66d8ff, 0);
    ring.setStrokeStyle(3, color || 0x66d8ff, 0.8);
    ring.setDepth(depth || 50);

    scene.tweens.add({
      targets: ring,
      radius: maxRadius || 120,
      alpha: 0,
      duration: duration || 500,
      ease: 'Cubic.Out',
      onUpdate: () => {
        ring.setStrokeStyle(3 * (1 - ring.alpha), color || 0x66d8ff, ring.alpha);
      },
      onComplete: () => ring.destroy()
    });
  }

  // --- Doble onda ---
  function doubleShockwave(scene, x, y, color) {
    shockwave(scene, x, y, color, 100, 400, 50);
    setTimeout(() => shockwave(scene, x, y, color, 160, 600, 50), 100);
  }

  // --- Brillo/destello ---
  function sparkle(scene, x, y, color, depth) {
    const d = depth || 50;
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const dist = Phaser.Math.Between(20, 60);
      const spark = scene.add.circle(x, y, Phaser.Math.Between(2, 5), color || 0xffd700, 0.9);
      spark.setDepth(d);
      scene.tweens.add({
        targets: spark,
        x: x + Math.cos(angle) * dist,
        y: y + Math.sin(angle) * dist,
        alpha: 0,
        scale: 0.1,
        duration: Phaser.Math.Between(300, 600),
        ease: 'Cubic.Out',
        onComplete: () => spark.destroy()
      });
    }
  }

  // --- Estrellas subiendo ---
  function risingStars(scene, x, y, count, color, depth) {
    for (let i = 0; i < (count || 5); i++) {
      const star = scene.add.star(
        x + Phaser.Math.Between(-40, 40),
        y,
        5,
        Phaser.Math.Between(3, 6),
        Phaser.Math.Between(6, 12),
        color || 0xffd700
      );
      star.setDepth(depth || 50);
      star.setAlpha(0.9);

      scene.tweens.add({
        targets: star,
        y: y - Phaser.Math.Between(80, 200),
        x: star.x + Phaser.Math.Between(-30, 30),
        alpha: 0,
        rotation: Phaser.Math.FloatBetween(-2, 2),
        scale: Phaser.Math.FloatBetween(0.3, 1.2),
        duration: Phaser.Math.Between(600, 1200),
        ease: 'Cubic.Out',
        delay: i * 60,
        onComplete: () => star.destroy()
      });
    }
  }

  // --- Texto flotante que sube y desaparece ---
  function floatingText(scene, x, y, text, style, depth) {
    const defaultStyle = {
      fontFamily: 'Bungee',
      fontSize: '32px',
      color: '#ffd700',
      stroke: '#000',
      strokeThickness: 3
    };
    const txt = scene.add.text(x, y, text, { ...defaultStyle, ...style }).setOrigin(0.5);
    txt.setDepth(depth || 80);
    txt.setAlpha(0);

    scene.tweens.add({
      targets: txt,
      y: y - 80,
      alpha: { from: 0, to: 1 },
      scale: { from: 0.5, to: 1.2 },
      duration: 300,
      ease: 'Back.Out'
    });

    scene.tweens.add({
      targets: txt,
      y: y - 140,
      alpha: 0,
      scale: 0.8,
      duration: 600,
      delay: 600,
      ease: 'Cubic.In',
      onComplete: () => txt.destroy()
    });

    return txt;
  }

  // --- Flash de pantalla ---
  function screenFlash(scene, color, alpha, duration) {
    const flash = scene.add.rectangle(640, 360, 1280, 720, color || 0xffffff, alpha || 0.3);
    flash.setDepth(200);
    scene.tweens.add({
      targets: flash,
      alpha: 0,
      duration: duration || 300,
      onComplete: () => flash.destroy()
    });
  }

  // --- Aura pulsante alrededor de un objeto ---
  function pulseAura(scene, target, color, depth) {
    const aura = scene.add.circle(target.x, target.y, 40, color || 0xffd700, 0.2);
    aura.setDepth((depth || target.depth || 10) - 1);
    scene.tweens.add({
      targets: aura,
      scale: 2.0,
      alpha: 0,
      duration: 800,
      ease: 'Cubic.Out',
      onComplete: () => aura.destroy()
    });
    return aura;
  }

  // --- Lluvia de estrellas (celebracion) ---
  function starRain(scene, duration) {
    const stars = [];
    const interval = scene.time.addEvent({
      delay: 80,
      repeat: Math.floor((duration || 3000) / 80),
      callback: () => {
        const x = Phaser.Math.Between(0, 1280);
        const star = scene.add.star(x, -20, 5, 4, 8,
          Phaser.Utils.Array.GetRandom([0xffd700, 0xff6b6b, 0x4d96ff, 0x6bcb77, 0xc084fc])
        );
        star.setDepth(90);
        star.setAlpha(0.8);
        stars.push(star);

        scene.tweens.add({
          targets: star,
          y: 740,
          x: x + Phaser.Math.Between(-100, 100),
          rotation: Phaser.Math.FloatBetween(-4, 4),
          alpha: 0,
          duration: Phaser.Math.Between(1500, 3000),
          ease: 'Cubic.In',
          onComplete: () => star.destroy()
        });
      }
    });
    return interval;
  }

  // --- Efecto de combo (explosion + texto + estrellas) ---
  function comboEffect(scene, x, y, comboN) {
    const colors = [0xffd700, 0xff6b6b, 0x4d96ff, 0x6bcb77, 0xff8c42];
    const color = colors[Math.min(comboN - 1, colors.length - 1)];

    doubleShockwave(scene, x, y, color);
    sparkle(scene, x, y, color, 70);
    risingStars(scene, x, y, Math.min(comboN, 8), color, 70);

    const size = Math.min(24 + comboN * 4, 48);
    floatingText(scene, x, y - 20, `x${comboN} COMBO!`, {
      fontSize: `${size}px`,
      color: '#' + color.toString(16).padStart(6, '0')
    }, 80);

    if (comboN >= 5) {
      confettiExplosion(scene, x, y, 20, 70);
    }
  }

  // --- Efecto acierto ---
  function correctEffect(scene, x, y) {
    shockwave(scene, x, y, 0x6bcb77, 80, 400, 50);
    sparkle(scene, x, y, 0x6bcb77, 50);
    risingStars(scene, x, y, 3, 0xffd700, 50);
  }

  // --- Efecto error ---
  function wrongEffect(scene, x, y) {
    scene.cameras.main.shake(200, 0.008);
    screenFlash(scene, 0xff0000, 0.15, 200);
    shockwave(scene, x, y, 0xff6b6b, 60, 300, 50);
  }

  // --- Efecto timeout ---
  function timeoutEffect(scene) {
    scene.cameras.main.shake(300, 0.005);
    screenFlash(scene, 0xff8c00, 0.2, 400);
  }

  // --- Celebracion final ---
  function victoryFireworks(scene) {
    const positions = [
      { x: 200, y: 200 }, { x: 640, y: 150 }, { x: 1080, y: 200 },
      { x: 400, y: 350 }, { x: 880, y: 350 }
    ];
    positions.forEach((pos, i) => {
      scene.time.delayedCall(i * 400, () => {
        confettiExplosion(scene, pos.x, pos.y, 30, 90);
        shockwave(scene, pos.x, pos.y, 0xffd700, 120, 600, 89);
        sparkle(scene, pos.x, pos.y, 0xffd700, 90);
      });
    });
    starRain(scene, 4000);
  }

  // --- Particulas de timer urgente ---
  function timerUrgentParticles(scene, x, y) {
    for (let i = 0; i < 4; i++) {
      const p = scene.add.circle(
        x + Phaser.Math.Between(-20, 20),
        y + Phaser.Math.Between(-5, 5),
        Phaser.Math.Between(2, 4),
        0xff4444, 0.8
      );
      p.setDepth(30);
      scene.tweens.add({
        targets: p,
        y: p.y - Phaser.Math.Between(15, 35),
        alpha: 0,
        scale: 0.2,
        duration: Phaser.Math.Between(300, 600),
        onComplete: () => p.destroy()
      });
    }
  }

  // --- Halo alrededor de carta ---
  function cardGlow(scene, x, y, w, h, color, depth) {
    const glow = scene.add.rectangle(x, y, w + 8, h + 8, color || 0xffd700, 0.25);
    glow.setStrokeStyle(2, color || 0xffd700, 0.6);
    glow.setDepth((depth || 10) - 1);
    scene.tweens.add({
      targets: glow,
      alpha: 0,
      scale: 1.15,
      duration: 600,
      ease: 'Cubic.Out',
      onComplete: () => glow.destroy()
    });
    return glow;
  }

  // --- Texto de logro ---
  function achievementPopup(scene, title, description) {
    const container = scene.add.container(640, -80);
    container.setDepth(150);

    const bg = scene.add.rectangle(0, 0, 420, 80, 0x1a1a2e, 0.95);
    bg.setStrokeStyle(2, 0xffd700, 0.9);
    const icon = scene.add.star(-170, 0, 5, 8, 16, 0xffd700);
    const titleTxt = scene.add.text(-140, -15, title, {
      fontFamily: 'Bungee', fontSize: '18px', color: '#ffd700'
    });
    const descTxt = scene.add.text(-140, 10, description, {
      fontFamily: 'Nunito', fontSize: '14px', color: '#d8e6ff', fontStyle: '700'
    });

    container.add([bg, icon, titleTxt, descTxt]);

    // Slide in
    scene.tweens.add({
      targets: container,
      y: 60,
      duration: 500,
      ease: 'Back.Out'
    });

    // Slide out
    scene.tweens.add({
      targets: container,
      y: -80,
      duration: 400,
      delay: 3000,
      ease: 'Cubic.In',
      onComplete: () => container.destroy()
    });
  }

  // --- Level up celebration (v3) ---
  function levelUpCelebration(scene) {
    // Screen flash gold
    screenFlash(scene, 0xffd700, 0.4, 600);
    // Massive confetti from 3 points
    confettiExplosion(scene, 400, 200, 40, 100);
    confettiExplosion(scene, 640, 150, 50, 100);
    confettiExplosion(scene, 880, 200, 40, 100);
    // Star rain
    starRain(scene, 3000);
    // Shockwave from center
    shockwave(scene, 640, 360, 0xffd700, 400, 1000, 95);
    // Rising stars from bottom
    for (let x = 100; x < 1200; x += 150) {
      risingStars(scene, x, 720, 4, 0xffd700, 95);
    }
  }

  // --- Bonus correct sparkle (v3) ---
  function bonusCorrectEffect(scene, x, y) {
    // Golden burst
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const dist = Phaser.Math.Between(30, 80);
      const s = scene.add.star(x, y, 5, 3, 7, 0xffd700, 0.9);
      s.setDepth(80);
      scene.tweens.add({
        targets: s,
        x: x + Math.cos(angle) * dist,
        y: y + Math.sin(angle) * dist,
        alpha: 0, scale: 0.2, rotation: Phaser.Math.FloatBetween(-3, 3),
        duration: Phaser.Math.Between(400, 800),
        ease: 'Cubic.Out',
        onComplete: () => s.destroy()
      });
    }
    doubleShockwave(scene, x, y, 0xffd700);
  }

  // --- Fire streak for high combos (v3) ---
  function fireStreak(scene, x, y, intensity) {
    const count = Math.min(intensity, 10) * 3;
    for (let i = 0; i < count; i++) {
      const colors = [0xff4400, 0xff6600, 0xff8800, 0xffaa00, 0xffcc00, 0xffff44];
      const flame = scene.add.circle(
        x + Phaser.Math.Between(-30, 30),
        y + Phaser.Math.Between(-10, 10),
        Phaser.Math.Between(3, 8),
        Phaser.Utils.Array.GetRandom(colors),
        0.8
      );
      flame.setDepth(75);
      scene.tweens.add({
        targets: flame,
        y: flame.y - Phaser.Math.Between(40, 120),
        x: flame.x + Phaser.Math.Between(-20, 20),
        alpha: 0, scale: Phaser.Math.FloatBetween(0.1, 0.5),
        duration: Phaser.Math.Between(300, 800),
        ease: 'Cubic.Out',
        delay: i * 20,
        onComplete: () => flame.destroy()
      });
    }
  }

  // --- VS Win celebration (v3) ---
  function vsWinEffect(scene, x, y) {
    confettiExplosion(scene, x, y, 35, 90);
    doubleShockwave(scene, x, y, 0xffd700);
    risingStars(scene, x, y, 8, 0xffd700, 90);
    floatingText(scene, x, y - 40, '👑 VICTORIA!', { fontSize: '36px', color: '#ffd700' }, 95);
  }

  // --- Guess reveal effect (v3) ---
  function guessRevealEffect(scene, x, y, accuracy) {
    // accuracy: 0=far, 1=close, 2=exact
    const color = accuracy === 2 ? 0x6bcb77 : accuracy === 1 ? 0xffd700 : 0xff6b6b;
    shockwave(scene, x, y, color, 60 + accuracy * 30, 500, 50);
    sparkle(scene, x, y, color, 50);
    if (accuracy === 2) {
      confettiExplosion(scene, x, y, 20, 50);
    }
  }

  // --- XP bar fill effect (v3) ---
  function xpFillEffect(scene, x, y, width) {
    for (let i = 0; i < 8; i++) {
      const spark = scene.add.circle(
        x + width + Phaser.Math.Between(-5, 5),
        y + Phaser.Math.Between(-8, 8),
        Phaser.Math.Between(2, 4),
        0xffd700, 0.9
      );
      spark.setDepth(85);
      scene.tweens.add({
        targets: spark,
        y: spark.y - Phaser.Math.Between(15, 40),
        alpha: 0, scale: 0.1,
        duration: Phaser.Math.Between(300, 600),
        onComplete: () => spark.destroy()
      });
    }
  }

  return {
    createFloatingParticles,
    confettiExplosion,
    shockwave, doubleShockwave,
    sparkle, risingStars,
    floatingText, screenFlash,
    pulseAura, starRain,
    comboEffect, correctEffect, wrongEffect, timeoutEffect,
    victoryFireworks, timerUrgentParticles,
    cardGlow, achievementPopup,
    // v3 additions
    levelUpCelebration, bonusCorrectEffect, fireStreak,
    vsWinEffect, guessRevealEffect, xpFillEffect
  };
})();
