interface AnimationConfig {
  key: string;
  frames: string[] | number[];
  frameRate: number;
  repeat: number;
}

interface ExplosionConfig {
  good: AnimationConfig;
  bad: AnimationConfig;
  super: AnimationConfig;
  simple: AnimationConfig;
}

export class AnimationUtils {
  private static explosionConfigs: ExplosionConfig = {
    good: {
      key: 'good_explode',
      frames: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
      frameRate: 20,
      repeat: 0
    },
    bad: {
      key: 'money_explode',
      frames: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
      frameRate: 18,
      repeat: 0
    },
    super: {
      key: 'super_explode',
      frames: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
      frameRate: 25,
      repeat: 0
    },
    simple: {
      key: 'explosion_simple',
      frames: [0, 1, 2, 3, 4],
      frameRate: 10,
      repeat: 0
    }
  };

  public static createExplosionAnimations(scene: Phaser.Scene): void {
    console.log('Creating explosion animations...');
    
    try {
      // Проверяем доступность атласов
      const badMoneyAtlas = scene.textures.exists('bad_money');
      const goodSuperAtlas = scene.textures.exists('good_super');
      const explosionTexture = scene.textures.exists('explosion');
      
      console.log(`Atlas bad_money: ${badMoneyAtlas ? 'loaded' : 'NOT FOUND'}`);
      console.log(`Atlas good_super: ${goodSuperAtlas ? 'loaded' : 'NOT FOUND'}`);
      console.log(`Texture explosion: ${explosionTexture ? 'loaded' : 'NOT FOUND'}`);
      
      // Создаем анимации только если атласы загружены
      if (badMoneyAtlas) {
        this.createAtlasAnimation(scene, 'bad_money', this.explosionConfigs.bad);
      }
      
      if (goodSuperAtlas) {
        this.createAtlasAnimation(scene, 'good_super', this.explosionConfigs.good);
        this.createAtlasAnimation(scene, 'good_super', this.explosionConfigs.super);
      }
      
      // Создаем простую анимацию взрыва
      if (explosionTexture) {
        this.createSimpleExplosion(scene);
      }
      
      console.log('Explosion animations created successfully');
    } catch (error) {
      console.error('Error creating explosion animations:', error);
    }
  }

  private static createAtlasAnimation(
    scene: Phaser.Scene, 
    atlasKey: string, 
    config: AnimationConfig
  ): void {
    if (scene.anims.exists(config.key)) {
      console.log(`Animation ${config.key} already exists, skipping...`);
      return;
    }

    try {
      const frames = scene.anims.generateFrameNumbers(atlasKey, {
        frames: config.frames as number[]
      });

      scene.anims.create({
        key: config.key,
        frames: frames,
        frameRate: config.frameRate,
        repeat: config.repeat
      });

      console.log(`Animation ${config.key} created successfully`);
    } catch (error) {
      console.error(`Error creating animation ${config.key}:`, error);
    }
  }

  private static createSimpleExplosion(scene: Phaser.Scene): void {
    const config = this.explosionConfigs.simple;
    
    if (scene.anims.exists(config.key)) {
      return;
    }

    try {
      scene.anims.create({
        key: config.key,
        frames: scene.anims.generateFrameNumbers('explosion', {
          start: 0,
          end: 4
        }),
        frameRate: config.frameRate,
        repeat: config.repeat
      });

      console.log(`Simple explosion animation created`);
    } catch (error) {
      console.error('Error creating simple explosion:', error);
    }
  }

  public static getExplosionSpriteConfig(type: 'good' | 'bad' | 'super' | 'simple'): AnimationConfig {
    return this.explosionConfigs[type];
  }

  public static createCharacterAnimations(scene: Phaser.Scene, characterId: string): void {
    // Анимации для персонажей (если будут добавлены)
    const animationKey = `${characterId}_idle`;
    
    if (!scene.anims.exists(animationKey)) {
      try {
        scene.anims.create({
          key: animationKey,
          frames: [{ key: characterId, frame: 0 }],
          frameRate: 1,
          repeat: -1
        });
        
        console.log(`Character animation ${animationKey} created`);
      } catch (error) {
        console.error(`Error creating character animation ${animationKey}:`, error);
      }
    }
  }

  public static playExplosion(
    scene: Phaser.Scene, 
    x: number, 
    y: number, 
    type: 'good' | 'bad' | 'super' | 'simple' = 'simple'
  ): Phaser.GameObjects.Sprite | null {
    try {
      const config = this.explosionConfigs[type];
      const explosion = scene.add.sprite(x, y, 'explosion');
      
      explosion.setScale(2);
      
      if (scene.anims.exists(config.key)) {
        explosion.play(config.key);
        
        explosion.on('animationcomplete', () => {
          explosion.destroy();
        });
        
        return explosion;
      } else {
        // Если анимация не найдена, просто удаляем через время
        scene.time.delayedCall(500, () => explosion.destroy());
        return explosion;
      }
    } catch (error) {
      console.error('Error playing explosion:', error);
      return null;
    }
  }

  public static preloadExplosionAtlases(scene: Phaser.Scene, cacheBuster?: number): void {
    const cb = cacheBuster || Date.now();
    
    // Загружаем атласы для взрывов
    scene.load.atlas('good_super', 
      `assets/images/gameplay/explosions/good_super.png?v=${cb}`, 
      `assets/configs/sprites/good_super.json?v=${cb}`);
    
    scene.load.atlas('bad_money', 
      `assets/images/gameplay/explosions/bad_money.png?v=${cb}`, 
      `assets/configs/sprites/bad_money.json?v=${cb}`);
    
    scene.load.image('explosion', 
      `assets/images/gameplay/explosion.png?v=${cb}`);
  }
}
