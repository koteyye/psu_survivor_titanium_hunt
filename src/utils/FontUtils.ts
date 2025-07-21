/**
 * Font utilities for consistent font loading and application across the game
 */

export interface FontConfig {
  family: string;
  fallback: string;
  loaded: boolean;
}

export class FontUtils {
  private static instance: FontUtils;
  private fonts: Map<string, FontConfig> = new Map();
  
  // Font constants
  public static readonly TITLE_FONT = 'CaslonAntique';
  public static readonly UI_FONT = 'CyberpunkRUS';
  public static readonly BUTTON_FONT = 'ButtonFonts';
  public static readonly REGULAR_FONT = 'Regular';
  
  private constructor() {
    this.initializeFonts();
  }
  
  public static getInstance(): FontUtils {
    if (!FontUtils.instance) {
      FontUtils.instance = new FontUtils();
    }
    return FontUtils.instance;
  }
  
  private initializeFonts(): void {
    // Initialize font configurations
    this.fonts.set(FontUtils.TITLE_FONT, {
      family: 'CaslonAntique',
      fallback: 'serif',
      loaded: false
    });
    
    this.fonts.set(FontUtils.UI_FONT, {
      family: 'CyberpunkRUS',
      fallback: 'Orbitron, sans-serif',
      loaded: false
    });
    
    this.fonts.set(FontUtils.BUTTON_FONT, {
      family: 'ButtonFonts',
      fallback: 'Arial, sans-serif',
      loaded: false
    });
    
    this.fonts.set(FontUtils.REGULAR_FONT, {
      family: 'Regular',
      fallback: 'monospace',
      loaded: false
    });
  }
  
  /**
   * Preload fonts in a Phaser scene using CSS font loading
   */
  public preloadFonts(scene: Phaser.Scene): void {
    console.log('FontUtils: Preloading fonts...');
    
    // Use web font loading approach for TTF files
    this.loadWebFonts(scene).then(() => {
      console.log('FontUtils: All fonts preloaded successfully');
    }).catch((error) => {
      console.warn('FontUtils: Font preloading failed, using fallbacks:', error);
    });
  }
  
  /**
   * Alternative font loading using CSS font loading API
   */
  public async loadWebFonts(scene: Phaser.Scene): Promise<void> {
    console.log('FontUtils: Loading web fonts...');
    
    try {
      // Load fonts using CSS Font Loading API
      const fontPromises = [
        this.loadWebFont('CaslonAntique', 'assets/fonts/Caslon Antique.ttf'),
        this.loadWebFont('CyberpunkRUS', 'assets/fonts/Cyberpunk_RUS_BY_LYAJKA.ttf'),
        this.loadWebFont('ButtonFonts', 'assets/fonts/TwilightC-Regular.ttf'),
        this.loadWebFont('Regular', 'assets/fonts/ShareTechMonoRegular.ttf')
      ];
      
      await Promise.allSettled(fontPromises);
      
      // Mark fonts as loaded after successful loading
      this.markFontAsLoaded(FontUtils.TITLE_FONT);
      this.markFontAsLoaded(FontUtils.UI_FONT);
      this.markFontAsLoaded(FontUtils.BUTTON_FONT);
      this.markFontAsLoaded(FontUtils.REGULAR_FONT);
      
      console.log('FontUtils: Web fonts loaded successfully');
    } catch (error) {
      console.warn('FontUtils: Error loading web fonts, using fallbacks:', error);
    }
  }
  
  private async loadWebFont(fontFamily: string, fontUrl: string): Promise<void> {
    try {
      // Method 1: Try using CSS @font-face injection
      await this.loadFontViaCSS(fontFamily, fontUrl);
      console.log(`FontUtils: Successfully loaded ${fontFamily} via CSS`);
    } catch (cssError) {
      console.warn(`FontUtils: CSS method failed for ${fontFamily}, trying FontFace API:`, cssError);
      
      try {
        // Method 2: Try FontFace API as fallback
        await this.loadFontViaFontFace(fontFamily, fontUrl);
        console.log(`FontUtils: Successfully loaded ${fontFamily} via FontFace API`);
      } catch (fontFaceError) {
        console.warn(`FontUtils: Both methods failed for ${fontFamily}:`, fontFaceError);
        throw fontFaceError;
      }
    }
  }

