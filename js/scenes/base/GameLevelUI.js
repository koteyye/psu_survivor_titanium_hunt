// Функции для создания UI элементов игрового уровня с использованием новых UI классов
import { CyberButton, CyberBar, CyberTitle } from '../../ui/index.js';

// Создание UI элементов для игрового уровня
export function createGameUI(scene, options = {}) {
    // Настройки по умолчанию
    const settings = {
        showHealthBar: true,
        showMoneyBar: false,
        showRageBar: false,
        ...options
    };
    
    // Массив для хранения UI элементов
    scene.uiElements = scene.uiElements || [];
    
    // Создание иконки очков (выровнена с иконкой здоровья)
    const scoreIcon = scene.add.image(25, 40, 'scoreIcon');
    scoreIcon.setOrigin(0, 0.5);
    scoreIcon.setDisplaySize(48, 48); // Увеличенный размер иконки
    
    // Создание текста для очков (только значение, без слова "Очки")
    scene.scoreText = scene.add.text(100, 40, window.score.toString(), { 
        fontFamily: 'Orbitron',
        fontSize: '36px', 
        fill: '#fff',
        stroke: '#000',
        strokeThickness: 4
    });
    scene.scoreText.setOrigin(0, 0.5);
    
    // Создание шкалы здоровья, если она включена (ниже очков)
    if (settings.showHealthBar) {
        const healthBar = new CyberBar(
            scene,
            300,
            100, // Изменено с 50 на 100, чтобы было ниже очков
            window.health,
            {
                width: 400,
                height: 30,
                iconKey: 'healthIcon',
                barColor: 0xff2222,
                showValue: false // Убираем значение %
            }
        );
        scene.healthBar = healthBar;
        scene.uiElements.push(healthBar);
    }
    
    // Создание шкалы денег, если она включена (для будущего функционала)
    if (settings.showMoneyBar) {
        const moneyBar = new CyberBar(
            scene,
            300,
            150, // Изменено с 100 на 150
            0, // Начальное значение
            {
                width: 400,
                height: 30,
                iconKey: 'moneyIcon',
                barColor: 0x00ffff,
                showValue: false // Убираем значение %
            }
        );
        scene.moneyBar = moneyBar;
        scene.uiElements.push(moneyBar);
    }
    
    // Создание шкалы ярости, если она включена (для будущего функционала)
    if (settings.showRageBar) {
        const rageBar = new CyberBar(
            scene,
            300,
            200, // Изменено с 150 на 200
            0, // Начальное значение
            {
                width: 400,
                height: 30,
                iconKey: 'rageIcon',
                barColor: 0xff6600,
                showValue: false // Убираем значение %
            }
        );
        scene.rageBar = rageBar;
        scene.uiElements.push(rageBar);
    }
    
    // Создание текста для игры окончена
    const gameOverTitle = new CyberTitle(
        scene,
        960,
        540,
        'ИГРА ОКОНЧЕНА',
        {
            fontSize: 96,
            color: 0xff0000,
            glowIntensity: 2,
            pulseAnimation: true
        }
    );
    gameOverTitle.setVisible(false);
    scene.gameOverTitle = gameOverTitle;
    scene.uiElements.push(gameOverTitle);
    
    // Создание текста для перезапуска игры (как подсказка, а не кнопка)
    const restartText = new CyberTitle(
        scene,
        960,
        660,
        'Нажмите ПРОБЕЛ для новой игры',
        {
            fontSize: 42,
            color: 0xffffff,
            glowIntensity: 1,
            pulseAnimation: true
        }
    );
    restartText.setVisible(false);
    scene.restartText = restartText;
    scene.uiElements.push(restartText);
    
    // Создание текста для паузы
    const pauseTitle = new CyberTitle(
        scene,
        960,
        540,
        'ПАУЗА',
        {
            fontSize: 96,
            color: 0xffffff,
            glowIntensity: 1.5
        }
    );
    pauseTitle.setVisible(false);
    scene.pauseTitle = pauseTitle;
    scene.uiElements.push(pauseTitle);
    
    // Создание текста с подсказкой для продолжения игры
    const resumeText = new CyberTitle(
        scene,
        960,
        660,
        'Нажмите P для продолжения',
        {
            fontSize: 42,
            color: 0xffffff,
            glowIntensity: 1
        }
    );
    resumeText.setVisible(false);
    scene.resumeText = resumeText;
    scene.uiElements.push(resumeText);
    
    // Создание кнопки возврата в меню
    const menuButton = new CyberButton(
        scene,
        1820,
        60,
        'Меню',
        () => {
            // Останавливаем музыку перед переходом в меню
            if (window.backgroundMusic && window.backgroundMusic.isPlaying) {
                window.backgroundMusic.stop();
            }
            
            // Переходим в меню
            scene.scene.start('MenuScene');
        },
        {
            width: 150,
            height: 70,
            fontSize: 32
        }
    );
    scene.menuButton = menuButton;
    scene.uiElements.push(menuButton);
    
    // Создание текста с подсказками по управлению в киберпанк-стиле
    const controlsText = new CyberTitle(
        scene,
        960,
        1020, // Размещаем внизу экрана
        'Управление: ← → - движение, P - пауза, R - перезапуск, M - меню',
        {
            fontSize: 24,
            fontFamily: 'Orbitron, sans-serif',
            color: '#00f7ff',
            glowIntensity: 1,
            backgroundColor: '#0a0f1c80', // Полупрозрачный фон
            padding: { x: 20, y: 10 }
        }
    );
    scene.uiElements.push(controlsText);
    
    // Скрываем подсказку через 5 секунд
    scene.time.delayedCall(5000, () => {
        controlsText.setVisible(false);
    });
    
    return {
        scoreText: scene.scoreText,
        scoreIcon: scoreIcon,
        healthBar: scene.healthBar,
        moneyBar: scene.moneyBar,
        rageBar: scene.rageBar,
        gameOverTitle,
        restartText,
        pauseTitle,
        resumeText,
        menuButton
    };
}

