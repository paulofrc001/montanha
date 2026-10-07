// Lightweight, high-performance Canvas Particle System for Fase 2 ("Fuga do Banho")
// Operates 100% outside the React render loop with an object pool (zero GC pauses at 60fps).

export type ParticleType =
  | 'dust'
  | 'debris'
  | 'water_splash'
  | 'water_mist'
  | 'mud'
  | 'sparkle'
  | 'fart_cloud';

export interface Particle {
  active: boolean;
  type: ParticleType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  rotation: number;
  vRot: number;
  gravity: number;
  drag: number;
  groundBounce: boolean;
}

export class Fase2ParticleSystem {
  private pool: Particle[];
  private maxParticles: number;
  private activeCount: number = 0;

  constructor(maxParticles = 180) {
    this.maxParticles = maxParticles;
    this.pool = new Array(maxParticles);
    for (let i = 0; i < maxParticles; i++) {
      this.pool[i] = {
        active: false,
        type: 'dust',
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        radius: 4,
        color: '#d6d3d1',
        alpha: 1,
        life: 0,
        maxLife: 1,
        rotation: 0,
        vRot: 0,
        gravity: 0,
        drag: 0.98,
        groundBounce: false,
      };
    }
  }

  /**
   * Reset / clear all active particles
   */
  public reset(): void {
    for (let i = 0; i < this.maxParticles; i++) {
      this.pool[i].active = false;
    }
    this.activeCount = 0;
  }

  /**
   * Allocate a particle from the pool without GC churn
   */
  private allocateParticle(): Particle {
    // 1. Look for inactive particle
    for (let i = 0; i < this.maxParticles; i++) {
      if (!this.pool[i].active) {
        this.pool[i].active = true;
        this.activeCount++;
        return this.pool[i];
      }
    }
    // 2. If full, steal the oldest (lowest remaining life ratio)
    let oldest = this.pool[0];
    let minLife = oldest.life;
    for (let i = 1; i < this.maxParticles; i++) {
      if (this.pool[i].life < minLife) {
        minLife = this.pool[i].life;
        oldest = this.pool[i];
      }
    }
    oldest.active = true;
    return oldest;
  }

