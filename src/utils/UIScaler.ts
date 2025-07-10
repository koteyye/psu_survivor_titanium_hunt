interface ScaleConfig {
  baseWidth: number;
  baseHeight: number;
  minScale: number;
  maxScale: number;
}

export class UIScaler {
  private static config: ScaleConfig = {
    baseWidth: 1920,
    baseHeight: 1080,
    minScale: 0.5,
    maxScale: 2.0
  };

  private static listeners: Set<() => void> = new Set();

  public static init(): void {
    window.addEventListener('resize', () => {
      this.handleResize();
    });

    window.addEventListener('orientationchange', () => {
      setTimeout(() => this.handleResize(), 100);
    });

    console.log('UI Scaler initialized');
  }

  private static handleResize(): void {
    this.notifyListeners();
  }

  public static addResizeListener(callback: () => void): void {
    this.listeners.add(callback);
  }

  public static removeResizeListener(callback: () => void): void {
    this.listeners.delete(callback);
  }

  private static notifyListeners(): void {
    this.listeners.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('Error in resize listener:', error);
      }
    });
  }

  public static getScale(): number {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    const scaleX = windowWidth / this.config.baseWidth;
    const scaleY = windowHeight / this.config.baseHeight;
    
    const scale = Math.min(scaleX, scaleY);
    
    return Math.max(this.config.minScale, Math.min(this.config.maxScale, scale));
  }

  public static getScaledDimensions(): { width: number; height: number } {
    const scale = this.getScale();
    
    return {
      width: this.config.baseWidth * scale,
      height: this.config.baseHeight * scale
    };
  }

  public static getUIPosition(x: number, y: number): { x: number; y: number } {
    const scale = this.getScale();
    const dimensions = this.getScaledDimensions();
    
    const offsetX = (window.innerWidth - dimensions.width) / 2;
    const offsetY = (window.innerHeight - dimensions.height) / 2;
    
    return {
      x: offsetX + (x * scale),
      y: offsetY + (y * scale)
    };
  }

  public static scaleUIElement(element: any, baseSize: number): number {
    const scale = this.getScale();
    return baseSize * scale;
  }

  public static isLandscape(): boolean {
    return window.innerWidth > window.innerHeight;
  }

  public static isMobile(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  public static setConfig(config: Partial<ScaleConfig>): void {
    this.config = { ...this.config, ...config };
  }

  public static getViewportInfo(): {
    scale: number;
    dimensions: { width: number; height: number };
    offset: { x: number; y: number };
    isMobile: boolean;
    isLandscape: boolean;
  } {
    const scale = this.getScale();
    const dimensions = this.getScaledDimensions();
    
    return {
      scale,
      dimensions,
      offset: {
        x: (window.innerWidth - dimensions.width) / 2,
        y: (window.innerHeight - dimensions.height) / 2
      },
      isMobile: this.isMobile(),
      isLandscape: this.isLandscape()
    };
  }
}
