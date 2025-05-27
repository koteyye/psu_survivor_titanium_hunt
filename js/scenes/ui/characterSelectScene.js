// Сцена выбора персонажа
import { CyberButton, CyberTitle, CyberCard } from '../../ui/index.js';

export class CharacterSelectScene extends Phaser.Scene {
    constructor() {
        super({ key: 'CharacterSelectScene' });
        this.uiElements = []; // Массив для хранения UI элементов
        this.selectedCharacter = null; // Выбранный персонаж
    }

    preload() {
        // Загружаем ресурсы для сцены выбора персонажа
        this.load.image('menuBackground', 'assets/ui/menu_background.png');
        
        // Загружаем изображения персонажей, если они еще не загружены
        if (!this.textures.exists('friender_s')) {
            this.load.image('friender_s', 'assets/characters/friender_s.png');
        }
        if (!this.textures.exists('trader')) {
            this.load.image('trader', 'assets/characters/trader.png');
        }
        if (!this.textures.exists('zummer')) {
            this.load.image('zummer', 'assets/characters/zummer.png');
        }
    }

    create() {
        // Добавляем фоновое изображение
        this.add.image(960, 540, 'menuBackground').setDisplaySize(1920, 1080);
        
        // Добавляем заголовок с использованием CyberTitle
        const title = new CyberTitle(
            this, 
            960, 
            150, 
            'Выбор персонажа', 
            { 
                fontSize: 64,
                glowIntensity: 1.5,
                pulseAnimation: true
            }
        );
        this.uiElements.push(title);
        
        // Данные о персонажах
        this.characters = [
            {
                id: 'friender_s',
                name: 'Товарищ С.',
                image: 'friender_s',
                description: 'Мрачный революционер мира блоков питания. Угрюмый, вечно недовольный, он видит в каждом PSU либо предателя, либо недостойного кандидата в «Великий Единый Блок». Его цель – очистить индустрию от ненадёжных, перегревающихся и шумных моделей, объединив всех под железной рукой эффективного энергоснабжения.\n\nСлоган: «Комиссар Качественного Напряжения – Борец с Конденсаторной Контрреволюцией – Диктатор Стабильных Ватт»\n\nОн не улыбается, не шутит и терпеть не может «буржуазные» блоки с RGB-подсветкой. Если ваш PSU не прошёл проверку Товарища С – готовьтесь к «перевоспитанию» молотком и паяльником.'
            },
            {
                id: 'trader',
                name: 'Кролик-Шнырь Облигац',
                image: 'trader',
                description: 'Аферист мира блоков питания. Хитрый, жадный и абсолютно беспринципный, он скупает любые PSU – хоть сгоревшие, хоть золотые – лишь бы на них можно было заработать. Его не волнует качество, энергоэффективность или стабильность – только курс, маржа и момент, когда можно сорвать куш.\n\nСлоган: «Спекулянт Ваттами – Акула Вторичного Рынка – Король Нагретых Сделок»\n\nОн не разбирает, не тестирует и не чинит – только сбывает по завышенной цене в самый "горячий" момент. Если рынок рухнет – он уже давно продал всё и сбежал с мешком золотых конденсаторов.'
            },
            {
                id: 'zummer',
                name: 'Вован - Алиэксперсс',
                image: 'zummer',
                description: 'Король бюджетных сборок и мастер спорных решений. Уверен, что все топовые блоки питания – заговор маркетологов, а настоящий кайф – это запихать в систему безымянный PSU за 500 рублей и гордо называть это «оптимизацией бюджета». Даже если блок трещит, воняет паленой пластмассой и вот-вот спалит квартиру, Вован будет доказывать, что «все норм, просто ты не умеешь их готовить».\n\nСлоган: «Гуру Китайских Ватт – Критик Дорогих Пылесосов – Герой Экономии (и Пожаров)»\n\nОн свято верит, что три дешёвых блока, соединённых скотчем, надёжнее одного Corsair, а все негативные отзывы – происки конкурентов. Его принцип: «Если не взорвалось сразу – значит, прошло QC».'
            }
        ];
        
        // Создаем карточки персонажей
        this.characterCards = [];
        const startX = 960 - ((this.characters.length - 1) * 250);
        
        this.characters.forEach((character, index) => {
            const x = startX + (index * 500);
            const y = 400;
            
            const card = new CyberCard(
                this,
                x,
                y,
                character.image,
                (card) => {
                    // Снимаем выделение со всех карточек
                    this.characterCards.forEach(c => c.setSelected(false));
                    
                    // Выделяем выбранную карточку
                    card.setSelected(true);
                    
                    // Добавляем дополнительное свечение вокруг выбранной карточки
                    this.updateCardGlow(card);
                    
                    // Запоминаем выбранного персонажа
                    this.selectedCharacter = character;
                    
                    // Обновляем описание
                    this.updateCharacterDescription(character);
                },
                {
                    width: 250,  // Уменьшаем ширину карточки
                    height: 320, // Уменьшаем высоту карточки
                    id: character.id
                }
            );
            
            // Добавляем имя персонажа под карточкой
            const nameText = this.add.text(x, y + 180, character.name, {
                fontSize: '24px',
                fontStyle: 'bold',
                fill: '#00ffff', // Делаем шрифт более ярким (голубой цвет)
                stroke: '#000000',
                strokeThickness: 3
            }).setOrigin(0.5);
            
            this.characterCards.push(card);
            this.uiElements.push(card);
        });
        
        // Создаем контейнер для описания персонажа (перемещаем ниже, чтобы не перекрывать имена)
        this.descriptionContainer = this.add.container(960, 750);
        
        // Фон для описания в стиле кнопок
        this.descriptionBackground = this.add.rectangle(
            0,
            0,
            1200,  // Ширина
            200,   // Высота
            0x0a1a2a,  // Темно-синий фон как у кнопок
            0.9
        );
        this.descriptionBackground.setStrokeStyle(3, 0x4a6fa5);  // Более толстая обводка как у кнопок
        this.descriptionContainer.add(this.descriptionBackground);
        
        // Добавляем эффект свечения для блока описания
        this.descriptionGlow = this.add.rectangle(
            0,
            0,
            1220,  // Немного больше чем фон
            220,   // Немного больше чем фон
            0x4a6fa5,
            0.3
        );
        this.descriptionGlow.setBlendMode(Phaser.BlendModes.ADD);
        this.descriptionContainer.add(this.descriptionGlow);
        
        // Добавляем эффект пульсации для свечения
        this.tweens.add({
            targets: this.descriptionGlow,
            alpha: { from: 0.2, to: 0.4 },
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        // Текст описания
        this.descriptionText = this.add.text(
            -580, // Смещаем влево для выравнивания по левому краю
            -90,  // Смещаем вверх, чтобы текст начинался сверху
            'Выберите персонажа, чтобы увидеть его описание',
            {
                fontSize: '22px',
                fill: '#4a6fa5',         // Тот же цвет, что и у кнопок
                wordWrap: { width: 1160 },
                align: 'left'            // Выравнивание по левому краю
            }
        );
        this.descriptionContainer.add(this.descriptionText);
        
        // Создаем зону для скролла текста
        this.descriptionMask = this.add.graphics();
        this.descriptionMask.fillRect(960 - 600, 750 - 100, 1200, 200);
        this.descriptionText.setMask(new Phaser.Display.Masks.GeometryMask(this, this.descriptionMask));
        
        // Добавляем интерактивную зону для скролла
        this.scrollZone = this.add.zone(960, 750, 1200, 200).setInteractive();
        
        // Обработчик для скролла мышью (перетаскивание)
        this.scrollZone.on('pointermove', (pointer) => {
            if (pointer.isDown) {
                // Скорость скролла
                const scrollSpeed = 2;
                // Вычисляем направление скролла
                const deltaY = pointer.position.y - pointer.prevPosition.y;
                // Перемещаем текст
                this.scrollText(deltaY * scrollSpeed);
            }
        });
        
        // Обработчик для колесика мыши и жестов тачпада
        this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY, deltaZ) => {
            // Проверяем, находится ли указатель над зоной скролла
            const bounds = this.scrollZone.getBounds();
            if (pointer.x >= bounds.left && pointer.x <= bounds.right &&
                pointer.y >= bounds.top && pointer.y <= bounds.bottom) {
                // Скорость скролла для колесика/тачпада
                const scrollSpeed = 0.5;
                // Перемещаем текст (инвертируем направление для естественного скролла)
                this.scrollText(-deltaY * scrollSpeed);
            }
        });
        
        // Добавляем кнопки скролла для дополнительного удобства
        const scrollUpButton = this.add.triangle(1140, 670, 0, 10, 10, 0, 20, 10, 0x4a6fa5);
        scrollUpButton.setInteractive({ useHandCursor: true });
        scrollUpButton.on('pointerdown', () => {
            this.scrollInterval = setInterval(() => {
                this.scrollText(5);
            }, 50);
        });
        scrollUpButton.on('pointerup', () => {
            clearInterval(this.scrollInterval);
        });
        scrollUpButton.on('pointerout', () => {
            clearInterval(this.scrollInterval);
        });
        
        const scrollDownButton = this.add.triangle(1140, 830, 0, 0, 10, 10, 20, 0, 0x4a6fa5);
        scrollDownButton.setInteractive({ useHandCursor: true });
        scrollDownButton.on('pointerdown', () => {
            this.scrollInterval = setInterval(() => {
                this.scrollText(-5);
            }, 50);
        });
        scrollDownButton.on('pointerup', () => {
            clearInterval(this.scrollInterval);
        });
        scrollDownButton.on('pointerout', () => {
            clearInterval(this.scrollInterval);
        });
        
        // Создаем кнопку "Выбрать" (перемещаем ниже из-за увеличения поля описания)
        const selectButton = new CyberButton(
            this,
            960,
            900,
            'Выбрать',
            () => {
                if (this.selectedCharacter) {
                    // Сохраняем выбранного персонажа в localStorage или другом хранилище
                    localStorage.setItem('selectedCharacter', this.selectedCharacter.id);
                    
                    // Останавливаем музыку меню перед переходом в игру (если нужно)
                    if (window.menuMusic && window.menuMusic.isPlaying) {
                        window.menuMusic.stop();
                    }
                    
                    // Переходим на сцену выбора уровня
                    this.scene.start('LevelSelectScene');
                } else {
                    // Если персонаж не выбран, показываем предупреждение
                    this.showWarning('Сначала выберите персонажа!');
                }
            },
            {
                width: 400,
                height: 80,
                fontSize: 32,
                pulseAnimation: true
            }
        );
        this.uiElements.push(selectButton);
        
        // Создаем кнопку "Назад" (перемещаем ниже из-за увеличения поля описания)
        const backButton = new CyberButton(
            this,
            960,
            980,
            'Назад',
            () => {
                // Переходим обратно в меню
                this.scene.start('MenuScene');
            },
            {
                width: 400,
                height: 80,
                fontSize: 32
            }
        );
        this.uiElements.push(backButton);
    }
    
