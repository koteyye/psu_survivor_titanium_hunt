// Менеджер корзины
import { BaseUIElement } from './base_ui_element.js';

export class BasketManager extends BaseUIElement {
    constructor(scene, character) {
        super(scene, character);
        
        // UI элементы
        this.basketText = null;
        this.basketIcon = null;
        this.basketGlow = null;
        
        // Загружаем дополнительные конфигурации
        this.uiPositions = this.configManager.getConfig('characters/trader/ui_positions');
        this.animations = this.configManager.getConfig('characters/trader/animations');
    }
    
    // Создание UI корзины
    createBasketUI() {
        try {
            const basketConfig = this.uiPositions && this.uiPositions.basket 
                ? this.uiPositions.basket 
                : {
                    icon: { 
                        x: 250, 
                        y: 200, 
                        size: 48, 
                        glowSize: 54, 
                        glowAlpha: 0.5, 
                        glowColor: "0xffff00" 
                    },
                    text: { 
                        x: 300, 
                        y: 200, 
                        originX: 0, 
                        originY: 0.5 
                    }
                };
            
            // Создаем иконку корзины
            if (this.scene.textures.exists('basketIcon')) {
                const iconConfig = basketConfig.icon;
                
                this.basketIcon = this.scene.add.image(iconConfig.x, iconConfig.y, 'basketIcon');
                this.basketIcon.setDisplaySize(iconConfig.size, iconConfig.size);
                this.basketIcon.setOrigin(0.5);
                
                // Добавляем свечение для иконки
                this.basketGlow = this.scene.add.image(iconConfig.x, iconConfig.y, 'basketIcon');
                this.basketGlow.setDisplaySize(iconConfig.glowSize, iconConfig.glowSize);
                this.basketGlow.setTint(parseInt(iconConfig.glowColor, 16));
                this.basketGlow.setAlpha(iconConfig.glowAlpha);
                this.basketGlow.setBlendMode(Phaser.BlendModes.ADD);
                
                // Добавляем анимацию пульсации, если она настроена
                if (this.animations && this.animations.basketGlow) {
                    const glowAnim = this.animations.basketGlow;
                    this.scene.tweens.add({
                        targets: this.basketGlow,
                        alpha: { from: glowAnim.minAlpha, to: glowAnim.maxAlpha },
                        duration: glowAnim.pulseRate,
                        yoyo: true,
                        repeat: -1
                    });
                }
            } else {
                console.warn('Отсутствует текстура иконки корзины');
            }
            
            // Создаем текст для отображения значения корзины
            const textConfig = basketConfig.text;
            this.basketText = this.scene.add.text(
                textConfig.x,
                textConfig.y,
                `${this.character.basket}`,
                {
                    fontFamily: 'Orbitron',
                    fontSize: '24px',
                    fill: '#ffffff',
                    stroke: '#000000',
                    strokeThickness: 3
                }
            ).setOrigin(textConfig.originX, textConfig.originY);
            
            return {
                basketIcon: this.basketIcon,
                basketGlow: this.basketGlow,
                basketText: this.basketText
            };
        } catch (error) {
            console.error('Ошибка создания UI корзины:', error);
            return null;
        }
    }
    
    // Обновление текста корзины
    updateBasketText() {
        if (this.basketText) {
            this.basketText.setText(`${this.character.basket}`);
        }
    }
    
    // Очистка ресурсов
    destroy() {
        if (this.basketIcon) {
            this.basketIcon.destroy();
            this.basketIcon = null;
        }
        
        if (this.basketGlow) {
            this.basketGlow.destroy();
            this.basketGlow = null;
        }
        
        if (this.basketText) {
            this.basketText.destroy();
            this.basketText = null;
        }
    }
}

export default BasketManager;