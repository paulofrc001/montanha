import React from 'react';
import { RunnerObstacle, RunnerCollectible, WaterAttack } from '../../types';
import { Fase2ParticleSystem } from './Fase2ParticleSystem';

export interface FloatingTextItem {
  id: number;
  text: string;
  x: number;
  y: number;
  color: string;
  alpha: number;
}

export interface ParticleItem {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  maxLife: number;
  life: number;
  rotation?: number;
  vRot?: number;
  type?: 'dust' | 'debris' | 'mud' | 'sparkle' | 'water_splash';
}

export function drawActionCanvas(
  ctx: CanvasRenderingContext2D,
  obstacles: RunnerObstacle[],
  collectibles: RunnerCollectible[],
  attacks: WaterAttack[],
  floatingTexts: FloatingTextItem[],
  particlesOrSystem: ParticleItem[] | Fase2ParticleSystem | null,
  width: number,
  height: number
) {
  ctx.clearRect(0, 0, width, height);

  // 0. LIGHTWEIGHT PARTICLES (Dust, debris, water splashes, ground puffs, mud flakes)
  if (particlesOrSystem instanceof Fase2ParticleSystem) {
    particlesOrSystem.render(ctx);
  } else if (Array.isArray(particlesOrSystem)) {
    const particles = particlesOrSystem;
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      if (p.alpha <= 0.01) continue;

      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha));
      ctx.translate(p.x, p.y);
      if (p.rotation !== undefined) {
        ctx.rotate(p.rotation);
      }

      ctx.fillStyle = p.color;

      if (p.type === 'debris') {
        // Small jagged rock / crumb
        const r = p.radius;
        ctx.beginPath();
        ctx.moveTo(-r, -r * 0.7);
        ctx.lineTo(r * 0.8, -r);
        ctx.lineTo(r, r * 0.8);
        ctx.lineTo(-r * 0.5, r);
        ctx.closePath();
        ctx.fill();
      } else if (p.type === 'sparkle') {
        // 4-point star for collectibles/turbo
        const r = p.radius;
        ctx.beginPath();
        ctx.moveTo(0, -r);
        ctx.quadraticCurveTo(0, 0, r, 0);
        ctx.quadraticCurveTo(0, 0, 0, r);
        ctx.quadraticCurveTo(0, 0, -r, 0);
        ctx.quadraticCurveTo(0, 0, 0, -r);
        ctx.closePath();
        ctx.fill();
      } else if (p.type === 'water_splash') {
        // Water droplet teardrop
        ctx.beginPath();
        ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Soft round dust cloudlet
        ctx.beginPath();
        ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  // 1. OBSTACLES
  for (let i = 0; i < obstacles.length; i++) {
    const obs = obstacles[i];
    if (obs.x < -100 || obs.x > width + 100) continue;

    ctx.save();
    ctx.translate(obs.x, obs.y);

    switch (obs.kind) {
      case 'bucket': {
        // Soapy bucket
        ctx.fillStyle = '#0284c7';
        ctx.strokeStyle = '#0369a1';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(8, 8);
        ctx.lineTo(38, 8);
        ctx.lineTo(33, 42);
        ctx.lineTo(13, 42);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Bucket rim & water
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.ellipse(23, 8, 15, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Bubbles overflowing
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(18, 5, 5, 0, Math.PI * 2);
        ctx.arc(26, 4, 6, 0, Math.PI * 2);
        ctx.arc(32, 7, 4, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'soap_slip': {
        // Pink glossy soap bar with slip marks
        ctx.fillStyle = '#f472b6';
        ctx.strokeStyle = '#db2777';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(4, 8, 38, 20, 8);
        ctx.fill();
        ctx.stroke();

        // Highlight sheen
        ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
        ctx.beginPath();
        ctx.ellipse(20, 13, 10, 3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Water slip lines under soap
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(2, 28);
        ctx.lineTo(44, 28);
        ctx.stroke();
        break;
      }

      case 'puddle': {
        // Clean water puddle
        ctx.fillStyle = 'rgba(56, 189, 248, 0.85)';
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(obs.width / 2, obs.height / 2, obs.width / 2 - 2, obs.height / 2 - 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Ripple highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.beginPath();
        ctx.ellipse(obs.width / 2 - 6, obs.height / 2 - 3, obs.width / 4, obs.height / 4, 0, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'mud_puddle': {
        // Brown muddy puddle that restores dirt!
        ctx.fillStyle = '#78350f';
        ctx.strokeStyle = '#451a03';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(obs.width / 2, obs.height / 2, obs.width / 2 - 2, obs.height / 2 - 3, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Mud splatters
        ctx.fillStyle = '#92400e';
        ctx.beginPath();
        ctx.arc(10, 6, 3, 0, Math.PI * 2);
        ctx.arc(obs.width - 12, 5, 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Cartoon text badge
        ctx.fillStyle = '#fef08a';
        ctx.font = '900 9px sans-serif';
        ctx.fillText('LAMA! 💩', 10, 0);
        break;
      }

      case 'duck': {
        // Floor rubber duck
        ctx.fillStyle = '#facc15';
        ctx.strokeStyle = '#ca8a04';
        ctx.lineWidth = 2;
        // Body
        ctx.beginPath();
        ctx.ellipse(18, 26, 15, 11, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        // Head
        ctx.beginPath();
        ctx.arc(26, 14, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        // Beak
        ctx.fillStyle = '#f97316';
        ctx.beginPath();
        ctx.moveTo(33, 14);
        ctx.lineTo(41, 17);
        ctx.lineTo(33, 20);
        ctx.closePath();
        ctx.fill();
        // Eye
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(28, 12, 1.8, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'box': {
        // Cardboard box
        ctx.fillStyle = '#d97706';
        ctx.strokeStyle = '#92400e';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(4, 8, 38, 34, 4);
        ctx.fill();
        ctx.stroke();
        // Tape
        ctx.fillStyle = '#fde68a';
        ctx.fillRect(19, 8, 8, 34);
        break;
      }

      case 'laundry_basket': {
        // Laundry basket
        ctx.fillStyle = '#a855f7';
        ctx.strokeStyle = '#7e22ce';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(6, 14);
        ctx.lineTo(44, 14);
        ctx.lineTo(38, 44);
        ctx.lineTo(12, 44);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        // Clothes spilling out
        ctx.fillStyle = '#f43f5e';
        ctx.beginPath();
        ctx.arc(18, 10, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(32, 9, 7, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'towel_hanging': {
        // Hanging towel overhead
        ctx.fillStyle = '#10b981';
        ctx.strokeStyle = '#047857';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(8, 2, 34, 46, 3);
        ctx.fill();
        ctx.stroke();
        // Stripes
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(8, 36, 34, 5);
        break;
      }

      default: {
        ctx.fillStyle = '#64748b';
        ctx.fillRect(4, 4, obs.width - 8, obs.height - 8);
        break;
      }
    }

    ctx.restore();
  }

  // 2. COLLECTIBLES
  for (let i = 0; i < collectibles.length; i++) {
    const col = collectibles[i];
    if (col.collected || col.x < -60 || col.x > width + 60) continue;

    ctx.save();
    ctx.translate(col.x, col.y);

    if (col.kind === 'rubber_duck') {
      // Glowing collectible rubber duck
      ctx.fillStyle = '#facc15';
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(14, 18, 12, 9, 0, 0, Math.PI * 2);
      ctx.arc(21, 10, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.moveTo(26, 10);
      ctx.lineTo(32, 12);
      ctx.lineTo(26, 14);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(22, 9, 1.5, 0, Math.PI * 2);
      ctx.fill();
    } else if (col.kind === 'gold_soap') {
      // Gold Soap
      ctx.fillStyle = '#eab308';
      ctx.strokeStyle = '#ca8a04';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(4, 6, 24, 18, 5);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 10px sans-serif';
      ctx.fillText('⭐', 10, 19);
    } else if (col.kind === 'deodorant_can') {
      // Deodorant turbo can
      ctx.fillStyle = '#84cc16';
      ctx.strokeStyle = '#4d7c0f';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(8, 4, 16, 24, 4);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(11, 0, 10, 4);
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 8px sans-serif';
      ctx.fillText('💨', 10, 18);
    }

    ctx.restore();
  }

  // 3. WATER PROJECTILES
  for (let i = 0; i < attacks.length; i++) {
    const att = attacks[i];
    if (!att.active || att.x < -80 || att.x > width + 80) continue;

    ctx.save();
    ctx.translate(att.x, att.y);

    if (att.type === 'hose_low') {
      // Ground pressurized water beam
      const grad = ctx.createLinearGradient(0, 0, att.width, 0);
      grad.addColorStop(0, 'rgba(56, 189, 248, 0.4)');
      grad.addColorStop(0.7, '#38bdf8');
      grad.addColorStop(1, '#0284c7');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(0, 4, att.width, att.height - 8, 8);
      ctx.fill();

      // White pressurized inner core
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.roundRect(10, 8, att.width - 20, 6, 4);
      ctx.fill();

      // Foam head at the tip
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.beginPath();
      ctx.arc(att.width, att.height / 2, 10, 0, Math.PI * 2);
      ctx.fill();
    } else if (att.type === 'hose_high') {
      // High water jet
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.roundRect(0, 4, att.width, att.height - 8, 8);
      ctx.fill();

      ctx.fillStyle = '#7dd3fc';
      ctx.beginPath();
      ctx.roundRect(6, 7, att.width - 12, 6, 3);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(att.width, att.height / 2, 9, 0, Math.PI * 2);
      ctx.fill();
    } else if (att.type === 'water_gun') {
      // Water gun droplets
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(12, 12, 10, 0, Math.PI * 2);
      ctx.arc(28, 12, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(10, 9, 3, 0, Math.PI * 2);
      ctx.fill();
    } else if (att.type === 'bucket_lob') {
      // Flying bucket with water arc
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.roundRect(8, 6, 26, 28, 4);
      ctx.fill();
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(21, 6, 12, 0, Math.PI);
      ctx.fill();
    } else if (att.type === 'super_jet') {
      // Giant Super Jet Torrent!
      ctx.fillStyle = '#0369a1';
      ctx.beginPath();
      ctx.roundRect(0, 2, att.width, att.height - 4, 12);
      ctx.fill();

      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.roundRect(8, 6, att.width - 16, att.height - 12, 8);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.roundRect(16, 11, att.width - 32, 8, 4);
      ctx.fill();

      // Splashing head
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(att.width, att.height / 2, 14, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  // 4. FLOATING COMIC TEXTS
  for (let i = 0; i < floatingTexts.length; i++) {
    const ft = floatingTexts[i];
    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, ft.alpha));
    ctx.font = '900 14px Fredoka, sans-serif, system-ui';

    // Text outline
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.strokeText(ft.text, ft.x, ft.y);

    // Text fill
    ctx.fillStyle = ft.color;
    ctx.fillText(ft.text, ft.x, ft.y);
    ctx.restore();
  }
}
