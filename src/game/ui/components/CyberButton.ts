import { CyberUIElement } from '../base/CyberUIElement';

export interface CyberButtonOptions {
  width?: number;
  height?: number;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  backgroundColor?: number | string;
  borderColor?: number | string;
  hoverColor?: number | string;
  pulseAnimation?: boolean;
  disabled?: boolean;
  visible?: boolean;
  interactive?: boolean;
  alpha?: number;
  borderRadius?: number;
}

export type ButtonCallback = () => void;

/**
 * Класс для создания кнопок в киберпанк-стиле
 */
export class CyberButton extends CyberUIElement {
  private width: number;
  private height: number;
  private fontSize: number;
  private pulseAnimation: boolean;
  private disabled: boolean;
  private callback: ButtonCallback;
  private text: string;
  private borderRadius: number;
  
  private background!: any; // Phaser.GameObjects.Graphics
  private textObject!: any; // Phaser.GameObjects.Text
  private hoverTween?: any; // Phaser.Tweens.Tween

  constructor(
    scene: any, 
    x: number, 
    y: number, 
    text: string, 
    callback: ButtonCallback, 
    options: CyberButtonOptions = {}
  ) {
    super(scene, x, y, options);
    
    // Настройки по умолчанию
    this.width = options.width || 400;
    this.height = options.height || 80;
    this.fontSize = options.fontSize || 28;
    this.pulseAnimation = options.pulseAnimation !== false;
    this.disabled = options.disabled || false;
    this.callback = callback;
    this.text = text;
    this.borderRadius = options.borderRadius || 8;
    
    // Создаем элементы кнопки
    this.createButton();
    
    // Если кнопка отключена, применяем соответствующий стиль
    if (this.disabled) {
      this.setDisabled(true);
    }
  }

  /**
   * Создает элементы кнопки
   */
  private createButton(): void {
    if (!this.scene.add) {
      console.error('Scene add not available');
      return;
    }

    // Создаем фон кнопки с округленными углами
    this.background = this.scene.add.graphics();
    this.drawButtonBackground();
    
    // Делаем фон интерактивным
    this.background.setInteractive(
      new Phaser.Geom.Rectangle(
        -this.width / 2,
        -this.height / 2,
        this.width,
        this.height
      ),
      Phaser.Geom.Rectangle.Contains
    );
    this.background.input.cursor = 'pointer';
    this.background.setPosition(this.x, this.y);
    this.addElement(this.background);

    // Создаем текст кнопки
    this.textObject = this.scene.add.text(
      this.x,
      this.y,
      this.text,
      this.getDefaultTextStyle(this.fontSize)
    );
    this.textObject.setOrigin(0.5);
    this.addElement(this.textObject);

    // Добавляем эффект пульсации, если включен
    if (this.pulseAnimation && !this.disabled) {
      this.createPulseEffect(this.background, 0.7, 1, 2000);
    }

    // Настраиваем события взаимодействия
    this.setupInteraction();
  }

  /**
   * Рисует фон кнопки с округленными углами
   */
  private drawButtonBackground(isHovered: boolean = false): void {
    if (!this.background) return;

    this.background.clear();
    
    // Устанавливаем цвета в зависимости от состояния
    const fillAlpha = isHovered ? this.colors.bgGlowAlpha * 2 : this.colors.bgGlowAlpha;
    
    // Рисуем фон с округленными углами
    this.background.fillStyle(this.colors.bgGlow, fillAlpha);
    this.background.fillRoundedRect(
      -this.width / 2,
      -this.height / 2,
      this.width,
      this.height,
      this.borderRadius
    );
    
    // Рисуем границу
    this.background.lineStyle(2, this.colors.accent, 1);
    this.background.strokeRoundedRect(
      -this.width / 2,
      -this.height / 2,
      this.width,
      this.height,
      this.borderRadius
    );
  }

  /**
   * Настраивает события взаимодействия с кнопкой
   */
  private setupInteraction(): void {
    if (!this.background) return;

    // Обработчик наведения мыши
    this.background.on('pointerover', () => {
      if (this.disabled) return;
      this.onHover();
    });

    // Обработчик ухода мыши
    this.background.on('pointerout', () => {
      if (this.disabled) return;
      this.onHoverOut();
    });

    // Обработчик нажатия
    this.background.on('pointerdown', () => {
      if (this.disabled) return;
      this.onPress();
    });

    // Обработчик отпускания
    this.background.on('pointerup', () => {
      if (this.disabled) return;
      this.onRelease();
    });

    // Обработчик клика
    this.background.on('pointerup', () => {
      if (this.disabled) return;
      this.onClick();
    });
  }

