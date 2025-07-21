import { CyberUIElement } from '../base/CyberUIElement';
import { FontUtils } from '../../../utils/FontUtils';

export interface CyberTitleOptions {
  fontSize?: number;
  fontFamily?: string;
  color?: number;
  glowColor?: number;
  glowIntensity?: number;
  pulseAnimation?: boolean;
  typewriterEffect?: boolean;
  typewriterSpeed?: number;
  visible?: boolean;
  interactive?: boolean;
  alpha?: number;
}

/**
 * Класс для создания заголовков в киберпанк-стиле
 */
export class CyberTitle extends CyberUIElement {
  private fontSize: number;
  private fontFamily: string;
  private textColor: number;
  private glowColor: number;
  private glowIntensity: number;
  private pulseAnimation: boolean;
  private typewriterEffect: boolean;
  private typewriterSpeed: number;
  private text: string;
  
  private textObject!: any; // Phaser.GameObjects.Text
  private glowText!: any; // Phaser.GameObjects.Text
  private typewriterTimer?: any; // Phaser.Time.TimerEvent
  private currentTypewriterIndex: number = 0;

  constructor(
    scene: any, 
    x: number, 
    y: number, 
    text: string, 
    options: CyberTitleOptions = {}
  ) {
    super(scene, x, y, options);
    
    // Get FontUtils instance for proper font handling
    const fontUtils = FontUtils.getInstance();
    
    // Настройки по умолчанию
    this.fontSize = options.fontSize || 48;
    // Use Caslon Antique font for titles with proper fallback handling
    this.fontFamily = options.fontFamily || fontUtils.getTitleFont();
    // Use soft-black color with orange neon theme
    this.textColor = options.color || this.colors.textLight;
    this.glowColor = options.glowColor || this.colors.accent;
    this.glowIntensity = options.glowIntensity || 1;
    this.pulseAnimation = options.pulseAnimation !== false;
    this.typewriterEffect = options.typewriterEffect || false;
    this.typewriterSpeed = options.typewriterSpeed || 50;
    this.text = text;
    
    // Создаем элементы заголовка
    this.createTitle();
    
    // Запускаем эффект печатной машинки, если включен
    if (this.typewriterEffect) {
      this.startTypewriterEffect();
    }
  }

  /**
   * Создает элементы заголовка
   */
  private createTitle(): void {
    if (!this.scene.add) {
      console.error('Scene add not available');
      return;
    }

    const textStyle = this.getTextStyle();
    
    // Создаем основной текст
    const displayText = this.typewriterEffect ? '' : this.text;
    this.textObject = this.scene.add.text(
      this.x,
      this.y,
      displayText,
      textStyle
    );
    this.textObject.setOrigin(0.5);
    this.addElement(this.textObject);

    // Создаем эффект свечения
    this.createGlowText();

    // Добавляем пульсацию, если включена
    if (this.pulseAnimation && !this.typewriterEffect) {
      this.createPulseEffect(this.glowText, 0.5, 1, 2000);
    }
  }

  /**
   * Создает эффект свечения для текста
   */
  private createGlowText(): void {
    const glowStyle = {
      ...this.getTextStyle(),
      color: `#${this.glowColor.toString(16).padStart(6, '0')}`,
      stroke: `#${this.glowColor.toString(16).padStart(6, '0')}`,
      strokeThickness: 4 * this.glowIntensity,
      shadow: {
        offsetX: 0,
        offsetY: 0,
        color: `#${this.glowColor.toString(16).padStart(6, '0')}`,
        blur: 10 * this.glowIntensity,
        stroke: true,
        fill: true
      }
    };

    const displayText = this.typewriterEffect ? '' : this.text;
    this.glowText = this.scene.add.text(
      this.x,
      this.y,
      displayText,
      glowStyle
    );
    this.glowText.setOrigin(0.5);
    this.glowText.setAlpha(0.7);
    this.glowText.setDepth(this.textObject.depth - 1);
    this.addElement(this.glowText);
  }

