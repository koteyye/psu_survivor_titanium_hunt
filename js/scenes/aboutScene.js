// Сцена "Об игре"
export class AboutScene extends Phaser.Scene {
    constructor() {
        super({ key: 'AboutScene' });
    }

    preload() {
        // Загружаем ресурсы для сцены "Об игре"
        this.load.image('menuBackground', 'assets/menu_background.png');
    }

    create() {
        // Добавляем фоновое изображение
        this.add.image(960, 540, 'menuBackground').setDisplaySize(1920, 1080);
        
        // Добавляем заголовок
        this.add.text(960, 200, 'Об игре', {
            fontSize: '64px',
            fontStyle: 'bold',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5);
        
        // Получаем версию игры из тега
        this.getGameVersion().then(version => {
            // Добавляем информацию об игре
            const gameInfo = [
                'PSU Survivor: Titanium Hunt - это игра, в которой вам предстоит',
                'собирать хорошие блоки питания и избегать плохих.',
                'Особо ценными являются блоки питания с титановыми конденсаторами,',
                'которые восстанавливают здоровье и дают больше очков.',
                '',
                'Автор: Koteyye',
                `Версия: ${version}`
            ];
            
            // Отображаем информацию
            const textY = 320;
            const lineHeight = 40;
            
            gameInfo.forEach((line, index) => {
                this.add.text(960, textY + index * lineHeight, line, {
                    fontSize: '32px',
                    fill: '#ffffff',
                    align: 'center'
                }).setOrigin(0.5);
            });
        });
        
        // Создаем кнопку "Назад"
        this.createButton(960, 700, 'Назад', () => {
            // Останавливаем музыку меню перед переходом обратно в меню
            // (она будет запущена заново в MenuScene)
            if (window.menuMusic && window.menuMusic.isPlaying) {
                window.menuMusic.stop();
            }
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
    
    // Функция для получения версии игры из тега GitHub
    async getGameVersion() {
        try {
            // Сначала проверяем кэшированную версию
            let version = localStorage.getItem('gameVersion');
            const cacheTime = localStorage.getItem('gameVersionCacheTime');
            const now = Date.now();
            
            // Если кэш устарел (более 1 часа) или отсутствует, получаем новую версию
            if (!version || !cacheTime || (now - parseInt(cacheTime)) > 3600000) {
                try {
                    // Получаем информацию о тегах из GitHub API
                    const response = await fetch('https://api.github.com/repos/koteyye/psu_survivor_titanium_hunt/tags');
                    
                    if (response.ok) {
                        const tags = await response.json();
                        
                        // Если есть теги, берем самый последний (первый в списке)
                        if (tags && tags.length > 0) {
                            version = tags[0].name;
                            
                            // Кэшируем версию и время кэширования
                            localStorage.setItem('gameVersion', version);
                            localStorage.setItem('gameVersionCacheTime', now.toString());
                        } else {
                            // Если теги не найдены, используем значение по умолчанию
                            version = 'v1.0.1';
                        }
                    } else {
                        // Если запрос не удался, используем значение по умолчанию
                        version = 'v1.0.1';
                    }
                } catch (error) {
                    console.error('Ошибка при получении версии из GitHub:', error);
                    // В случае ошибки используем значение по умолчанию
                    version = 'v1.0.1';
                }
            }
            
            return version;
        } catch (error) {
            console.error('Ошибка при получении версии игры:', error);
            return 'v1.0.1'; // Значение по умолчанию в случае ошибки
        }
    }
}
