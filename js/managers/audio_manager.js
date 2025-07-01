/**
 * Singleton-менеджер для управления звуками в игре
 */
export class AudioManager {
    constructor() {
        // Объект для хранения звуков
        this.sounds = {};
        
        // Объект для хранения музыки
        this.music = {};
        
        // Настройки громкости
        this.musicVolume = 0.3;
        this.soundVolume = 0.8;
        
        // Флаги включения/выключения
        this.musicEnabled = true;
        this.soundEnabled = true;
        
        // Текущая играющая музыка
        this.currentMusic = null;
    }
    
    /**
     * Получение экземпляра синглтона
     * @returns {AudioManager} Экземпляр AudioManager
     */
    static getInstance() {
        if (!AudioManager.instance) {
            AudioManager.instance = new AudioManager();
        }
        return AudioManager.instance;
    }
    
    /**
     * Инициализация менеджера
     * @param {Phaser.Scene} scene - Сцена для доступа к системе звуков
     */
    init(scene) {
        this.scene = scene;
        
        // Загружаем настройки из localStorage
        this.loadSettings();
    }
    
    /**
     * Загрузка настроек из localStorage
     */
    loadSettings() {
        const musicEnabled = localStorage.getItem('musicEnabled');
        const soundEnabled = localStorage.getItem('soundEnabled');
        
        this.musicEnabled = musicEnabled === null ? true : (musicEnabled === 'true');
        this.soundEnabled = soundEnabled === null ? true : (soundEnabled === 'true');
    }
    
    /**
     * Сохранение настроек в localStorage
     */
    saveSettings() {
        localStorage.setItem('musicEnabled', this.musicEnabled);
        localStorage.setItem('soundEnabled', this.soundEnabled);
    }
    
    /**
     * Добавление звука
     * @param {string} key - Ключ звука
     * @param {string} audioKey - Ключ звука в кэше Phaser
     * @param {Object} config - Конфигурация звука
     */
    addSound(key, audioKey, config = {}) {
        if (!this.scene) {
            console.error('AudioManager не инициализирован. Вызовите init() перед использованием.');
            return;
        }
        
        try {
            const sound = this.scene.sound.add(audioKey, {
                volume: this.soundVolume,
                ...config
            });
            
            this.sounds[key] = sound;
        } catch (error) {
            console.error(`Ошибка при добавлении звука ${key}:`, error);
        }
    }
    
    /**
     * Добавление музыки
     * @param {string} key - Ключ музыки
     * @param {string} audioKey - Ключ музыки в кэше Phaser
     * @param {Object} config - Конфигурация музыки
     */
    addMusic(key, audioKey, config = {}) {
        if (!this.scene) {
            console.error('AudioManager не инициализирован. Вызовите init() перед использованием.');
            return;
        }
        
        try {
            const music = this.scene.sound.add(audioKey, {
                volume: this.musicVolume,
                loop: true,
                ...config
            });
            
            this.music[key] = music;
        } catch (error) {
            console.error(`Ошибка при добавлении музыки ${key}:`, error);
        }
    }
    
    /**
     * Воспроизведение звука
     * @param {string} key - Ключ звука
     */
    playSound(key) {
        if (!this.soundEnabled) return;
        
        const sound = this.sounds[key];
        if (sound) {
            try {
                sound.play();
            } catch (error) {
                console.error(`Ошибка при воспроизведении звука ${key}:`, error);
            }
        } else {
            console.warn(`Звук ${key} не найден`);
        }
    }
    
    /**
     * Воспроизведение музыки
     * @param {string} key - Ключ музыки
     * @param {boolean} stopCurrent - Остановить текущую музыку
     */
    playMusic(key, stopCurrent = true) {
        if (!this.musicEnabled) return;
        
        // Останавливаем текущую музыку, если нужно
        if (stopCurrent && this.currentMusic && this.music[this.currentMusic]) {
            this.music[this.currentMusic].stop();
        }
        
        const music = this.music[key];
        if (music) {
            try {
                music.play();
                this.currentMusic = key;
            } catch (error) {
                console.error(`Ошибка при воспроизведении музыки ${key}:`, error);
            }
        } else {
            console.warn(`Музыка ${key} не найдена`);
        }
    }
    
