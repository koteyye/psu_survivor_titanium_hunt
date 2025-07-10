import { CyberUIElement } from '../base/CyberUIElement';

export interface CyberBarOptions {
  width?: number;
  height?: number;
  iconKey?: string;
  showValue?: boolean;
  barColor?: number;
  backgroundColor?: number;
  pulseAnimation?: boolean;
  maxValue?: number;
  currentValue?: number;
  showPercentage?: boolean;
  visible?: boolean;
  interactive?: boolean;
  alpha?: number;
}

/**
 * Класс для создания шкал в киберпанк-стиле
 */
export class CyberBar extends CyberUIElement {
  private width: number;
  private height: number;
  private iconKey: string | null;
  private showValue: boolean;
  private barColor: number;
  private pulseAnimation: boolean;
  private maxValue: number;
  private currentValue: number;
  private showPercentage: boolean;
  
  private container!: any; // Phaser.GameObjects.Container
  private icon?: any; // Phaser.GameObjects.Image
  private barBackground!: any; // Phaser.GameObjects.Rectangle
  private barFill!: any; // Phaser.GameObjects.Rectangle
  private fillGradient!: any; // Phaser.GameObjects.Rectangle
  private valueText?: any; // Phaser.GameObjects.Text

  constructor(
    scene: any, 
    x: number, 
    y: number, 
    value: number, 
    options: CyberBarOptions = {}
  ) {
    super(scene, x, y, options);
    
    // Настройки по умолчанию
    this.width = options.width || 400;
    this.height = options.height || 30;
    this.iconKey = options.iconKey || null;
    this.showValue = options.showValue !== false;
    this.barColor = options.barColor || this.colors.accent;
    this.pulseAnimation = options.pulseAnimation !== false;
    this.maxValue = options.maxValue || 100;
    this.currentValue = options.currentValue !== undefined ? options.currentValue : value;
    this.showPercentage = options.showPercentage !== false;
    
    // Нормализуем значение
    this.setValue(value);
    
    // Создаем элементы шкалы
    this.createBar();
  }

  /**
   * Создает элементы шкалы
   */
  private createBar(): void {
    if (!this.scene.add) {
      console.error('Scene add not available');
      return;
    }

    // Создаем контейнер
    this.container = this.scene.add.container(this.x, this.y);
    this.addElement(this.container);

    // Создаем иконку, если указан ключ текстуры
    if (this.iconKey) {
      this.createIcon();
    }

    // Создаем фон шкалы
    this.barBackground = this.scene.add.rectangle(
      0, 
      0, 
      this.width, 
      this.height, 
      this.colors.bgGlow, 
      0.1
    );
    this.barBackground.setStrokeStyle(2, this.barColor);
    this.container.add(this.barBackground);

    // Создаем заполнение шкалы
    this.createBarFill();

    // Создаем текст со значением
    if (this.showValue) {
      this.createValueText();
    }
  }

  /**
   * Создает иконку для шкалы
   */
  private createIcon(): void {
    if (!this.iconKey) return;

    const iconX = -this.width / 2 - 50;
    
    try {
      this.icon = this.scene.add.image(iconX, 0, this.iconKey);
      this.icon.setDisplaySize(64, 64);
      this.container.add(this.icon);

      // Добавляем свечение для иконки
      const iconGlow = this.scene.add.image(iconX, 0, this.iconKey);
      iconGlow.setDisplaySize(70, 70);
      iconGlow.setTint(this.barColor);
      iconGlow.setAlpha(0.5);
      
      if (iconGlow.setBlendMode) {
        iconGlow.setBlendMode(1); // ADD blend mode
      }
      
      this.container.add(iconGlow);

      // Добавляем пульсацию для свечения
      if (this.pulseAnimation) {
        this.createPulseEffect(iconGlow, 0.3, 0.5);
      }
    } catch (error) {
      console.warn(`Could not load icon ${this.iconKey}:`, error);
    }
  }

  /**
   * Создает заполнение шкалы
   */
  private createBarFill(): void {
    const fillWidth = (this.currentValue / this.maxValue) * this.width;
    
    // Создаем заполнение шкалы
    this.barFill = this.scene.add.rectangle(
      -this.width / 2, 
      0, 
      fillWidth, 
      this.height - 4, 
      this.barColor
    );
    this.barFill.setOrigin(0, 0.5);
    this.container.add(this.barFill);

    // Создаем градиент для заполнения
    this.fillGradient = this.scene.add.rectangle(
      -this.width / 2, 
      0, 
      fillWidth, 
      this.height - 4, 
      0xffffff, 
      0.2
    );
    this.fillGradient.setOrigin(0, 0.5);
    this.container.add(this.fillGradient);
  }