  /**
   * Обработчик наведения мыши
   */
  private onHover(): void {
    if (this.hoverTween) {
      this.hoverTween.stop();
    }

    if (this.scene.tweens) {
      this.hoverTween = this.scene.tweens.add({
        targets: [this.background, this.textObject],
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 150,
        ease: 'Power2'
      });
    }

    // Перерисовываем фон с эффектом наведения
    this.drawButtonBackground(true);
    
    // Увеличиваем интенсивность свечения текста
    this.textObject.setStyle({ 
      color: '#1a1a1a',
      stroke: '#ff6600',
      strokeThickness: 2,
      shadow: {
        offsetX: 0,
        offsetY: 0,
        color: '#ff6600',
        blur: 8,
        stroke: true,
        fill: true
      }
    });
  }

  /**
   * Обработчик ухода мыши
   */
  private onHoverOut(): void {
    if (this.hoverTween) {
      this.hoverTween.stop();
    }

    if (this.scene.tweens) {
      this.hoverTween = this.scene.tweens.add({
        targets: [this.background, this.textObject],
        scaleX: 1,
        scaleY: 1,
        duration: 150,
        ease: 'Power2'
      });
    }

    // Перерисовываем фон в обычном состоянии
    this.drawButtonBackground(false);
    
    // Возвращаем обычный стиль текста
    this.textObject.setStyle({
      color: '#1a1a1a',
      stroke: '#ff6600',
      strokeThickness: 1,
      shadow: {
        offsetX: 0,
        offsetY: 0,
        color: '#ff6600',
        blur: 5,
        stroke: true,
        fill: true
      }
    });
  }

  /**
   * Обработчик нажатия кнопки
   */
  private onPress(): void {
    if (this.scene.tweens) {
      this.scene.tweens.add({
        targets: [this.background, this.textObject],
        scaleX: 0.95,
        scaleY: 0.95,
        duration: 100,
        ease: 'Power2'
      });
    }
  }

  /**
   * Обработчик отпускания кнопки
   */
  private onRelease(): void {
    if (this.scene.tweens) {
      this.scene.tweens.add({
        targets: [this.background, this.textObject],
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 100,
        ease: 'Power2'
      });
    }
  }

  /**
   * Обработчик клика по кнопке
   */
  private onClick(): void {
    try {
      if (this.callback) {
        this.callback();
      }
    } catch (error) {
      console.error('Error in button callback:', error);
    }
  }

  /**
   * Устанавливает состояние отключенной кнопки
   */
  public setDisabled(disabled: boolean): this {
    this.disabled = disabled;
    
    if (disabled) {
      this.background.setAlpha(0.5);
      this.textObject.setAlpha(0.5);
      this.background.disableInteractive();
      
      if (this.hoverTween) {
        this.hoverTween.stop();
      }
    } else {
      this.background.setAlpha(1);
      this.textObject.setAlpha(1);
      this.background.setInteractive({ useHandCursor: true });
    }
    
    return this;
  }

  /**
   * Проверяет, отключена ли кнопка
   */
  public isDisabled(): boolean {
    return this.disabled;
  }

  /**
   * Устанавливает новый текст кнопки
   */
  public setText(text: string): this {
    this.text = text;
    if (this.textObject) {
      this.textObject.setText(text);
    }
    return this;
  }

  /**
   * Получает текст кнопки
   */
  public getText(): string {
    return this.text;
  }

  /**
   * Устанавливает новый callback
   */
  public setCallback(callback: ButtonCallback): this {
    this.callback = callback;
    return this;
  }

  /**
   * Программно выполняет клик по кнопке
   */
  public click(): void {
    if (!this.disabled) {
      this.onClick();
    }
  }

  /**
   * Переопределяем метод destroy для очистки ресурсов
   */
  public destroy(): void {
    if (this.hoverTween) {
      this.hoverTween.stop();
      this.hoverTween = undefined;
    }
    
    if (this.background) {
      this.background.removeAllListeners();
    }
    
    super.destroy();
  }
}
