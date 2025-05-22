// Сцена настроек
export class SettingsScene extends Phaser.Scene {
    constructor() {
        super({ key: 'SettingsScene' });
    }

    preload() {
        // Загружаем ресурсы для сцены настроек
        this.load.image('menuBackground', 'assets/ui/menu_background.png');
        
        // Загружаем изображения для переключателей
        // Если изображения не существуют, будут использованы прямоугольники
        try {
            this.load.image('checkbox_on', 'assets/ui/checkbox_on.png');
            this.load.image('checkbox_off', 'assets/ui/checkbox_off.png');
        } catch (e) {
            console.warn('Изображения чекбоксов не найдены, будут использованы прямоугольники');
        }
    }

    create() {
        // Добавляем фоновое изображение
        this.add.image(960, 540, 'menuBackground').setDisplaySize(1920, 1080);
        
        // Добавляем заголовок
        this.add.text(960, 200, 'Настройки', {
            fontSize: '64px',
            fontStyle: 'bold',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5);
        
        // Получаем текущие настройки из localStorage
        // По умолчанию настройки включены (установлено в game.js)
        const musicEnabled = localStorage.getItem('musicEnabled') === 'true';
        const soundEnabled = localStorage.getItem('soundEnabled') === 'true';
        
        // Создаем переключатели настроек
        this.createToggle(960, 350, 'Музыка', musicEnabled, (enabled) => {
            localStorage.setItem('musicEnabled', enabled);
            // Применяем настройку сразу
            // Для музыки игры
            if (window.backgroundMusic) {
                if (enabled) {
                    if (!window.backgroundMusic.isPlaying && this.scene.key === 'MainScene') {
                        window.backgroundMusic.play();
                    }
                } else {
                    window.backgroundMusic.stop();
                }
            }
            
            // Для музыки меню
            if (window.menuMusic) {
                if (enabled) {
                    if (!window.menuMusic.isPlaying && this.scene.key === 'MenuScene') {
                        window.menuMusic.play();
                    }
                } else {
                    window.menuMusic.stop();
                }
            }
        });
        
        this.createToggle(960, 450, 'Звуки', soundEnabled, (enabled) => {
            localStorage.setItem('soundEnabled', enabled);
            // Настройка будет применена при следующем воспроизведении звука
            // Если звуки выключены, останавливаем все текущие звуковые эффекты
            if (!enabled) {
                if (window.explosionSound) {
                    window.explosionSound.stop();
                }
                if (window.nyamnyamSound) {
                    window.nyamnyamSound.stop();
                }
            }
        });
        
        // Создаем кнопку "Назад"
        this.createButton(960, 600, 'Назад', () => {
            // Переходим обратно в меню БЕЗ остановки музыки
            this.scene.start('MenuScene');
        });
    }
    
    // Вспомогательная функция для создания кнопок
    createButton(x, y, text, callback) {
        // Создаем прямоугольник для кнопки
        const button = this.add.rectangle(x, y, 400, 80, 0x4a6fa5, 0.8);
        button.setStrokeStyle(2, 0xffffff);
        
        // Добавляем текст на кнопку
        const buttonText = this.add.text(x, y, text, {
            fontSize: '32px',
            fill: '#ffffff'
        }).setOrigin(0.5);
        
        // Делаем кнопку интерактивной
        button.setInteractive();
        
        // Добавляем эффекты при наведении и клике
        button.on('pointerover', () => {
            button.fillColor = 0x5a8ac5;
            buttonText.setStyle({ fill: '#ffffff' });
        });
        
        button.on('pointerout', () => {
            button.fillColor = 0x4a6fa5;
            buttonText.setStyle({ fill: '#ffffff' });
        });
        
        button.on('pointerdown', () => {
            button.fillColor = 0x3a5f95;
            buttonText.setStyle({ fill: '#cccccc' });
        });
        
        button.on('pointerup', () => {
            button.fillColor = 0x5a8ac5;
            buttonText.setStyle({ fill: '#ffffff' });
            callback();
        });
        
        return { button, text: buttonText };
    }
    
    // Функция для создания переключателя (toggle)
    createToggle(x, y, text, initialState, callback) {
        // Создаем текст для настройки
        const label = this.add.text(x - 150, y, text, {
            fontSize: '32px',
            fill: '#ffffff'
        }).setOrigin(0, 0.5);
        
        // Создаем переключатель
        // Если изображения для чекбоксов не загружены, используем простые прямоугольники
        let toggle;
        
        if (this.textures.exists('checkbox_on') && this.textures.exists('checkbox_off')) {
            toggle = this.add.image(x + 150, y, initialState ? 'checkbox_on' : 'checkbox_off');
            toggle.setScale(0.8);
        } else {
            // Создаем прямоугольник для переключателя
            toggle = this.add.rectangle(x + 150, y, 60, 60, initialState ? 0x00ff00 : 0xff0000, 0.8);
            toggle.setStrokeStyle(2, 0xffffff);
            
            // Добавляем текст внутри переключателя
            const toggleText = this.add.text(x + 150, y, initialState ? 'Вкл' : 'Выкл', {
                fontSize: '24px',
                fill: '#ffffff'
            }).setOrigin(0.5);
            
            // Сохраняем ссылку на текст в переключателе
            toggle.text = toggleText;
        }
        
        // Сохраняем текущее состояние
        toggle.state = initialState;
        
        // Делаем переключатель интерактивным
        toggle.setInteractive();
        
        // Добавляем обработчик клика
        toggle.on('pointerup', () => {
            // Инвертируем состояние
            toggle.state = !toggle.state;
            
            // Обновляем внешний вид
            if (this.textures.exists('checkbox_on') && this.textures.exists('checkbox_off')) {
                toggle.setTexture(toggle.state ? 'checkbox_on' : 'checkbox_off');
            } else {
                toggle.fillColor = toggle.state ? 0x00ff00 : 0xff0000;
                if (toggle.text) {
                    toggle.text.setText(toggle.state ? 'Вкл' : 'Выкл');
                }
            }
            
            // Вызываем callback с новым состоянием
            callback(toggle.state);
        });
        
        return { label, toggle };
    }
}