  /**
   * Spawn arbitrary particles with preconfigured physics
   */
  public spawn(
    x: number,
    y: number,
    count: number,
    type: ParticleType,
    customOptions?: Partial<Particle>
  ): void {
    for (let i = 0; i < count; i++) {
      const p = this.allocateParticle();
      p.type = type;
      p.x = x + (Math.random() - 0.5) * 8;
      p.y = y + (Math.random() - 0.5) * 6;
      p.groundBounce = false;

      switch (type) {
        case 'dust': {
          // Soft ground dust puff that drifts backward in runner wind
          p.vx = -90 - Math.random() * 110;
          p.vy = -15 - Math.random() * 35;
          p.radius = 3.5 + Math.random() * 5.5;
          p.color = Math.random() < 0.6 ? '#d6d3d1' : Math.random() < 0.5 ? '#cbd5e1' : '#a8a29e';
          p.maxLife = 0.38 + Math.random() * 0.35;
          p.life = p.maxLife;
          p.alpha = 0.75 + Math.random() * 0.2;
          p.gravity = 15;
          p.drag = 0.94;
          p.rotation = Math.random() * Math.PI * 2;
          p.vRot = (Math.random() - 0.5) * 2;
          break;
        }

        case 'debris': {
          // Sharp tumbling pebbles and dirt chunks that bounce on ground
          p.vx = -120 - Math.random() * 150;
          p.vy = -60 - Math.random() * 100;
          p.radius = 2.5 + Math.random() * 3.5;
          p.color = Math.random() < 0.4 ? '#78716c' : Math.random() < 0.7 ? '#57534e' : '#44403c';
          p.maxLife = 0.5 + Math.random() * 0.4;
          p.life = p.maxLife;
          p.alpha = 0.95;
          p.gravity = 420;
          p.drag = 0.97;
          p.groundBounce = true;
          p.rotation = Math.random() * Math.PI * 2;
          p.vRot = (Math.random() - 0.5) * 16;
          break;
        }

        case 'water_splash': {
          // Glistening ballistic water droplets radiating outward
          const angle = Math.random() * Math.PI * 2;
          const speed = 120 + Math.random() * 180;
          p.vx = Math.cos(angle) * speed;
          p.vy = -Math.abs(Math.sin(angle)) * speed - 40;
          p.radius = 2.5 + Math.random() * 3.5;
          p.color = Math.random() < 0.5 ? '#38bdf8' : Math.random() < 0.8 ? '#7dd3fc' : '#ffffff';
          p.maxLife = 0.45 + Math.random() * 0.35;
          p.life = p.maxLife;
          p.alpha = 0.9;
          p.gravity = 480;
          p.drag = 0.98;
          p.groundBounce = true;
          p.rotation = Math.atan2(p.vy, p.vx);
          p.vRot = 0;
          break;
        }

        case 'water_mist': {
          // Fine high-speed mist trailing behind water jets
          p.vx = (Math.random() - 0.5) * 60;
          p.vy = (Math.random() - 0.5) * 40;
          p.radius = 1.8 + Math.random() * 2.5;
          p.color = Math.random() < 0.6 ? 'rgba(125, 211, 252, 0.8)' : 'rgba(255, 255, 255, 0.9)';
          p.maxLife = 0.22 + Math.random() * 0.2;
          p.life = p.maxLife;
          p.alpha = 0.7;
          p.gravity = 80;
          p.drag = 0.92;
          p.rotation = 0;
          p.vRot = 0;
          break;
        }

        case 'mud': {
          // Thick organic brown mud splatter
          p.vx = -60 + (Math.random() - 0.5) * 140;
          p.vy = -70 - Math.random() * 110;
          p.radius = 3 + Math.random() * 4.5;
          p.color = Math.random() < 0.5 ? '#78350f' : '#92400e';
          p.maxLife = 0.55 + Math.random() * 0.35;
          p.life = p.maxLife;
          p.alpha = 0.9;
          p.gravity = 380;
          p.drag = 0.96;
          p.groundBounce = true;
          p.rotation = Math.random() * Math.PI * 2;
          p.vRot = (Math.random() - 0.5) * 8;
          break;
        }

        case 'sparkle': {
          // 4-pointed golden cartoon star
          p.vx = (Math.random() - 0.5) * 130;
          p.vy = -50 - Math.random() * 80;
          p.radius = 3.5 + Math.random() * 4.5;
          p.color = Math.random() < 0.6 ? '#facc15' : '#fde047';
          p.maxLife = 0.5 + Math.random() * 0.4;
          p.life = p.maxLife;
          p.alpha = 1;
          p.gravity = 60;
          p.drag = 0.95;
          p.rotation = Math.random() * Math.PI * 2;
          p.vRot = (Math.random() - 0.5) * 10;
          break;
        }

        case 'fart_cloud': {
          // Comic greenish stinky puff
          p.vx = -110 - Math.random() * 70;
          p.vy = -20 + (Math.random() - 0.5) * 40;
          p.radius = 6 + Math.random() * 8;
          p.color = Math.random() < 0.6 ? '#84cc16' : '#a3e635';
          p.maxLife = 0.7 + Math.random() * 0.4;
          p.life = p.maxLife;
          p.alpha = 0.65;
          p.gravity = -10; // Gently rises
          p.drag = 0.95;
          p.rotation = Math.random() * Math.PI * 2;
          p.vRot = (Math.random() - 0.5) * 3;
          break;
        }
      }

      // Apply overrides if provided
      if (customOptions) {
        if (customOptions.vx !== undefined) p.vx = customOptions.vx;
        if (customOptions.vy !== undefined) p.vy = customOptions.vy;
        if (customOptions.radius !== undefined) p.radius = customOptions.radius;
        if (customOptions.color !== undefined) p.color = customOptions.color;
        if (customOptions.maxLife !== undefined) {
          p.maxLife = customOptions.maxLife;
          p.life = customOptions.maxLife;
        }
        if (customOptions.alpha !== undefined) p.alpha = customOptions.alpha;
      }
    }
  }