  /**
   * Создает текст со значением
   */
  private createValueText(): void {
    const textValue = this.showPercentage 
      ? `${Math.round((this.currentValue / this.maxValue) * 100)}%`
      : `${Math.round(this.currentValue)}/${this.maxValue}`;

    this.valueText = this.scene.add.text(
      this.width / 2 + 20, 
      0, 
      textValue,
      this.getDefaultTextStyle(20)
    );
    this.valueText.setOrigin(0, 0.5);
    this.container.add(this.valueText);

    // Добавляем пульсацию для текста
    if (this.pulseAnimation) {
      this.createPulseEffect(this.valueText, 0.8, 1, 1500);
    }
  }

  /**
   * Устанавливает новое значение шкалы
   */
  public setValue(value: number, animate: boolean = true): this {
    // Нормализуем значение
    const clampedValue = Math.max(0, Math.min(this.maxValue, value));
    const oldValue = this.currentValue;
    this.currentValue = clampedValue;

    const fillWidth = (this.currentValue / this.maxValue) * this.width;

    if (animate && this.scene.tweens && Math.abs(oldValue - clampedValue) > 0.1) {
      // Анимированное изменение
      this.scene.tweens.add({
        targets: [this.barFill, this.fillGradient],
        width: fillWidth,
        duration: 500,
        ease: 'Power2.easeOut'
      });
    } else {
      // Мгновенное изменение
      this.barFill.width = fillWidth;
      this.fillGradient.width = fillWidth;
    }

    // Обновляем текст
    if (this.valueText) {
      const textValue = this.showPercentage 
        ? `${Math.round((this.currentValue / this.maxValue) * 100)}%`
        : `${Math.round(this.currentValue)}/${this.maxValue}`;
      this.valueText.setText(textValue);
    }

    // Изменяем цвет в зависимости от значения
    this.updateColorByValue();

    return this;
  }

  /**
   * Получает текущее значение
   */
  public getValue(): number {
    return this.currentValue;
  }

  /**
   * Получает максимальное значение
   */
  public getMaxValue(): number {
    return this.maxValue;
  }

  /**
   * Устанавливает максимальное значение
   */
  public setMaxValue(maxValue: number): this {
    this.maxValue = Math.max(1, maxValue);
    this.setValue(this.currentValue, false);
    return this;
  }

  /**
   * Получает процентное значение (0-100)
   */
  public getPercentage(): number {
    return (this.currentValue / this.maxValue) * 100;
  }

  /**
   * Устанавливает значение в процентах
   */
  public setPercentage(percentage: number): this {
    const value = (percentage / 100) * this.maxValue;
    return this.setValue(value);
  }

  /**
   * Обновляет цвет шкалы в зависимости от значения
   */
  private updateColorByValue(): void {
    const percentage = this.getPercentage();
    let color = this.barColor;

    if (percentage <= 25) {
      color = 0xff0000; // Красный
    } else if (percentage <= 50) {
      color = 0xff8800; // Оранжевый
    } else if (percentage <= 75) {
      color = 0xffff00; // Желтый
    } else {
      color = this.barColor; // Обычный цвет
    }

    if (this.barFill) {
      this.barFill.setFillStyle(color);
    }
  }

  /**
   * Устанавливает цвет шкалы
   */
  public setBarColor(color: number): this {
    this.barColor = color;
    if (this.barFill) {
      this.barFill.setFillStyle(color);
    }
    if (this.barBackground) {
      this.barBackground.setStrokeStyle(2, color);
    }
    return this;
  }

  /**
   * Анимирует заполнение шкалы от 0 до текущего значения
   */
  public animateFromZero(duration: number = 1000): Promise<void> {
    return new Promise((resolve) => {
      if (!this.scene.tweens) {
        resolve();
        return;
      }

      const targetValue = this.currentValue;
      this.currentValue = 0;
      this.barFill.width = 0;
      this.fillGradient.width = 0;

      this.scene.tweens.add({
        targets: { value: 0 },
        value: targetValue,
        duration,
        ease: 'Power2.easeOut',
        onUpdate: (tween: any) => {
          const value = tween.targets[0].value;
          this.setValue(value, false);
        },
        onComplete: () => resolve()
      });
    });
  }

  /**
   * Переопределяем setPosition для контейнера
   */
  public setPosition(x: number, y: number): this {
    this.x = x;
    this.y = y;
    if (this.container) {
      this.container.setPosition(x, y);
    }
    return this;
  }
}
