import { CyberUIElement } from '../base/CyberUIElement';

export interface CyberCardOptions {
  cardWidth?: number;
  cardHeight?: number;
  imageScale?: number;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  backgroundColor?: number;
  borderColor?: number;
  hoverColor?: number;
  pulseAnimation?: boolean;
  showDescription?: boolean;
  disabled?: boolean;
  selected?: boolean;
  visible?: boolean;
  interactive?: boolean;
  alpha?: number;
}

export type CardCallback = (cardId?: string) => void;

/**
 * Класс для создания карточек в киберпанк-стиле
 */
export class CyberCard extends CyberUIElement {
  private cardWidth: number;
  private cardHeight: number;
  private imageScale: number;
  private pulseAnimation: boolean;
  private showDescription: boolean;
  private disabled: boolean;
  private selected: boolean;
  private callback?: CardCallback;
  private cardId?: string;
  private title: string;
  private description: string;
  private imageKey: string;
  
  private container!: any; // Phaser.GameObjects.Container
  private background!: any; // Phaser.GameObjects.Rectangle
  private image!: any; // Phaser.GameObjects.Image
  private titleText!: any; // Phaser.GameObjects.Text
  private descriptionText?: any; // Phaser.GameObjects.Text
  private selectionBorder?: any; // Phaser.GameObjects.Rectangle
  private hoverTween?: any; // Phaser.Tweens.Tween

  constructor(
    scene: any, 
    x: number, 
    y: number, 
    imageKey: string,
    title: string,
    description: string = '',
    callback?: CardCallback,
    options: CyberCardOptions = {}
  ) {
    super(scene, x, y, options);
    
    // Настройки по умолчанию
    this.cardWidth = options.cardWidth || 200;
    this.cardHeight = options.cardHeight || 280;
    this.imageScale = options.imageScale || 1;
    this.pulseAnimation = options.pulseAnimation !== false;
    this.showDescription = options.showDescription !== false;
    this.disabled = options.disabled || false;
    this.selected = options.selected || false;
    this.callback = callback;
    this.title = title;
    this.description = description;
    this.imageKey = imageKey;
    
    // Создаем элементы карточки
    this.createCard();
    
    // Применяем начальные состояния
    if (this.disabled) {
      this.setDisabled(true);
    }
    if (this.selected) {
      this.setSelected(true, false);
    }
  }

  /**
   * Создает элементы карточки
   */
  private createCard(): void {
    if (!this.scene.add) {
      console.error('Scene add not available');
      return;
    }

    // Создаем контейнер
    this.container = this.scene.add.container(this.x, this.y);
    this.addElement(this.container);

    // Создаем фон карточки
    this.createBackground();

    // Создаем изображение
    this.createImage();

    // Создаем заголовок
    this.createTitle();

    // Создаем описание, если включено
    if (this.showDescription && this.description) {
      this.createDescription();
    }

    // Создаем рамку выделения
    this.createSelectionBorder();

    // Настраиваем взаимодействие
    this.setupInteraction();

    // Добавляем пульсацию, если включена
    if (this.pulseAnimation && !this.disabled) {
      this.createPulseEffect(this.background, 0.8, 1, 3000);
    }
  }

  /**
   * Создает фон карточки
   */
  private createBackground(): void {
    this.background = this.scene.add.rectangle(
      0, 
      0, 
      this.cardWidth, 
      this.cardHeight, 
      this.colors.bgGlow, 
      0.1
    );
    this.background.setStrokeStyle(2, this.colors.accent);
    this.background.setInteractive({ useHandCursor: true });
    this.container.add(this.background);
  }

  /**
   * Создает изображение карточки
   */
  private createImage(): void {
    try {
      this.image = this.scene.add.image(0, -this.cardHeight / 4, this.imageKey);
      
      // Масштабируем изображение, чтобы оно помещалось в карточку
      const maxImageWidth = this.cardWidth - 40;
      const maxImageHeight = this.cardHeight / 2;
      
      if (this.image.width > maxImageWidth || this.image.height > maxImageHeight) {
        const scaleX = maxImageWidth / this.image.width;
        const scaleY = maxImageHeight / this.image.height;
        const scale = Math.min(scaleX, scaleY) * this.imageScale;
        this.image.setScale(scale);
      } else {
        this.image.setScale(this.imageScale);
      }
      
      this.container.add(this.image);
    } catch (error) {
      console.warn(`Could not load image ${this.imageKey}:`, error);
      
      // Создаем заглушку
      const placeholder = this.scene.add.rectangle(
        0, 
        -this.cardHeight / 4, 
        this.cardWidth - 40, 
        this.cardHeight / 2 - 20, 
        this.colors.accentDark
      );
      placeholder.setStrokeStyle(1, this.colors.accent);
      this.container.add(placeholder);
      
      // Добавляем текст заглушки
      const placeholderText = this.scene.add.text(
        0, 
        -this.cardHeight / 4, 
        '?', 
        {
          fontSize: '48px',
          color: `#${this.colors.accent.toString(16).padStart(6, '0')}`
        }
      );
      placeholderText.setOrigin(0.5);
      this.container.add(placeholderText);
    }
  }

  /**
   * Создает заголовок карточки
   */
  private createTitle(): void {
    this.titleText = this.scene.add.text(
      0,
      this.cardHeight / 4 - 30,
      this.title,
      {
        ...this.getDefaultTextStyle(18),
        wordWrap: { width: this.cardWidth - 20 },
        align: 'center'
      }
    );
    this.titleText.setOrigin(0.5);
    this.container.add(this.titleText);
  }

