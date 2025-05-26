// Утилита для масштабирования UI элементов в соответствии с размером игры
export const uiScaler = {
    // Базовые размеры игры из конфигурации
    baseWidth: 1920,
    baseHeight: 1080,
    
    /**
     * Инициализирует масштабирование UI
     */
    init() {
        // Обновляем масштаб сразу при загрузке
        this.updateScale();
        
        // Добавляем обработчик изменения размера окна
        window.addEventListener('resize', () => {
            this.updateScale();
        });
        
        // Добавляем обработчик для обновления при изменении ориентации устройства
        window.addEventListener('orientationchange', () => {
            this.updateScale();
        });
        
        console.log('UI Scaler initialized');
    },
    
    /**
     * Обновляет масштаб UI в соответствии с текущим размером игры
     */
    updateScale() {
        // Получаем canvas Phaser
        const canvas = document.querySelector('canvas');
        if (!canvas) return;
        
        // Получаем размеры canvas и его позицию
        const canvasRect = canvas.getBoundingClientRect();
        
        // Получаем текущие размеры canvas
        const currentWidth = canvasRect.width;
        const currentHeight = canvasRect.height;
        
        // Вычисляем коэффициент масштабирования
        const scaleX = currentWidth / this.baseWidth;
        const scaleY = currentHeight / this.baseHeight;
        
        // Используем минимальный коэффициент для сохранения пропорций
        const scale = Math.min(scaleX, scaleY);
        
        // Обновляем CSS переменную для масштабирования
        document.documentElement.style.setProperty('--ui-scale', scale);
        
        // Получаем UI контейнер
        const uiContainer = document.getElementById('ui-container');
        if (uiContainer) {
            // Позиционируем UI контейнер точно поверх canvas
            const gameContainer = document.getElementById('game-container');
            if (gameContainer) {
                const gameRect = gameContainer.getBoundingClientRect();
                
                // Рассчитываем центр canvas
                const canvasCenterX = canvasRect.left + canvasRect.width / 2;
                const canvasCenterY = canvasRect.top + canvasRect.height / 2;
                
                // Рассчитываем позицию для UI контейнера, чтобы он был центрирован относительно canvas
                const uiLeft = canvasCenterX - (this.baseWidth * scale) / 2;
                const uiTop = canvasCenterY - (this.baseHeight * scale) / 2;
                
                // Устанавливаем позицию UI контейнера
                uiContainer.style.position = 'fixed';
                uiContainer.style.left = `${uiLeft}px`;
                uiContainer.style.top = `${uiTop}px`;
                
                console.log(`UI positioned at: ${uiLeft}x${uiTop}, Scale: ${scale}`);
            }
        }
    }
};