    /**
     * Прокручивает текст описания
     * @param {number} deltaY - Величина прокрутки
     */
    scrollText(deltaY) {
        // Перемещаем текст
        this.descriptionText.y += deltaY;
        
        // Ограничиваем скролл, чтобы текст не выходил за пределы маски
        const textHeight = this.descriptionText.height;
        const maskHeight = 200;
        
        // Верхняя граница (не скроллить выше начала текста)
        if (this.descriptionText.y > -90) {
            this.descriptionText.y = -90;
        }
        
        // Нижняя граница (не скроллить ниже конца текста)
        // Добавляем дополнительный отступ в 40 пикселей, чтобы можно было доскролить до самого конца
        const minY = -90 - (textHeight - maskHeight + 40);
        
        // Проверяем, что текст достаточно длинный для скролла
        if (textHeight > maskHeight) {
            // Если текст слишком короткий, не даем скроллить ниже минимальной позиции
            if (this.descriptionText.y < minY) {
                this.descriptionText.y = minY;
            }
        } else {
            // Если текст помещается полностью, фиксируем его вверху
            this.descriptionText.y = -90;
        }
    }
    
    /**
     * Обновляет описание персонажа
     * @param {object} character - Объект с данными персонажа
     */
    updateCharacterDescription(character) {
        this.descriptionText.setText(character.description);
        
        // Сбрасываем позицию текста, чтобы описание начиналось сверху
        this.descriptionText.y = -90;
        
        // Проверяем, нужен ли скролл
        const textHeight = this.descriptionText.height;
        const maskHeight = 200;
        
        // Если текст не помещается в маску, показываем подсказку о скролле
        if (textHeight > maskHeight && !this.scrollHint) {
            this.scrollHint = this.add.text(
                960,
                850,
                "↕ Используйте мышь для прокрутки описания",
                {
                    fontSize: '16px',
                    fill: '#aaaaaa',
                    backgroundColor: '#222222',
                    padding: { x: 10, y: 5 }
                }
            ).setOrigin(0.5);
            
            // Анимация мигания подсказки
            this.tweens.add({
                targets: this.scrollHint,
                alpha: { from: 1, to: 0.5 },
                duration: 1000,
                yoyo: true,
                repeat: -1
            });
            
            // Скрываем подсказку через 5 секунд
            this.time.delayedCall(5000, () => {
                if (this.scrollHint) {
                    this.tweens.add({
                        targets: this.scrollHint,
                        alpha: 0,
                        duration: 500,
                        onComplete: () => {
                            if (this.scrollHint) {
                                this.scrollHint.destroy();
                                this.scrollHint = null;
                            }
                        }
                    });
                }
            });
        }
    }
    
