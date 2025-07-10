import { CyberUIElement } from '../base/CyberUIElement';

export interface CyberSwitchOptions {
  width?: number;
  height?: number;
  initialState?: boolean;
  onTexture?: string;
  offTexture?: string;
  labelText?: string;
  labelPosition?: 'left' | 'right' | 'top' | 'bottom';
  disabled?: boolean;
  visible?: boolean;
  interactive?: boolean;
  alpha?: number;
}

export type SwitchCallback = (state: boolean) => void;

/**
 * Класс для создания переключателей в киберпанк-стиле
 */
export class CyberSwitch extends CyberUIElement {
  private width: number;
  private height: number;
  private state: boolean;
  private onTexture: string | null;
  private offTexture: string | null;
  private labelText: string | null;
  private labelPosition: 'left' | 'right' | 'top' | 'bottom';
  private disabled: boolean;
  private callback?: SwitchCallback;
  
  private container!: any; // Phaser.GameObjects.Container
  private background!: any; // Phaser.GameObjects.Rectangle
  private handle!: any; // Phaser.GameObjects.Rectangle | Image
  private label?: any; // Phaser.GameObjects.Text
  private isAnimating: boolean = false;

  constructor(
    scene: any, 
    x: number, 
    y: number, 
    initialState: boolean = false,
    callback?: SwitchCallback,
    options: CyberSwitchOptions = {}
  ) {
    super(scene, x, y, options);
    
    // Настройки по умолчанию
    this.width = options.width || 120;
    this.height = options.height || 40;
    this.state = options.initialState !== undefined ? options.initialState : initialState;
    this.onTexture = options.onTexture || null;
    this.offTexture = options.offTexture || null;
    this.labelText = options.labelText || null;
    this.labelPosition = options.labelPosition || 'right';
    this.disabled = options.disabled || false;
    this.callback = callback;
    
    // Создаем элементы переключателя
    this.createSwitch();
    
    // Если переключатель отключен, применяем соответствующий стиль
    if (this.disabled) {
      this.setDisabled(true);
    }
  }

  /**
   * Создает элементы переключателя
   */
  private createSwitch(): void {
    if (!this.scene.add) {
      console.error('Scene add not available');
      return;
    }

    // Создаем контейнер
    this.container = this.scene.add.container(this.x, this.y);
    this.addElement(this.container);

    // Создаем фон переключателя
    this.createBackground();

    // Создаем ручку переключателя
    this.createHandle();

    // Создаем подпись, если указана
    if (this.labelText) {
      this.createLabel();
    }

    // Настраиваем взаимодействие
    this.setupInteraction();

    // Устанавливаем начальное состояние
    this.updateVisualState(false);
  }

  /**
   * Создает фон переключателя
   */
  private createBackground(): void {
    this.background = this.scene.add.rectangle(
      0, 
      0, 
      this.width, 
      this.height, 
      this.colors.bgGlow, 
      0.1
    );
    
    const strokeColor = this.state ? this.colors.accent : this.colors.accentDark;
    this.background.setStrokeStyle(2, strokeColor);
    this.background.setInteractive({ useHandCursor: true });
    this.container.add(this.background);
  }

  /**
   * Создает ручку переключателя
   */
  private createHandle(): void {
    const handleSize = this.height - 8;
    
    if (this.state && this.onTexture) {
      // Используем текстуру для включенного состояния
      try {
        this.handle = this.scene.add.image(0, 0, this.onTexture);
        this.handle.setDisplaySize(handleSize, handleSize);
      } catch (error) {
        console.warn(`Could not load on texture ${this.onTexture}:`, error);
        this.createRectangleHandle(handleSize);
      }
    } else if (!this.state && this.offTexture) {
      // Используем текстуру для выключенного состояния
      try {
        this.handle = this.scene.add.image(0, 0, this.offTexture);
        this.handle.setDisplaySize(handleSize, handleSize);
      } catch (error) {
        console.warn(`Could not load off texture ${this.offTexture}:`, error);
        this.createRectangleHandle(handleSize);
      }
    } else {
      // Создаем прямоугольную ручку
      this.createRectangleHandle(handleSize);
    }
    
    this.container.add(this.handle);
  }

  /**
   * Создает прямоугольную ручку
   */
  private createRectangleHandle(size: number): void {
    const handleColor = this.state ? this.colors.accent : this.colors.textLight;
    this.handle = this.scene.add.rectangle(0, 0, size, size, handleColor);
    this.handle.setStrokeStyle(1, 0xffffff);
  }

  /**
   * Создает подпись переключателя
   */
  private createLabel(): void {
    if (!this.labelText) return;

    let labelX = 0;
    let labelY = 0;
    
    switch (this.labelPosition) {
      case 'left':
        labelX = -this.width / 2 - 20;
        break;
      case 'right':
        labelX = this.width / 2 + 20;
        break;
      case 'top':
        labelY = -this.height / 2 - 20;
        break;
      case 'bottom':
        labelY = this.height / 2 + 20;
        break;
    }

    this.label = this.scene.add.text(
      labelX,
      labelY,
      this.labelText,
      this.getDefaultTextStyle(18)
    );
    
    if (this.labelPosition === 'left') {
      this.label.setOrigin(1, 0.5);
    } else if (this.labelPosition === 'right') {
      this.label.setOrigin(0, 0.5);
    } else {
      this.label.setOrigin(0.5);
    }
    
    this.container.add(this.label);
  }