  /**
   * Создает описание карточки
   */
  private createDescription(): void {
    if (!this.description) return;

    this.descriptionText = this.scene.add.text(
      0,
      this.cardHeight / 4 + 10,
      this.description,
      {
        fontSize: '14px',
        color: `#${this.colors.textLight.toString(16).padStart(6, '0')}`,
        wordWrap: { width: this.cardWidth - 30 },
        align: 'center'
      }
    );
    this.descriptionText.setOrigin(0.5);
    this.container.add(this.descriptionText);
  }

  /**
   * Создает рамку выделения
   */
  private createSelectionBorder(): void {
    this.selectionBorder = this.scene.add.rectangle(
      0, 
      0, 
      this.cardWidth + 6, 
      this.cardHeight + 6, 
      0x000000, 
      0
    );
    this.selectionBorder.setStrokeStyle(4, this.colors.accent);
    this.selectionBorder.setVisible(false);
    this.container.add(this.selectionBorder);
    
    // Размещаем рамку под другими элементами
    this.container.sendToBack(this.selectionBorder);
  }

  /**
   * Настраивает взаимодействие с карточкой
   */
  private setupInteraction(): void {
    if (!this.background) return;

    // Обработчики взаимодействия
    this.background.on('pointerover', () => {
      if (this.disabled) return;
      this.onHover();
    });

    this.background.on('pointerout', () => {
      if (this.disabled) return;
      this.onHoverOut();
    });

    this.background.on('pointerdown', () => {
      if (this.disabled) return;
      this.onPress();
    });

    this.background.on('pointerup', () => {
      if (this.disabled) return;
      this.onRelease();
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
        targets: this.container,
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 200,
        ease: 'Power2'
      });
    }

    // Увеличиваем яркость фона
    this.background.setFillStyle(this.colors.bgGlow, this.colors.bgGlowAlpha * 2);
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
        targets: this.container,
        scaleX: 1,
        scaleY: 1,
        duration: 200,
        ease: 'Power2'
      });
    }

    // Возвращаем обычную яркость
    this.background.setFillStyle(this.colors.bgGlow, this.colors.bgGlowAlpha);
  }

  /**
   * Обработчик нажатия
   */
  private onPress(): void {
    if (this.scene.tweens) {
      this.scene.tweens.add({
        targets: this.container,
        scaleX: 0.95,
        scaleY: 0.95,
        duration: 100,
        ease: 'Power2'
      });
    }
  }

  /**
   * Обработчик отпускания
   */
  private onRelease(): void {
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
   * Обработчик клика
   */
  private onClick(): void {
    try {
      if (this.callback) {
        this.callback(this.cardId);
      }
    } catch (error) {
      console.error('Error in card callback:', error);
    }
  }

  /**
   * Устанавливает состояние выбранной карточки
   */
  public setSelected(selected: boolean, animate: boolean = true): this {
    this.selected = selected;
    
    if (this.selectionBorder) {
      if (selected) {
        this.selectionBorder.setVisible(true);
        if (animate && this.scene.tweens) {
          this.createPulseEffect(this.selectionBorder, 0.7, 1, 1500);
        }
      } else {
        this.selectionBorder.setVisible(false);
        if (this.scene.tweens) {
          this.scene.tweens.killTweensOf(this.selectionBorder);
        }
      }
    }
    
    return this;
  }

  /**
   * Проверяет, выбрана ли карточка
   */
  public isSelected(): boolean {
    return this.selected;
  }

  /**
   * Устанавливает состояние отключенной карточки
   */
  public setDisabled(disabled: boolean): this {
    this.disabled = disabled;
    
    if (disabled) {
      this.container.setAlpha(0.5);
      this.background.disableInteractive();
      
      if (this.hoverTween) {
        this.hoverTween.stop();
      }
    } else {
      this.container.setAlpha(1);
      this.background.setInteractive({ useHandCursor: true });
    }
    
    return this;
  }

  /**
   * Проверяет, отключена ли карточка
   */
  public isDisabled(): boolean {
    return this.disabled;
  }

  /**
   * Устанавливает ID карточки
   */
  public setCardId(id: string): this {
    this.cardId = id;
    return this;
  }

  /**
   * Получает ID карточки
   */
  public getCardId(): string | undefined {
    return this.cardId;
  }

  /**
   * Устанавливает заголовок карточки
   */
  public setTitle(title: string): this {
    this.title = title;
    if (this.titleText) {
      this.titleText.setText(title);
    }
    return this;
  }

  /**
   * Получает заголовок карточки
   */
  public getTitle(): string {
    return this.title;
  }

  /**
   * Устанавливает описание карточки
   */
  public setDescription(description: string): this {
    this.description = description;
    if (this.descriptionText) {
      this.descriptionText.setText(description);
    } else if (description && this.showDescription) {
      this.createDescription();
    }
    return this;
  }

  /**
   * Получает описание карточки
   */
  public getDescription(): string {
    return this.description;
  }

  /**
   * Устанавливает новый callback
   */
  public setCallback(callback: CardCallback): this {
    this.callback = callback;
    return this;
  }

  /**
   * Программно выполняет клик по карточке
   */
  public click(): void {
    if (!this.disabled) {
      this.onClick();
    }
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

  /**
   * Переопределяем destroy для очистки ресурсов
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
