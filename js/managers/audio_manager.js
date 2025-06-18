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
     * Включение/выключение музыки
     * @param {boolean} enabled - Включена ли музыка
     */
    setMusicEnabled(enabled) {
        this.musicEnabled = enabled;
        
        // Если музыка выключена, останавливаем текущую музыку
        if (!enabled && this.currentMusic) {
            this.stopMusic();
        } else if (enabled && this.currentMusic) {
            // Если музыка включена, возобновляем текущую музыку
            this.playMusic(this.currentMusic, false);
        }
        
        // Сохраняем настройки
        this.saveSettings();
    }
    
    /**
     * Включение/выключение звуков
     * @param {boolean} enabled - Включены ли звуки
     */
    setSoundEnabled(enabled) {
        this.soundEnabled = enabled;
        
        // Сохраняем настройки
        this.saveSettings();
    }
    
    /**
     * Установка громкости музыки
     * @param {number} volume - Громкость (0-1)
     */
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        
        // Обновляем громкость текущей музыки
        Object.values(this.music).forEach(music => {
            music.setVolume(this.musicVolume);
        });
    }
    
    /**
     * Установка громкости звуков
     * @param {number} volume - Громкость (0-1)
     */
    setSoundVolume(volume) {
        this.soundVolume = Math.max(0, Math.min(1, volume));
        
        // Обновляем громкость всех звуков
        Object.values(this.sounds).forEach(sound => {
            sound.setVolume(this.soundVolume);
        });
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