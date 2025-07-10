import type { UIElementOptions } from '../../types/ui-types';

export interface CyberColors {
  accent: number;
  accentDark: number;
  textLight: number;
  bgGlow: number;
  bgGlowAlpha: number;
}

export interface CyberUIElementOptions extends UIElementOptions {
  [key: string]: any;
}

/**
 * Базовый класс для всех UI элементов в киберпанк-стиле
 */
export abstract class CyberUIElement {
  protected scene: any; // Phaser.Scene
  protected x: number;
  protected y: number;
  protected options: CyberUIElementOptions;
  protected elements: any[] = []; // Массив для хранения всех графических элементов
  protected isVisible: boolean = true;
  protected isActive: boolean = true;
  
  protected readonly colors: CyberColors = {
    accent: 0x00f7ff, // Неоновый цвет
    accentDark: 0x003344,
    textLight: 0xc0c0c0,
    bgGlow: 0x00f7ff,
    bgGlowAlpha: 0.1
  };

  constructor(scene: any, x: number, y: number, options: CyberUIElementOptions = {}) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.options = options;
    
    // Применяем опции
    if (options.visible !== undefined) {
      this.isVisible = options.visible;
    }
    if (options.alpha !== undefined) {
      this.setAlpha(options.alpha);
    }
  }

  /**
   * Устанавливает видимость элемента
   */
  public setVisible(visible: boolean): this {
    this.isVisible = visible;
    this.elements.forEach(element => {
      if (element && element.setVisible) {
        element.setVisible(visible);
      }
    });
    return this;
  }

  /**
   * Устанавливает активность элемента
   */
  public setActive(active: boolean): this {
    this.isActive = active;
    return this;
  }

  /**
   * Устанавливает прозрачность элемента
   */
  public setAlpha(alpha: number): this {
    this.elements.forEach(element => {
      if (element && element.setAlpha) {
        element.setAlpha(alpha);
      }
    });
    return this;
  }

  /**
   * Устанавливает позицию элемента
   */
  public setPosition(x: number, y: number): this {
    this.x = x;
    this.y = y;
    this.elements.forEach(element => {
      if (element && element.setPosition) {
        element.setPosition(x, y);
      }
    });
    return this;
  }

  /**
   * Получает позицию элемента
   */
  public getPosition(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }

  /**
   * Проверяет видимость элемента
   */
  public getVisible(): boolean {
    return this.isVisible;
  }

  /**
   * Проверяет активность элемента
   */
  public getActive(): boolean {
    return this.isActive;
  }

  /**
   * Уничтожает элемент и все его компоненты
   */
  public destroy(): void {
    this.elements.forEach(element => {
      if (element && element.destroy) {
        element.destroy();
      }
    });
    this.elements = [];
  }

  /**
   * Создает эффект пульсации для элемента
   */
  protected createPulseEffect(
    element: any, 
    minAlpha: number = 0.7, 
    maxAlpha: number = 1, 
    duration: number = 1000
  ): any {
    if (!this.scene.tweens) {
      console.warn('Scene tweens not available');
      return element;
    }

    this.scene.tweens.add({
      targets: element,
      alpha: { from: minAlpha, to: maxAlpha },
      duration: duration / 2,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    return element;
  }

  /**
   * Создает эффект свечения для элемента
   */
  protected createGlowEffect(element: any, intensity: number = 1): any {
    if (!this.scene.add) {
      console.warn('Scene add not available');
      return null;
    }

    const glow = this.scene.add.graphics();
    glow.fillStyle(this.colors.accent, 0.3 * intensity);
    
    if (element.width && element.height) {
      // Для прямоугольных элементов
      const padding = 10 * intensity;
      glow.fillRoundedRect(
        element.x - element.width / 2 - padding / 2,
        element.y - element.height / 2 - padding / 2,
        element.width + padding,
        element.height + padding,
        8
      );
    } else if (element.radius) {
      // Для круглых элементов
      const padding = 10 * intensity;
      glow.fillCircle(element.x, element.y, element.radius + padding);
    }
    
    this.elements.push(glow);
    if (element.depth !== undefined && glow.setDepth) {
      glow.setDepth(element.depth - 1);
    }
    return glow;
  }

  /**
   * Добавляет элемент в список управляемых элементов
   */
  protected addElement(element: any): void {
    if (element) {
      this.elements.push(element);
    }
  }

  /**
   * Создает текстовый стиль по умолчанию
   */
  protected getDefaultTextStyle(fontSize: number = 24): any {
    return {
      fontFamily: 'Orbitron, Arial, sans-serif',
      fontSize: `${fontSize}px`,
      color: `#${this.colors.textLight.toString(16).padStart(6, '0')}`,
      stroke: `#${this.colors.accent.toString(16).padStart(6, '0')}`,
      strokeThickness: 1,
      shadow: {
        offsetX: 0,
        offsetY: 0,
        color: `#${this.colors.accent.toString(16).padStart(6, '0')}`,
        blur: 5,
        stroke: true,
        fill: true
      }
    };
  }

  /**
   * Создает анимацию появления элемента
   */
  protected createAppearAnimation(duration: number = 300): Promise<void> {
    return new Promise((resolve) => {
      if (!this.scene.tweens) {
        resolve();
        return;
      }

      this.setAlpha(0);
      this.scene.tweens.add({
        targets: this.elements,
        alpha: { from: 0, to: 1 },
        duration,
        ease: 'Power2',
        onComplete: () => resolve()
      });
    });
  }

  /**
   * Создает анимацию исчезновения элемента
   */
  protected createDisappearAnimation(duration: number = 300): Promise<void> {
    return new Promise((resolve) => {
      if (!this.scene.tweens) {
        resolve();
        return;
      }

      this.scene.tweens.add({
        targets: this.elements,
        alpha: { from: 1, to: 0 },
        duration,
        ease: 'Power2',
        onComplete: () => resolve()
      });
    });
  }
}