    /**
     * Обновляет свечение вокруг выбранной карточки
     * @param {CyberCard} selectedCard - Выбранная карточка
     */
    updateCardGlow(selectedCard) {
        try {
            // Удаляем предыдущее свечение, если оно есть
            if (this.cardExtraGlow) {
                this.cardExtraGlow.destroy();
            }
            
            // Получаем позицию и размеры карточки безопасно
            const cardX = selectedCard.x || selectedCard.container.x;
            const cardY = selectedCard.y || selectedCard.container.y;
            const cardWidth = selectedCard.width || 250;  // Используем значение по умолчанию, если width не определено
            const cardHeight = selectedCard.height || 320; // Используем значение по умолчанию, если height не определено
            
            // Создаем новое свечение вокруг выбранной карточки
            this.cardExtraGlow = this.add.rectangle(
                cardX,
                cardY,
                cardWidth + 40,  // Делаем свечение больше карточки
                cardHeight + 40, // Делаем свечение больше карточки
                0x4a6fa5,        // Цвет свечения как у кнопок
                0.4              // Яркость свечения
            );
            this.cardExtraGlow.setBlendMode(Phaser.BlendModes.ADD);
            this.cardExtraGlow.setDepth(-1); // Помещаем свечение под карточку
            
            // Добавляем эффект пульсации для свечения
            this.tweens.add({
                targets: this.cardExtraGlow,
                alpha: { from: 0.3, to: 0.6 },
                duration: 1200,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        } catch (error) {
            console.error("Ошибка в updateCardGlow:", error);
        }
    }
    
    /**
     * Показывает предупреждение
     * @param {string} text - Текст предупреждения
     */
    showWarning(text) {
        // Создаем контейнер для предупреждения
        const warningContainer = this.add.container(960, 540);
        
        // Фон для предупреждения
        const warningBackground = this.add.rectangle(
            0,
            0,
            600,
            200,
            0x222222,
            0.9
        );
        warningBackground.setStrokeStyle(4, 0xff0000);
        warningContainer.add(warningBackground);
        
        // Текст предупреждения
        const warningText = this.add.text(
            0,
            0,
            text,
            {
                fontSize: '32px',
                fill: '#ffffff',
                align: 'center'
            }
        ).setOrigin(0.5);
        warningContainer.add(warningText);
        
        // Анимация появления
        this.tweens.add({
            targets: warningContainer,
            alpha: { from: 0, to: 1 },
            duration: 300,
            ease: 'Power2'
        });
        
        // Автоматически скрываем предупреждение через 2 секунды
        this.time.delayedCall(2000, () => {
            this.tweens.add({
                targets: warningContainer,
                alpha: 0,
                duration: 300,
                ease: 'Power2',
                onComplete: () => {
                    warningContainer.destroy();
                }
            });
        });
    }
    
    // Очищаем ресурсы при уничтожении сцены
    shutdown() {
        // Уничтожаем все UI элементы
        this.uiElements.forEach(element => {
            if (element && element.destroy) {
                element.destroy();
            }
        });
        this.uiElements = [];
    }
}