    /**
     * Остановка музыки
     * @param {string} key - Ключ музыки (если не указан, останавливается текущая)
     */
    stopMusic(key = null) {
        if (key) {
            const music = this.music[key];
            if (music) {
                music.stop();
                if (this.currentMusic === key) {
                    this.currentMusic = null;
                }
            }
        } else if (this.currentMusic) {
            const music = this.music[this.currentMusic];
            if (music) {
                music.stop();
            }
            this.currentMusic = null;
        }
    }
    
    /**
     * Пауза текущей музыки
     */
    pauseMusic() {
        if (this.currentMusic && this.music[this.currentMusic]) {
            try {
                this.music[this.currentMusic].pause();
            } catch (error) {
                console.error(`Ошибка при постановке на паузу музыки ${this.currentMusic}:`, error);
            }
        }
    }
    
    /**
     * Возобновление текущей музыки
     */
    resumeMusic() {
        if (this.currentMusic && this.music[this.currentMusic] && this.musicEnabled) {
            try {
                this.music[this.currentMusic].resume();
            } catch (error) {
                console.error(`Ошибка при возобновлении музыки ${this.currentMusic}:`, error);
            }
        }
    }
    
    /**
     * Получение текущей играющей музыки
     * @returns {string|null} Ключ текущей музыки
     */
    getCurrentMusic() {
        return this.currentMusic;
    }
    
    /**
     * Получение громкости музыки
     * @returns {number} Громкость музыки (0-1)
     */
    getMusicVolume() {
        return this.musicVolume;
    }
    
    /**
     * Получение громкости звуков
     * @returns {number} Громкость звуков (0-1)
     */
    getSoundVolume() {
        return this.soundVolume;
    }
    
    /**
     * Получение состояния музыки
     * @returns {boolean} Включена ли музыка
     */
    isMusicEnabled() {
        return this.musicEnabled;
    }
    
    /**
     * Получение состояния звуков
     * @returns {boolean} Включены ли звуки
     */
    isSoundEnabled() {
        return this.soundEnabled;
    }
    
    /**
     * Плавное появление музыки
     * @param {string} key - Ключ музыки
     * @param {number} duration - Длительность появления в мс
     */
    fadeInMusic(key, duration = 1000) {
        if (!this.musicEnabled) return;
        
        const music = this.music[key];
        if (music) {
            try {
                music.setVolume(0);
                music.play();
                this.currentMusic = key;
                
                // Плавно увеличиваем громкость
                this.scene.tweens.add({
                    targets: music,
                    volume: this.musicVolume,
                    duration: duration,
                    ease: 'Linear'
                });
            } catch (error) {
                console.error(`Ошибка при плавном появлении музыки ${key}:`, error);
            }
        }
    }
    
    /**
     * Плавное исчезание музыки
     * @param {number} duration - Длительность исчезания в мс
     */
    fadeOutMusic(duration = 1000) {
        if (this.currentMusic && this.music[this.currentMusic]) {
            const music = this.music[this.currentMusic];
            
            try {
                // Плавно уменьшаем громкость
                this.scene.tweens.add({
                    targets: music,
                    volume: 0,
                    duration: duration,
                    ease: 'Linear',
                    onComplete: () => {
                        music.stop();
                        this.currentMusic = null;
                    }
                });
            } catch (error) {
                console.error(`Ошибка при плавном исчезании музыки:`, error);
            }
        }
    }

    /**
     * Очистка ресурсов при уничтожении сцены
     */
    destroy() {
        // Останавливаем все звуки и музыку
        Object.values(this.sounds).forEach(sound => {
            sound.stop();
        });
        
        Object.values(this.music).forEach(music => {
            music.stop();
        });
        
        // Очищаем объекты
        this.sounds = {};
        this.music = {};
        this.currentMusic = null;
    }
}