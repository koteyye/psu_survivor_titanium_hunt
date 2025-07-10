// Конфигурация спрайт-анимаций для игры PSU Survivor
import * as Phaser from 'phaser';

export interface AnimationConfig {
  key: string;
  atlas: string;
  frames: string[];
  frameRate: number;
  repeat: number;
  hideOnComplete?: boolean;
  duration?: number;
}

export interface SpriteAnimationComponent {
  animations: AnimationConfig[];
  defaultAnimation?: string;
  autoPlay?: boolean;
}

// Конфигурация анимаций взрывов
export const EXPLOSION_ANIMATIONS: Record<string, AnimationConfig> = {
  // Анимации из bad_money.json
  BAD_EXPLOSION: {
    key: 'bad_explosion',
    atlas: 'bad_money',
    frames: [
      'bad_exposion_1.png',
      'bad_exposion_2.png',
      'bad_exposion_3.png',
      'bad_exposion_4.png',
      'bad_exposion_5.png',
      'bad_exposion_6.png',
      'bad_exposion_7.png',
      'bad_exposion_8.png',
      'bad_exposion_9.png'
    ],
    frameRate: 12,
    repeat: 0,
    hideOnComplete: true,
    duration: 750
  },

  MONEY_EXPLOSION: {
    key: 'money_explosion',
    atlas: 'bad_money',
    frames: [
      'money_exposion_1.png',
      'money_exposion_2.png',
      'money_exposion_3.png',
      'money_exposion_4.png',
      'money_exposion_5.png',
      'money_exposion_6.png',
      'money_exposion_7.png',
      'money_exposion_8.png'
    ],
    frameRate: 10,
    repeat: 0,
    hideOnComplete: true,
    duration: 800
  },

  // Анимации из good_super.json
  AERO_CERBERUS_EXPLOSION: {
    key: 'aero_cerberus_explosion',
    atlas: 'good_super',
    frames: [
      'aero_cerberus_explosion_1.png',
      'aero_cerberus_explosion_2.png',
      'aero_cerberus_explosion_3.png',
      'aero_cerberus_explosion_4.png',
      'aero_cerberus_explosion_5.png',
      'aero_cerberus_explosion_6.png',
      'aero_cerberus_explosion_7.png',
      'aero_cerberus_explosion_8.png',
      'aero_cerberus_explosion_9.png'
    ],
    frameRate: 15,
    repeat: 0,
    hideOnComplete: true,
    duration: 600
  },

  GOOD_EXPLOSION: {
    key: 'good_explosion',
    atlas: 'good_super',
    frames: [
      'good_explosion_1.png',
      'good_explosion_2.png',
      'good_explosion_3.png',
      'good_explosion_4.png',
      'good_explosion_5.png',
      'good_explosion_6.png'
    ],
    frameRate: 12,
    repeat: 0,
    hideOnComplete: true,
    duration: 500
  },

  SUPER_EXPLOSION: {
    key: 'super_explosion',
    atlas: 'good_super',
    frames: [
      'super_explosion_1.png',
      'super_explosion_2.png',
      'super_explosion_3.png',
      'super_explosion_4.png',
      'super_explosion_5.png',
      'super_explosion_6.png',
      'super_explosion_7.png',
      'super_explosion_8.png'
    ],
    frameRate: 16,
    repeat: 0,
    hideOnComplete: true,
    duration: 500
  }
};

// Компоненты анимаций для использования в сценах
export const SPRITE_ANIMATION_COMPONENTS: Record<string, SpriteAnimationComponent> = {
  // Компонент для взрывов плохих объектов
  BAD_EXPLOSIONS: {
    animations: [
      EXPLOSION_ANIMATIONS.BAD_EXPLOSION,
      EXPLOSION_ANIMATIONS.MONEY_EXPLOSION
    ],
    defaultAnimation: 'bad_explosion'
  },

  // Компонент для взрывов хороших объектов
  GOOD_EXPLOSIONS: {
    animations: [
      EXPLOSION_ANIMATIONS.GOOD_EXPLOSION,
      EXPLOSION_ANIMATIONS.SUPER_EXPLOSION,
      EXPLOSION_ANIMATIONS.AERO_CERBERUS_EXPLOSION
    ],
    defaultAnimation: 'good_explosion'
  },

  // Компонент для всех взрывов
  ALL_EXPLOSIONS: {
    animations: Object.values(EXPLOSION_ANIMATIONS),
    defaultAnimation: 'good_explosion'
  }
};

// Утилиты для работы с анимациями
export class SpriteAnimationManager {
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * Создает анимации в сцене на основе конфигурации
   */
  createAnimations(component: SpriteAnimationComponent): void {
    component.animations.forEach(config => {
      if (!this.scene.anims.exists(config.key)) {
        this.scene.anims.create({
          key: config.key,
          frames: config.frames.map(frameName => ({
            key: config.atlas,
            frame: frameName
          })),
          frameRate: config.frameRate,
          repeat: config.repeat,
          hideOnComplete: config.hideOnComplete || false
        });
      }
    });
  }

  /**
   * Создает спрайт с анимацией
   */
  createAnimatedSprite(
    x: number, 
    y: number, 
    atlas: string, 
    frame?: string,
    animationKey?: string
  ): Phaser.GameObjects.Sprite {
    const sprite = this.scene.add.sprite(x, y, atlas, frame);
    
    if (animationKey && this.scene.anims.exists(animationKey)) {
      sprite.play(animationKey);
    }
    
    return sprite;
  }

  /**
   * Создает эффект взрыва в указанных координатах
   */
  createExplosionEffect(
    x: number, 
    y: number, 
    explosionType: keyof typeof EXPLOSION_ANIMATIONS,
    onComplete?: () => void
  ): Phaser.GameObjects.Sprite {
    const config = EXPLOSION_ANIMATIONS[explosionType];
    const sprite = this.createAnimatedSprite(x, y, config.atlas, config.frames[0], config.key);
    
    if (onComplete) {
      sprite.on('animationcomplete', onComplete);
    }
    
    // Автоматическое удаление спрайта после завершения анимации
    sprite.on('animationcomplete', () => {
      sprite.destroy();
    });
    
    return sprite;
  }

  /**
   * Инициализирует все анимации для указанного компонента
   */
  initializeComponent(componentKey: keyof typeof SPRITE_ANIMATION_COMPONENTS): void {
    const component = SPRITE_ANIMATION_COMPONENTS[componentKey];
    this.createAnimations(component);
  }

  /**
   * Инициализирует все анимации взрывов
   */
  initializeAllExplosions(): void {
    this.initializeComponent('ALL_EXPLOSIONS');
  }
}

// Константы для удобного доступа к ключам анимаций
export const ANIMATION_KEYS = {
  BAD_EXPLOSION: 'bad_explosion',
  MONEY_EXPLOSION: 'money_explosion',
  AERO_CERBERUS_EXPLOSION: 'aero_cerberus_explosion',
  GOOD_EXPLOSION: 'good_explosion',
  SUPER_EXPLOSION: 'super_explosion'
} as const;

// Типы для TypeScript
export type AnimationKey = typeof ANIMATION_KEYS[keyof typeof ANIMATION_KEYS];
export type ExplosionType = keyof typeof EXPLOSION_ANIMATIONS;
export type ComponentKey = keyof typeof SPRITE_ANIMATION_COMPONENTS;
