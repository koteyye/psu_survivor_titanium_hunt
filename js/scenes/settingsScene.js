// Сцена настроек
export class SettingsScene extends Phaser.Scene {
    constructor() {
        super({ key: 'SettingsScene' });
    }

    preload() {
        // Загружаем ресурсы для сцены настроек
        this.load.image('background', 'assets/background.jpeg');
        
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
        this.add.image(400, 300, 'background').setDisplaySize(800, 600);
        
        // Добавляем заголовок
        this.add.text(400, 100, 'Настройки', {
            fontSize: '36px',
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
        this.createToggle(400, 200, 'Музыка', musicEnabled, (enabled) => {
            localStorage.setItem('musicEnabled', enabled);
            // Применяем настройку сразу
            if (window.backgroundMusic) {
                if (enabled) {
                    if (!window.backgroundMusic.isPlaying) {
                        window.backgroundMusic.play();
                    }
                } else {
                    window.backgroundMusic.stop();
                }
            }
        });
        
        this.createToggle(400, 280, 'Звуки', soundEnabled, (enabled) => {
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
        this.createButton(400, 400, 'Назад', () => {
            this.scene.start('MenuScene');
        });
    }
    
    // Вспомогательная функция для создания кнопок
    createButton(x, y, text, callback) {
        // Создаем прямоугольник для кнопки
        const button = this.add.rectangle(x, y, 300, 60, 0x4a6fa5, 0.8);
        button.setStrokeStyle(2, 0xffffff);
        
        // Добавляем текст на кнопку
        const buttonText = this.add.text(x, y, text, {
            fontSize: '24px',
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
        const label = this.add.text(x - 100, y, text, {
            fontSize: '24px',
            fill: '#ffffff'
        }).setOrigin(0, 0.5);
        
        // Создаем переключатель
        // Если изображения для чекбоксов не загружены, используем простые прямоугольники
        let toggle;
        
        if (this.textures.exists('checkbox_on') && this.textures.exists('checkbox_off')) {
            toggle = this.add.image(x + 100, y, initialState ? 'checkbox_on' : 'checkbox_off');
            toggle.setScale(0.5);
        } else {
            // Создаем прямоугольник для переключателя
            toggle = this.add.rectangle(x + 100, y, 40, 40, initialState ? 0x00ff00 : 0xff0000, 0.8);
            toggle.setStrokeStyle(2, 0xffffff);
            
            // Добавляем текст внутри переключателя
            const toggleText = this.add.text(x + 100, y, initialState ? 'Вкл' : 'Выкл', {
                fontSize: '16px',
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