  /**
   * Helper: Spawn landing shockwave dust & pebbles on both sides of Montanha
   */
  public spawnLandingImpact(x: number, groundY: number): void {
    // Left burst
    this.spawn(x - 12, groundY, 6, 'dust', { vx: -160 - Math.random() * 60, vy: -30 - Math.random() * 30 });
    this.spawn(x - 10, groundY, 4, 'debris', { vx: -140 - Math.random() * 50, vy: -60 - Math.random() * 40 });
    // Right burst
    this.spawn(x + 12, groundY, 6, 'dust', { vx: 80 + Math.random() * 60, vy: -30 - Math.random() * 30 });
    this.spawn(x + 10, groundY, 4, 'debris', { vx: 90 + Math.random() * 50, vy: -60 - Math.random() * 40 });
  }

  /**
   * Helper: Spawn footstep runner dust puff
   */
  public spawnFootstep(x: number, groundY: number, isTurbo: boolean, isDucking: boolean): void {
    if (isDucking) {
      // Long slide kick
      this.spawn(x + 25, groundY - 2, 3, 'dust', { vx: -190 - Math.random() * 90, vy: -20 - Math.random() * 25 });
      this.spawn(x + 20, groundY - 2, 2, 'debris', { vx: -170 - Math.random() * 80, vy: -40 - Math.random() * 40 });
    } else if (isTurbo) {
      // High-speed wind dust + sparks
      this.spawn(x - 5, groundY - 2, 4, 'dust', { vx: -320 - Math.random() * 120, vy: -15 - Math.random() * 25 });
      this.spawn(x + 5, groundY - 15 - Math.random() * 25, 2, 'sparkle', { vx: -180 - Math.random() * 100 });
    } else {
      // Normal running dust puff
      this.spawn(x, groundY - 2, 2, 'dust', { vx: -120 - Math.random() * 60, vy: -15 - Math.random() * 20 });
      if (Math.random() < 0.4) {
        this.spawn(x - 2, groundY - 2, 1, 'debris', { vx: -130 - Math.random() * 50 });
      }
    }
  }

  /**
   * Helper: Spawn pursuer running dust
   */
  public spawnPursuerFootstep(x: number, groundY: number): void {
    this.spawn(x + 15, groundY - 2, 2, 'dust', { vx: -90 - Math.random() * 50, vy: -12 - Math.random() * 20 });
  }

  /**
   * Helper: Spawn water hit explosion on Montanha
   */
  public spawnWaterHit(x: number, y: number): void {
    this.spawn(x, y, 16, 'water_splash');
    this.spawn(x, y, 8, 'water_mist');
  }

  /**
   * Helper: Spawn water puddle splash
   */
  public spawnWaterPuddleSplash(x: number, groundY: number): void {
    this.spawn(x, groundY - 4, 12, 'water_splash', { vy: -120 - Math.random() * 90 });
    this.spawn(x, groundY - 2, 4, 'dust', { color: '#bae6fd' });
  }

  /**
   * Helper: Spawn mud splash
   */
  public spawnMudSplash(x: number, groundY: number): void {
    this.spawn(x, groundY - 4, 14, 'mud');
    this.spawn(x, groundY - 4, 6, 'debris', { color: '#451a03' });
  }

  /**
   * Helper: Spawn flying water attack mist trail
   */
  public spawnWaterAttackTrail(x: number, y: number, width: number, isSuper: boolean): void {
    const trailCount = isSuper ? 3 : 1;
    const trailX = x + Math.random() * width;
    this.spawn(trailX, y, trailCount, 'water_mist');
    if (Math.random() < (isSuper ? 0.6 : 0.25)) {
      this.spawn(trailX, y, 1, 'water_splash', {
        vx: -60 - Math.random() * 80,
        vy: (Math.random() - 0.5) * 50,
        radius: 1.8 + Math.random() * 2,
        maxLife: 0.25,
      });
    }
  }