  /**
   * Получает стиль текста с проверкой загрузки шрифтов
   */
  private getTextStyle(): any {
    // Get current font family with fallback handling
    const fontFamily = this.getFontFamilyWithFallback();
    
    return {
      fontFamily: fontFamily,
      fontSize: `${this.fontSize}px`,
      color: `#${this.textColor.toString(16).padStart(6, '0')}`,
      fontWeight: 'bold',
      align: 'center',
      // Enhanced shadow for soft-black with orange neon theme
      shadow: {
        offsetX: 1,
        offsetY: 1,
        color: `#${this.glowColor.toString(16).padStart(6, '0')}`,
        blur: 3,
        stroke: false,
        fill: true
      }
    };
  }

  /**
   * Получает семейство шрифтов с обработкой ошибок загрузки
   */
  private getFontFamilyWithFallback(): string {
    try {
      const fontUtils = FontUtils.getInstance();
      
      // Check if title font is loaded, otherwise use fallback
      if (fontUtils.isFontLoaded(FontUtils.TITLE_FONT)) {
        return this.fontFamily;
      } else {
        console.warn('CyberTitle: Title font not loaded, using fallback');
        return 'serif'; // Fallback for title font
      }
    } catch (error) {
      console.error('CyberTitle: Error checking font status, using fallback:', error);
      return 'serif'; // Safe fallback
    }
  }

  /**
   * Запускает эффект печатной машинки
   */
  private startTypewriterEffect(): void {
    if (!this.scene.time) {
      console.warn('Scene time not available for typewriter effect');
      return;
    }

    this.currentTypewriterIndex = 0;
    this.textObject.setText('');
    this.glowText.setText('');

    this.typewriterTimer = this.scene.time.addEvent({
      delay: this.typewriterSpeed,
      callback: this.typewriterStep,
      callbackScope: this,
      repeat: this.text.length - 1
    });
  }

  /**
   * Шаг эффекта печатной машинки
   */
  private typewriterStep(): void {
    this.currentTypewriterIndex++;
    const displayText = this.text.substring(0, this.currentTypewriterIndex);
    
    this.textObject.setText(displayText);
    this.glowText.setText(displayText);

    // Если завершили печать, запускаем пульсацию
    if (this.currentTypewriterIndex >= this.text.length && this.pulseAnimation) {
      this.scene.time.delayedCall(200, () => {
        this.createPulseEffect(this.glowText, 0.5, 1, 2000);
      });
    }
  }

  /**
   * Устанавливает новый текст
   */
  public setText(text: string, useTypewriter: boolean = this.typewriterEffect): this {
    this.text = text;
    
    // Останавливаем текущий эффект печатной машинки
    if (this.typewriterTimer) {
      this.typewriterTimer.destroy();
      this.typewriterTimer = undefined;
    }

    if (useTypewriter) {
      this.startTypewriterEffect();
    } else {
      this.textObject.setText(text);
      this.glowText.setText(text);
    }
    
    return this;
  }

  /**
   * Получает текст заголовка
   */
  public getText(): string {
    return this.text;
  }

  /**
   * Устанавливает размер шрифта
   */
  public setFontSize(fontSize: number): this {
    this.fontSize = fontSize;
    const newStyle = this.getTextStyle();
    this.textObject.setStyle(newStyle);
    
    const glowStyle = {
      ...newStyle,
      color: `#${this.glowColor.toString(16).padStart(6, '0')}`,
      stroke: `#${this.glowColor.toString(16).padStart(6, '0')}`,
      strokeThickness: 4 * this.glowIntensity,
      shadow: {
        offsetX: 0,
        offsetY: 0,
        color: `#${this.glowColor.toString(16).padStart(6, '0')}`,
        blur: 10 * this.glowIntensity,
        stroke: true,
        fill: true
      }
    };
    this.glowText.setStyle(glowStyle);
    
    return this;
  }