// Обновление UI элементов
export function updateGameUI(scene) {
    // Обновляем текст очков (только значение, без слова "Очки")
    if (scene.scoreText) {
        scene.scoreText.setText(window.score.toString());
    }
    
    // Обновляем шкалу здоровья, если она есть
    if (scene.healthBar) {
        scene.healthBar.setValue(window.health);
    }
    
    // Обновляем шкалу денег, если она есть (для будущего функционала)
    if (scene.moneyBar && window.money !== undefined) {
        scene.moneyBar.setValue(window.money);
    }
    
    // Обновляем шкалу ярости, если она есть (для будущего функционала)
    if (scene.rageBar && window.rage !== undefined) {
        scene.rageBar.setValue(window.rage);
    }
}

// Показать UI для завершения уровня
export function showLevelCompletedUI(scene) {
    // Создаем заголовок "Уровень пройден"
    const levelCompletedTitle = new CyberTitle(
        scene,
        960,
        400,
        'УРОВЕНЬ ПРОЙДЕН!',
        {
            fontSize: 96,
            color: 0x00ff00,
            glowIntensity: 2,
            pulseAnimation: true
        }
    );
    levelCompletedTitle.setVisible(false); // Изначально скрыт
    scene.levelCompletedTitle = levelCompletedTitle;
    scene.uiElements.push(levelCompletedTitle);
    
    // Создаем текст для перехода на следующий уровень (как подсказка, а не кнопка)
    const nextLevelText = new CyberTitle(
        scene,
        960,
        550,
        'Нажмите ПРОБЕЛ для следующего уровня',
        {
            fontSize: 42,
            color: 0xffffff,
            glowIntensity: 1,
            pulseAnimation: true
        }
    );
    nextLevelText.setVisible(false); // Изначально скрыт
    scene.nextLevelText = nextLevelText;
    scene.uiElements.push(nextLevelText);
    
    return {
        levelCompletedTitle,
        nextLevelButton: nextLevelText // Для совместимости оставляем старое имя
    };
}

// Показать UI для игры окончена
export function showGameOverUI(scene) {
    // Сначала проверяем, что элементы существуют
    if (!scene.gameOverTitle || !scene.restartText) {
        console.error('Элементы Game Over не найдены!');
        return;
    }
    
    // Скрываем все другие UI элементы, которые могут мешать
    if (scene.pauseTitle) scene.pauseTitle.setVisible(false);
    if (scene.resumeText) scene.resumeText.setVisible(false);
    if (scene.levelCompletedTitle) scene.levelCompletedTitle.setVisible(false);
    if (scene.nextLevelText) scene.nextLevelText.setVisible(false);
    
    // Показываем элементы Game Over
    scene.gameOverTitle.setVisible(true);
    scene.restartText.setVisible(true);
    
    // Добавляем логирование для отладки
    console.log('Показаны элементы Game Over');
}

// Показать UI для паузы
export function showPauseUI(scene, isPaused) {
    if (scene.pauseTitle) {
        scene.pauseTitle.setVisible(isPaused);
    }
    
    if (scene.resumeText) {
        scene.resumeText.setVisible(isPaused);
    }
}

// Очистить все UI элементы
export function clearGameUI(scene) {
    if (scene.uiElements) {
        scene.uiElements.forEach(element => {
            if (element && element.destroy) {
                element.destroy();
            }
        });
        scene.uiElements = [];
    }
    
    // Очищаем текстовые элементы, которые не в массиве uiElements
    if (scene.scoreText) scene.scoreText.destroy();
    if (scene.scoreIcon) scene.scoreIcon.destroy();
}