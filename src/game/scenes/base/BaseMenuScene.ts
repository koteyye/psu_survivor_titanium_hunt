/**
 * Base class for menu scenes that provides shared functionality
 * including consistent background handling
 */
export abstract class BaseMenuScene extends Phaser.Scene {
  protected backgroundImage?: Phaser.GameObjects.Image;

  /**
   * Creates a consistent menu background using menu_background.png
   * Ensures proper scaling and positioning for 1920x1080 resolution
   */
  protected createMenuBackground(): void {
    // Check if the background image texture exists
    if (this.textures.exists('menuBackground')) {
      this.backgroundImage = this.add.image(960, 540, 'menuBackground');
      if (this.backgroundImage) {
        // Set display size to match target resolution (1920x1080)
        this.backgroundImage.setDisplaySize(1920, 1080);
        // Center the background
        this.backgroundImage.setOrigin(0.5, 0.5);
        // Send to back to ensure it's behind all other elements
        this.backgroundImage.setDepth(-1);
      }
      console.log('BaseMenuScene: Menu background created successfully');
    } else {
      // Create gradient background as fallback
      console.warn('BaseMenuScene: menuBackground texture not found, using fallback gradient');
      this.createFallbackBackground();
    }
  }

  /**
   * Creates a fallback gradient background when menu_background.png is not available
   */
  private createFallbackBackground(): void {
    const graphics = this.add.graphics();
    graphics.fillGradientStyle(0x001122, 0x001122, 0x000033, 0x000033, 1);
    graphics.fillRect(0, 0, 1920, 1080);
    graphics.setDepth(-1);
  }

  /**
   * Preloads the menu background image
   * Should be called in the preload method of scenes that use the menu background
   */
  protected preloadMenuBackground(): void {
    const cacheBuster = Date.now();
    this.load.image('menuBackground', `assets/images/backgrounds/menu_background.png?v=${cacheBuster}`);
  }

  /**
   * Cleanup method for the background
   */
  protected destroyMenuBackground(): void {
    if (this.backgroundImage) {
      this.backgroundImage.destroy();
      this.backgroundImage = undefined;
    }
  }

  /**
   * Override destroy to ensure proper cleanup
   */
  public destroy(): void {
    this.destroyMenuBackground();
    // Note: Phaser.Scene doesn't have a destroy method, cleanup is handled by shutdown
  }
}