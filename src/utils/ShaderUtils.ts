export class ShaderUtils {
  private static glowPipelineInitialized = false;

  public static initShaders(scene: Phaser.Scene): void {
    if (!this.glowPipelineInitialized) {
      try {
        // Простая инициализация шейдеров для совместимости
        this.glowPipelineInitialized = true;
        console.log('Shader system initialized (basic mode)');
      } catch (error) {
        console.error('Error initializing shaders:', error);
      }
    }
  }

  public static applyGlowEffect(object: any): void {
    try {
      // Простой эффект свечения через tint
      if (object && typeof object.setTint === 'function') {
        object.setTint(0x00ffff);
      }
    } catch (error) {
      console.error('Error applying glow effect:', error);
    }
  }

  public static removeGlowEffect(object: any): void {
    try {
      if (object && typeof object.clearTint === 'function') {
        object.clearTint();
      }
    } catch (error) {
      console.error('Error removing glow effect:', error);
    }
  }

  public static createGlowSprite(
    scene: Phaser.Scene, 
    x: number, 
    y: number, 
    texture: string
  ): Phaser.GameObjects.Sprite {
    const sprite = scene.add.sprite(x, y, texture);
    this.applyGlowEffect(sprite);
    return sprite;
  }

  public static createPulseEffect(object: any, scene: Phaser.Scene): void {
    try {
      if (object && scene.tweens) {
        scene.tweens.add({
          targets: object,
          alpha: 0.5,
          duration: 1000,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
      }
    } catch (error) {
      console.error('Error creating pulse effect:', error);
    }
  }

  public static createGlowTween(object: any, scene: Phaser.Scene): void {
    try {
      if (object && scene.tweens) {
        scene.tweens.add({
          targets: object,
          scaleX: 1.1,
          scaleY: 1.1,
          duration: 800,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
      }
    } catch (error) {
      console.error('Error creating glow tween:', error);
    }
  }
}