  private async loadFontViaCSS(fontFamily: string, fontUrl: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // Create a style element
      const style = document.createElement('style');
      style.textContent = `
        @font-face {
          font-family: '${fontFamily}';
          src: url('${fontUrl}') format('truetype');
          font-display: swap;
        }
      `;
      
      // Add to document head
      document.head.appendChild(style);
      
      // Test if font is loaded by measuring text width
      const testText = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      const testElement = document.createElement('div');
      testElement.style.fontFamily = `${fontFamily}, monospace`;
      testElement.style.fontSize = '72px';
      testElement.style.position = 'absolute';
      testElement.style.left = '-9999px';
      testElement.style.top = '-9999px';
      testElement.style.visibility = 'hidden';
      testElement.textContent = testText;
      
      document.body.appendChild(testElement);
      
      const fallbackWidth = testElement.offsetWidth;
      
      // Check periodically if font has loaded
      let attempts = 0;
      const maxAttempts = 50; // 5 seconds max
      
      const checkFont = () => {
        attempts++;
        testElement.style.fontFamily = `${fontFamily}, monospace`;
        const currentWidth = testElement.offsetWidth;
        
        if (currentWidth !== fallbackWidth || attempts >= maxAttempts) {
          document.body.removeChild(testElement);
          
          if (currentWidth !== fallbackWidth) {
            resolve();
          } else {
            reject(new Error(`Font ${fontFamily} failed to load within timeout`));
          }
        } else {
          setTimeout(checkFont, 100);
        }
      };
      
      // Start checking after a short delay
      setTimeout(checkFont, 100);
    });
  }

  private async loadFontViaFontFace(fontFamily: string, fontUrl: string): Promise<void> {
    // Properly encode URL for spaces and special characters
    const encodedUrl = fontUrl.replace(/ /g, '%20');
    
    // Create font face
    const fontFace = new FontFace(fontFamily, `url("${encodedUrl}")`);
    
    // Load the font
    const loadedFont = await fontFace.load();
    
    // Add to document fonts
    (document as any).fonts.add(loadedFont);
  }
  
  private markFontAsLoaded(fontKey: string): void {
    const font = this.fonts.get(fontKey);
    if (font) {
      font.loaded = true;
      console.log(`FontUtils: Font ${fontKey} marked as loaded`);
    }
  }
  
  /**
   * Get font family string with fallback
   */
  public getFontFamily(fontKey: string): string {
    const font = this.fonts.get(fontKey);
    if (!font) {
      console.warn(`FontUtils: Unknown font key ${fontKey}, using default fallback`);
      return 'Orbitron, sans-serif';
    }
    
    // Return font family with fallback
    if (font.loaded) {
      return `${font.family}, ${font.fallback}`;
    } else {
      console.warn(`FontUtils: Font ${fontKey} not loaded, using fallback`);
      return font.fallback;
    }
  }
  
  /**
   * Get title font family (Caslon Antique with fallback)
   */
  public getTitleFont(): string {
    return this.getFontFamily(FontUtils.TITLE_FONT);
  }
  
  /**
   * Get UI font family (Cyberpunk with fallback)
   */
  public getUIFont(): string {
    return this.getFontFamily(FontUtils.UI_FONT);
  }
  
  /**
   * Get button font family (ButtonFonts with fallback)
   */
  public getButtonFont(): string {
    return this.getFontFamily(FontUtils.BUTTON_FONT);
  }
  
  /**
   * Get regular font family (Regular with fallback)
   */
  public getRegularFont(): string {
    return this.getFontFamily(FontUtils.REGULAR_FONT);
  }
  
  /**
   * Check if a font is loaded
   */
  public isFontLoaded(fontKey: string): boolean {
    const font = this.fonts.get(fontKey);
    return font ? font.loaded : false;
  }
  
  /**
   * Check if all fonts are loaded
   */
  public areAllFontsLoaded(): boolean {
    return Array.from(this.fonts.values()).every(font => font.loaded);
  }
  
  /**
   * Get font loading status
   */
  public getFontLoadingStatus(): { [key: string]: boolean } {
    const status: { [key: string]: boolean } = {};
    this.fonts.forEach((font, key) => {
      status[key] = font.loaded;
    });
    return status;
  }
}