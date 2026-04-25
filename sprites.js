// ============================================================
//  SPRITES.JS - Timeline Historia v2
//  Generadores de sprites por canvas (sin imagenes externas)
// ============================================================

window.SpriteGenerator = (() => {
  'use strict';

  function generateAll(scene) {
    generateBasicShapes(scene);
    generateIcons(scene);
    generateCardBack(scene);
    generateBackgrounds(scene);
  }

  // --- Formas basicas ---
  function generateBasicShapes(scene) {
    // Spark/particula
    let g = scene.add.graphics();
    g.fillStyle(0xffffff, 1);
    g.fillCircle(8, 8, 8);
    g.generateTexture('spark', 16, 16);
    g.destroy();

    // Glow suave
    g = scene.add.graphics();
    const gradient = g.createCanvas ? null : null; // Phaser graphics approach
    g.fillStyle(0xffffff, 0.5);
    g.fillCircle(16, 16, 16);
    g.fillStyle(0xffffff, 0.3);
    g.fillCircle(16, 16, 12);
    g.fillStyle(0xffffff, 0.7);
    g.fillCircle(16, 16, 6);
    g.generateTexture('glow', 32, 32);
    g.destroy();

    // Cuadrado redondeado
    g = scene.add.graphics();
    g.fillStyle(0xffffff, 1);
    g.fillRoundedRect(0, 0, 32, 32, 6);
    g.generateTexture('rounded_sq', 32, 32);
    g.destroy();
  }

  // --- Iconos tematicos ---
  function generateIcons(scene) {
    // Corona
    _genIcon(scene, 'crown', (g, s) => {
      g.fillStyle(0xffd700, 1);
      g.fillRect(4, 16, 24, 10);
      g.fillTriangle(4, 16, 10, 4, 16, 16);
      g.fillTriangle(10, 16, 16, 2, 22, 16);
      g.fillTriangle(16, 16, 22, 4, 28, 16);
      // Joyas
      g.fillStyle(0xff4444, 1);
      g.fillCircle(10, 20, 2);
      g.fillStyle(0x4488ff, 1);
      g.fillCircle(16, 20, 2);
      g.fillStyle(0x44ff44, 1);
      g.fillCircle(22, 20, 2);
    });

    // Espada
    _genIcon(scene, 'sword', (g) => {
      g.fillStyle(0xcccccc, 1);
      g.fillRect(14, 2, 4, 20);
      g.fillStyle(0x8B7355, 1);
      g.fillRect(8, 22, 16, 3);
      g.fillStyle(0x654321, 1);
      g.fillRect(13, 25, 6, 5);
    });

    // Escudo
    _genIcon(scene, 'shield', (g) => {
      g.fillStyle(0x4488cc, 1);
      g.fillRoundedRect(6, 2, 20, 24, 4);
      g.fillStyle(0xffd700, 1);
      g.fillRect(14, 6, 4, 16);
      g.fillRect(10, 12, 12, 4);
    });

    // Barco
    _genIcon(scene, 'ship', (g) => {
      g.fillStyle(0x8B4513, 1);
      g.fillTriangle(4, 22, 28, 22, 16, 28);
      g.fillStyle(0x654321, 1);
      g.fillRect(15, 6, 2, 16);
      g.fillStyle(0xffffff, 1);
      g.fillTriangle(17, 8, 26, 16, 17, 18);
    });

    // Mapa
    _genIcon(scene, 'map', (g) => {
      g.fillStyle(0xf5deb3, 1);
      g.fillRoundedRect(4, 4, 24, 24, 2);
      g.lineStyle(2, 0x8B4513, 0.8);
      g.lineBetween(10, 8, 22, 24);
      g.lineBetween(8, 16, 24, 12);
      g.fillStyle(0xff4444, 1);
      g.fillCircle(20, 10, 3);
    });

    // Castillo
    _genIcon(scene, 'castle', (g) => {
      g.fillStyle(0x888888, 1);
      g.fillRect(6, 12, 20, 16);
      g.fillRect(4, 4, 6, 8);
      g.fillRect(22, 4, 6, 8);
      g.fillRect(12, 2, 8, 10);
      g.fillStyle(0x444444, 1);
      g.fillRect(13, 20, 6, 8);
    });

    // Pergamino
    _genIcon(scene, 'scroll', (g) => {
      g.fillStyle(0xf5deb3, 1);
      g.fillRoundedRect(6, 4, 20, 24, 3);
      g.fillStyle(0xdeb887, 1);
      g.fillCircle(8, 6, 4);
      g.fillCircle(24, 6, 4);
      g.lineStyle(1, 0x8B4513, 0.6);
      for (let y = 12; y < 26; y += 4) g.lineBetween(10, y, 22, y);
    });

    // Paleta (arte)
    _genIcon(scene, 'palette', (g) => {
      g.fillStyle(0xf5deb3, 1);
      g.fillCircle(16, 16, 12);
      g.fillStyle(0xff4444, 1); g.fillCircle(10, 10, 3);
      g.fillStyle(0x4488ff, 1); g.fillCircle(20, 10, 3);
      g.fillStyle(0xffd700, 1); g.fillCircle(12, 20, 3);
      g.fillStyle(0x44bb44, 1); g.fillCircle(22, 18, 3);
    });

    // Iglesia
    _genIcon(scene, 'church', (g) => {
      g.fillStyle(0x888888, 1);
      g.fillRect(8, 12, 16, 16);
      g.fillTriangle(6, 12, 26, 12, 16, 4);
      g.fillStyle(0xffd700, 1);
      g.fillRect(15, 2, 2, 4);
      g.fillRect(13, 3, 6, 2);
      g.fillStyle(0x444444, 1);
      g.fillRect(14, 20, 4, 8);
    });

    // Brujula
    _genIcon(scene, 'compass', (g) => {
      g.lineStyle(2, 0x888888, 1);
      g.strokeCircle(16, 16, 12);
      g.fillStyle(0xff4444, 1);
      g.fillTriangle(16, 4, 14, 16, 18, 16);
      g.fillStyle(0xcccccc, 1);
      g.fillTriangle(16, 28, 14, 16, 18, 16);
    });

    // Voto/urna
    _genIcon(scene, 'vote', (g) => {
      g.fillStyle(0x666666, 1);
      g.fillRoundedRect(6, 10, 20, 18, 2);
      g.fillStyle(0x444444, 1);
      g.fillRect(12, 10, 8, 2);
      g.fillStyle(0xffffff, 1);
      g.fillRect(13, 4, 6, 8);
    });

    // Balanza
    _genIcon(scene, 'scale', (g) => {
      g.fillStyle(0xffd700, 1);
      g.fillRect(15, 4, 2, 20);
      g.fillRect(8, 24, 16, 3);
      g.lineStyle(2, 0xffd700, 1);
      g.lineBetween(6, 10, 26, 10);
      g.strokeCircle(6, 14, 4);
      g.strokeCircle(26, 14, 4);
    });

    // Fabrica
    _genIcon(scene, 'factory', (g) => {
      g.fillStyle(0x666666, 1);
      g.fillRect(4, 14, 24, 14);
      g.fillStyle(0x888888, 1);
      g.fillRect(6, 4, 6, 10);
      g.fillRect(20, 8, 4, 6);
      g.fillStyle(0xaaaaaa, 1);
      g.fillCircle(9, 3, 4);
    });

    // Tren
    _genIcon(scene, 'train', (g) => {
      g.fillStyle(0x4444aa, 1);
      g.fillRoundedRect(4, 10, 24, 12, 3);
      g.fillStyle(0xffd700, 1);
      g.fillCircle(10, 24, 3);
      g.fillCircle(22, 24, 3);
      g.fillStyle(0xff4444, 1);
      g.fillRect(4, 10, 4, 6);
    });

    // Periodico
    _genIcon(scene, 'newspaper', (g) => {
      g.fillStyle(0xf5f5dc, 1);
      g.fillRoundedRect(4, 2, 24, 28, 2);
      g.fillStyle(0x333333, 1);
      g.fillRect(7, 5, 18, 4);
      g.lineStyle(1, 0x999999, 0.8);
      for (let y = 13; y < 27; y += 3) g.lineBetween(7, y, 25, y);
    });

    // Paloma
    _genIcon(scene, 'dove', (g) => {
      g.fillStyle(0xffffff, 1);
      g.fillCircle(16, 14, 6);
      g.fillTriangle(10, 10, 4, 6, 12, 14);
      g.fillTriangle(22, 10, 28, 6, 20, 14);
      g.fillStyle(0xffd700, 1);
      g.fillTriangle(18, 13, 22, 14, 18, 16);
    });

    // Parlamento
    _genIcon(scene, 'parliament', (g) => {
      g.fillStyle(0xcccccc, 1);
      g.fillRect(4, 22, 24, 4);
      g.fillRect(4, 8, 24, 4);
      g.fillTriangle(2, 8, 30, 8, 16, 2);
      g.fillStyle(0xaaaaaa, 1);
      for (let x = 8; x <= 24; x += 8) g.fillRect(x - 1, 12, 3, 10);
    });

    // Satelite
    _genIcon(scene, 'satellite', (g) => {
      g.fillStyle(0x888888, 1);
      g.fillRect(12, 12, 8, 8);
      g.fillStyle(0x4488ff, 1);
      g.fillRect(2, 8, 10, 4);
      g.fillRect(20, 8, 10, 4);
      g.fillStyle(0xff4444, 1);
      g.fillCircle(16, 4, 2);
      g.lineStyle(1, 0xaaaaaa, 0.8);
      g.lineBetween(16, 6, 16, 12);
    });

    // Euro
    _genIcon(scene, 'euro', (g) => {
      g.lineStyle(3, 0xffd700, 1);
      g.beginPath();
      g.arc(18, 16, 10, -2.3, 2.3, false);
      g.strokePath();
      g.lineStyle(2, 0xffd700, 1);
      g.lineBetween(6, 13, 20, 13);
      g.lineBetween(6, 19, 20, 19);
    });

    // Matraz/ciencia
    _genIcon(scene, 'flask', (g) => {
      g.fillStyle(0x88ccff, 0.6);
      g.fillTriangle(8, 26, 24, 26, 16, 12);
      g.fillStyle(0xcccccc, 1);
      g.fillRect(13, 4, 6, 10);
      g.lineStyle(2, 0x888888, 1);
      g.lineBetween(11, 4, 21, 4);
    });

    // Power-up icons
    // Pista
    _genIcon(scene, 'hint', (g) => {
      g.fillStyle(0xffd700, 1);
      g.fillCircle(16, 12, 8);
      g.fillRect(14, 20, 4, 4);
      g.fillStyle(0x000000, 0.5);
      g.fillRect(14, 10, 4, 6);
      g.fillCircle(16, 10, 3);
    });

    // Congelar
    _genIcon(scene, 'freeze', (g) => {
      g.lineStyle(2, 0x88ddff, 1);
      g.lineBetween(16, 2, 16, 30);
      g.lineBetween(4, 9, 28, 23);
      g.lineBetween(4, 23, 28, 9);
      g.fillStyle(0x88ddff, 1);
      g.fillCircle(16, 16, 3);
    });

    // Corazon
    _genIcon(scene, 'heart', (g) => {
      g.fillStyle(0xff4466, 1);
      g.fillCircle(11, 12, 6);
      g.fillCircle(21, 12, 6);
      g.fillTriangle(5, 14, 27, 14, 16, 28);
    });

    // Estrella (achievement/points)
    _genIcon(scene, 'star', (g) => {
      g.fillStyle(0xffd700, 1);
      // Simple star shape
      g.fillTriangle(16, 2, 12, 14, 20, 14);
      g.fillTriangle(16, 26, 12, 14, 20, 14);
      g.fillTriangle(4, 10, 20, 14, 16, 20);
      g.fillTriangle(28, 10, 12, 14, 16, 20);
    });

    // Trofeo
    _genIcon(scene, 'trophy', (g) => {
      g.fillStyle(0xffd700, 1);
      g.fillRoundedRect(8, 4, 16, 14, 4);
      g.fillRect(14, 18, 4, 4);
      g.fillRect(10, 22, 12, 3);
      g.lineStyle(2, 0xffd700, 1);
      g.beginPath();
      g.arc(6, 10, 4, -1.5, 1.5, false);
      g.strokePath();
      g.beginPath();
      g.arc(26, 10, 4, 1.5, -1.5, false);
      g.strokePath();
    });

    // Fuego (combo)
    _genIcon(scene, 'fire', (g) => {
      g.fillStyle(0xff6600, 1);
      g.fillTriangle(16, 2, 6, 26, 26, 26);
      g.fillStyle(0xffcc00, 1);
      g.fillTriangle(16, 10, 10, 26, 22, 26);
      g.fillStyle(0xffff44, 1);
      g.fillTriangle(16, 16, 12, 26, 20, 26);
    });
  }

  function _genIcon(scene, key, drawFn) {
    const g = scene.add.graphics();
    drawFn(g, 32);
    g.generateTexture(key, 32, 32);
    g.destroy();
  }

  // --- Reverso de carta ---
  function generateCardBack(scene) {
    const g = scene.add.graphics();
    // Fondo oscuro con patron
    g.fillStyle(0x1a2744, 1);
    g.fillRoundedRect(0, 0, 128, 160, 8);
    g.fillStyle(0x243a5c, 1);
    g.fillRoundedRect(4, 4, 120, 152, 6);
    // Patron de lineas
    g.lineStyle(1, 0x3a5a8a, 0.3);
    for (let i = 0; i < 20; i++) {
      g.lineBetween(0, i * 10, 128, i * 10 + 30);
    }
    // Interrogacion central
    g.fillStyle(0xffd700, 0.6);
    g.fillCircle(64, 70, 20);
    g.fillStyle(0x1a2744, 1);
    g.fillCircle(64, 70, 14);
    g.fillStyle(0xffd700, 0.8);
    g.fillRect(61, 62, 6, 12);
    g.fillCircle(64, 82, 3);
    // Borde
    g.lineStyle(2, 0xffd700, 0.5);
    g.strokeRoundedRect(2, 2, 124, 156, 7);
    g.generateTexture('card_back', 128, 160);
    g.destroy();
  }

  // --- Fondos de escena ---
  function generateBackgrounds(scene) {
    // No hace falta generar texturas grandes - se dibujan directamente en cada escena
    // Pero generamos una textura de ruido sutil
    const g = scene.add.graphics();
    g.fillStyle(0x111827, 1);
    g.fillRect(0, 0, 64, 64);
    // Dots aleatorios para textura
    for (let i = 0; i < 30; i++) {
      g.fillStyle(0xffffff, Phaser.Math.FloatBetween(0.02, 0.08));
      g.fillCircle(
        Phaser.Math.Between(0, 64),
        Phaser.Math.Between(0, 64),
        Phaser.Math.Between(1, 2)
      );
    }
    g.generateTexture('noise_tile', 64, 64);
    g.destroy();
  }

  return { generateAll };
})();