  /**
   * Update particle physics with delta time (strictly in rAF loop)
   */
  public update(dt: number, groundY: number): void {
    // Clamp dt to avoid physics explosions during tab switch
    const safeDt = Math.min(0.05, Math.max(0.001, dt));
    let active = 0;

    for (let i = 0; i < this.maxParticles; i++) {
      const p = this.pool[i];
      if (!p.active) continue;

      p.life -= safeDt;
      if (p.life <= 0) {
        p.active = false;
        continue;
      }

      // Air drag & gravity
      p.vx *= Math.pow(p.drag, safeDt * 60);
      p.vy += p.gravity * safeDt;

      // Position update
      p.x += p.vx * safeDt;
      p.y += p.vy * safeDt;

      // Rotation update
      if (p.vRot !== 0) {
        p.rotation += p.vRot * safeDt;
      } else if (p.type === 'water_splash') {
        // Orient droplet toward velocity vector
        p.rotation = Math.atan2(p.vy, p.vx);
      }

      // Ground collision & bouncing
      if (p.y >= groundY) {
        if (p.groundBounce && p.vy > 0) {
          p.y = groundY;
          p.vy = -p.vy * 0.35; // Bounce restitution
          p.vx *= 0.65; // Ground friction
          if (Math.abs(p.vy) < 15) {
            p.groundBounce = false;
            p.vy = 0;
          }
        } else if (p.type === 'dust' || p.type === 'fart_cloud') {
          // Dust gently skids along floor
          p.y = groundY;
          p.vy = 0;
        }
      }

      // Smooth alpha fade
      const lifeRatio = p.life / p.maxLife;
      p.alpha = Math.max(0, Math.min(1, lifeRatio));

      // Dust expands slightly as it dissipates
      if (p.type === 'dust' || p.type === 'fart_cloud') {
        p.radius += 4 * safeDt;
      }

      active++;
    }

    this.activeCount = active;
  }

  /**
   * Draw all active particles to Canvas 2D Context
   * Ultra-fast direct primitive rendering with zero allocation!
   */
  public render(ctx: CanvasRenderingContext2D): void {
    if (this.activeCount === 0) return;

    for (let i = 0; i < this.maxParticles; i++) {
      const p = this.pool[i];
      if (!p.active || p.alpha <= 0.02) continue;

      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.translate(p.x, p.y);

      if (p.rotation !== 0) {
        ctx.rotate(p.rotation);
      }

      ctx.fillStyle = p.color;

      switch (p.type) {
        case 'debris': {
          // Small jagged rock / pebble
          const r = p.radius;
          ctx.beginPath();
          ctx.moveTo(-r, -r * 0.6);
          ctx.lineTo(r * 0.8, -r);
          ctx.lineTo(r, r * 0.8);
          ctx.lineTo(-r * 0.4, r);
          ctx.closePath();
          ctx.fill();
          break;
        }

        case 'water_splash': {
          // Elongated droplet stretched along motion angle
          const r = p.radius;
          ctx.beginPath();
          ctx.ellipse(0, 0, r * 1.5, r * 0.75, 0, 0, Math.PI * 2);
          ctx.fill();
          // Bright sheen highlight
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(r * 0.4, -r * 0.2, r * 0.35, 0, Math.PI * 2);
          ctx.fill();
          break;
        }

        case 'water_mist': {
          // Soft mist droplet
          ctx.beginPath();
          ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
          ctx.fill();
          break;
        }

        case 'sparkle': {
          // 4-pointed golden cartoon star
          const r = p.radius;
          ctx.beginPath();
          ctx.moveTo(0, -r);
          ctx.quadraticCurveTo(0, 0, r, 0);
          ctx.quadraticCurveTo(0, 0, 0, r);
          ctx.quadraticCurveTo(0, 0, -r, 0);
          ctx.quadraticCurveTo(0, 0, 0, -r);
          ctx.closePath();
          ctx.fill();
          break;
        }

        case 'mud': {
          // Organic round mud splatter with satellite droplet
          ctx.beginPath();
          ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
          ctx.arc(p.radius * 0.7, p.radius * 0.6, p.radius * 0.4, 0, Math.PI * 2);
          ctx.fill();
          break;
        }

        case 'fart_cloud': {
          // Comic stinky greenish cloudlet
          ctx.beginPath();
          ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
          ctx.arc(p.radius * 0.6, -p.radius * 0.4, p.radius * 0.6, 0, Math.PI * 2);
          ctx.fill();
          break;
        }

        case 'dust':
        default: {
          // Soft dust cloudlet
          ctx.beginPath();
          ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
          ctx.fill();
          break;
        }
      }

      ctx.restore();
    }
  }
}