  /**
   * Настраивает взаимодействие с переключателем
   */
  private setupInteraction(): void {
    if (!this.background) return;

    // Обработчик клика
    this.background.on('pointerdown', () => {
      if (this.disabled || this.isAnimating) return;
      this.toggle();
    });

    // Эффекты наведения
    this.background.on('pointerover', () => {
      if (this.disabled) return;
      this.onHover();
    });

    this.background.on('pointerout', () => {
      if (this.disabled) return;
      this.onHoverOut();
    });
  }

  /**
   * Обработчик наведения мыши
   */
  private onHover(): void {
    if (this.scene.tweens) {
      this.scene.tweens.add({
        targets: this.container,
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 100,
        ease: 'Power2'
      });
    }
  }

  /**
   * Обработчик ухода мыши
   */
  private onHoverOut(): void {
    if (this.scene.tweens) {
      this.scene.tweens.add({
        targets: this.container,
        scaleX: 1,
        scaleY: 1,
        duration: 100,
        ease: 'Power2'
      });
    }
  }

  /**
   * Переключает состояние
   */
  public toggle(): this {
    if (this.disabled || this.isAnimating) return this;
    
    this.setState(!this.state);
    return this;
  }

  /**
   * Устанавливает состояние переключателя
   */
  public setState(state: boolean, animate: boolean = true): this {
    if (this.disabled || this.state === state) return this;
    
    this.state = state;
    this.updateVisualState(animate);
    
    // Вызываем callback
    if (this.callback) {
      try {
        this.callback(this.state);
      } catch (error) {
        console.error('Error in switch callback:', error);
      }
    }
    
    return this;
  }

  /**
   * Получает текущее состояние
   */
  public getState(): boolean {
    return this.state;
  }

  /**
   * Обновляет визуальное состояние переключателя
   */
  private updateVisualState(animate: boolean): void {
    const targetX = this.state ? this.width / 2 - 20 : -this.width / 2 + 20;
    const handleColor = this.state ? this.colors.accent : this.colors.textLight;
    const strokeColor = this.state ? this.colors.accent : this.colors.accentDark;

    if (animate && this.scene.tweens) {
      this.isAnimating = true;
      
      // Анимируем движение ручки
      this.scene.tweens.add({
        targets: this.handle,
        x: targetX,
        duration: 200,
        ease: 'Power2.easeOut',
        onComplete: () => {
          this.isAnimating = false;
        }
      });        // Анимируем цвет ручки (если это прямоугольник)
        if (this.handle.fillColor !== undefined) {
          this.scene.tweens.addCounter({
            from: 0,
            to: 1,
            duration: 200,
            onUpdate: () => {
              const newColor = this.state ? this.colors.accent : this.colors.textLight;
              
              // Интерполируем цвет (упрощенная версия)
              this.handle.setFillStyle(newColor, 1);
            }
          });
        }
    } else {
      // Мгновенное обновление
      this.handle.x = targetX;
      if (this.handle.fillColor !== undefined) {
        this.handle.setFillStyle(handleColor);
      }
    }

    // Обновляем цвет фона
    this.background.setStrokeStyle(2, strokeColor);

    // Обновляем текстуру ручки, если используются текстуры
    this.updateHandleTexture();
  }

  /**
   * Обновляет текстуру ручки
   */
  private updateHandleTexture(): void {
    const targetTexture = this.state ? this.onTexture : this.offTexture;
    
    if (targetTexture && this.handle.setTexture) {
      try {
        this.handle.setTexture(targetTexture);
      } catch (error) {
        console.warn(`Could not set texture ${targetTexture}:`, error);
      }
    }
  }

  /**
   * Устанавливает состояние отключенного переключателя
   */
  public setDisabled(disabled: boolean): this {
    this.disabled = disabled;
    
    if (disabled) {
      this.container.setAlpha(0.5);
      this.background.disableInteractive();
    } else {
      this.container.setAlpha(1);
      this.background.setInteractive({ useHandCursor: true });
    }
    
    return this;
  }

  /**
   * Проверяет, отключен ли переключатель
   */
  public isDisabled(): boolean {
    return this.disabled;
  }

  /**
   * Устанавливает новый callback
   */
  public setCallback(callback: SwitchCallback): this {
    this.callback = callback;
    return this;
  }

  /**
   * Устанавливает текст подписи
   */
  public setLabelText(text: string): this {
    this.labelText = text;
    if (this.label) {
      this.label.setText(text);
    } else if (text) {
      this.createLabel();
    }
    return this;
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