  /**
   * Обновляет шрифт после загрузки (для обработки асинхронной загрузки шрифтов)
   */
  public refreshFont(): this {
    try {
      const fontUtils = FontUtils.getInstance();
      
      // Update font family to use loaded font
      this.fontFamily = fontUtils.getTitleFont();
      
      // Refresh both text objects with new font
      const newStyle = this.getTextStyle();
      this.textObject.setStyle(newStyle);
      
      const glowStyle = {
        ...newStyle,
        color: `#${this.glowColor.toString(16).padStart(6, '0')}`,
        stroke: `#${this.glowColor.toString(16).padStart(6, '0')}`,
        strokeThickness: 4 * this.glowIntensity,
        shadow: {
          offsetX: 0,
          offsetY: 0,
          color: `#${this.glowColor.toString(16).padStart(6, '0')}`,
          blur: 10 * this.glowIntensity,
          stroke: true,
          fill: true
        }
      };
      this.glowText.setStyle(glowStyle);
      
      console.log('CyberTitle: Font refreshed successfully');
    } catch (error) {
      console.error('CyberTitle: Error refreshing font:', error);
    }
    
    return this;
  }

  /**
   * Устанавливает цвет текста
   */
  public setTextColor(color: number): this {
    this.textColor = color;
    this.textObject.setStyle({
      color: `#${color.toString(16).padStart(6, '0')}`
    });
    return this;
  }

  /**
   * Устанавливает цвет свечения
   */
  public setGlowColor(color: number): this {
    this.glowColor = color;
    this.glowText.setStyle({
      color: `#${color.toString(16).padStart(6, '0')}`,
      stroke: `#${color.toString(16).padStart(6, '0')}`
    });
    return this;
  }

  /**
   * Устанавливает интенсивность свечения
   */
  public setGlowIntensity(intensity: number): this {
    this.glowIntensity = intensity;
    this.glowText.setStyle({
      strokeThickness: 4 * intensity
    });
    return this;
  }

  /**
   * Включает/выключает пульсацию
   */
  public setPulseAnimation(enabled: boolean): this {
    this.pulseAnimation = enabled;
    
    if (enabled) {
      this.createPulseEffect(this.glowText, 0.5, 1, 2000);
    } else {
      // Останавливаем пульсацию
      if (this.scene.tweens) {
        this.scene.tweens.killTweensOf(this.glowText);
      }
      this.glowText.setAlpha(0.7);
    }
    
    return this;
  }

  /**
   * Создает анимацию появления заголовка
   */
  public animateAppear(duration: number = 800): Promise<void> {
    return new Promise((resolve) => {
      if (!this.scene.tweens) {
        resolve();
        return;
      }

      // Устанавливаем начальное состояние
      this.textObject.setAlpha(0);
      this.textObject.setScale(0.5);
      this.glowText.setAlpha(0);
      this.glowText.setScale(0.5);

      // Анимируем появление
      this.scene.tweens.add({
        targets: [this.textObject, this.glowText],
        alpha: { from: 0, to: [1, 0.7] },
        scaleX: { from: 0.5, to: 1 },
        scaleY: { from: 0.5, to: 1 },
        duration,
        ease: 'Back.easeOut',
        onComplete: () => {
          if (this.pulseAnimation) {
            this.createPulseEffect(this.glowText, 0.5, 1, 2000);
          }
          resolve();
        }
      });
    });
  }

  /**
   * Устанавливает обводку текста
   */
  public setStroke(color: string, thickness: number): this {
    if (this.textObject && this.textObject.setStroke) {
      this.textObject.setStroke(color, thickness);
    }
    return this;
  }

  /**
   * Устанавливает тень текста
   */
  public setShadow(x: number, y: number, color: string, blur: number, shadowStroke: boolean, shadowFill: boolean): this {
    if (this.textObject && this.textObject.setShadow) {
      this.textObject.setShadow(x, y, color, blur, shadowStroke, shadowFill);
    }
    return this;
  }

  /**
   * Переопределяем setPosition для обоих текстовых объектов
   */
  public setPosition(x: number, y: number): this {
    this.x = x;
    this.y = y;
    if (this.textObject) {
      this.textObject.setPosition(x, y);
    }
    if (this.glowText) {
      this.glowText.setPosition(x, y);
    }
    return this;
  }

  /**
   * Переопределяем destroy для очистки таймера
   */
  public destroy(): void {
    if (this.typewriterTimer) {
      this.typewriterTimer.destroy();
      this.typewriterTimer = undefined;
    }
    super.destroy();
  }
}
