// Утилиты для создания UI-элементов с использованием HTML и CSS-классов
export const uiUtils = {
    /**
     * Создает кнопку в киберпанк-стиле с использованием HTML и CSS
     * @param {Phaser.Scene} scene - Сцена, в которой создается кнопка
     * @param {number} x - Позиция по X
     * @param {number} y - Позиция по Y
     * @param {string} text - Текст кнопки
     * @param {function} callback - Функция, вызываемая при клике на кнопку
     * @param {object} options - Дополнительные опции (width, height, fontSize, etc.)
     * @returns {object} - Объект с элементами кнопки
     */
    createCyberButton(scene, x, y, text, callback, options = {}) {
        // Настройки по умолчанию
        const settings = {
            width: options.width || 400,
            height: options.height || 80,
            fontSize: options.fontSize || '28px',
            pulseAnimation: options.pulseAnimation !== false
        };
        
        // Создаем HTML-элемент кнопки
        const button = document.createElement('button');
        button.className = 'cyber-btn';
        if (settings.pulseAnimation) {
            button.classList.add('pulse');
        }
        button.textContent = text.toUpperCase();
        button.style.position = 'absolute';
        button.style.left = `${x - settings.width/2}px`;
        button.style.top = `${y - settings.height/2}px`;
        button.style.width = `${settings.width}px`;
        button.style.height = `${settings.height}px`;
        button.style.fontSize = settings.fontSize;
        
        // Добавляем обработчик клика
        button.addEventListener('click', callback);
        
        // Добавляем кнопку в DOM
        document.getElementById('ui-container').appendChild(button);
        
        // Создаем объект Phaser для отслеживания кнопки
        const buttonObj = scene.add.zone(x, y, settings.width, settings.height);
        buttonObj.setOrigin(0.5);
        buttonObj.setInteractive();
        
        // Добавляем методы для управления кнопкой
        return {
            element: button,
            zone: buttonObj,
            group: {
                getChildren() {
                    return [buttonObj];
                }
            },
            updateText(newText) {
                button.textContent = newText.toUpperCase();
            },
            setEnabled(enabled) {
                if (enabled) {
                    button.disabled = false;
                    button.classList.remove('disabled');
                } else {
                    button.disabled = true;
                    button.classList.add('disabled');
                }
            },
            destroy() {
                button.remove();
                buttonObj.destroy();
            }
        };
    },
    
    /**
     * Создает заголовок в неоновом стиле с использованием HTML и CSS
     * @param {Phaser.Scene} scene - Сцена, в которой создается заголовок
     * @param {number} x - Позиция по X
     * @param {number} y - Позиция по Y
     * @param {string} text - Текст заголовка
     * @param {object} options - Дополнительные опции (fontSize, etc.)
     * @returns {object} - Объект с элементами заголовка
     */
    createNeonTitle(scene, x, y, text, options = {}) {
        // Настройки по умолчанию
        const settings = {
            fontSize: options.fontSize || '64px',
            pulseAnimation: options.pulseAnimation !== false
        };
        
        // Создаем HTML-элемент заголовка
        const title = document.createElement('h1');
        title.className = 'neon-title';
        if (settings.pulseAnimation) {
            title.classList.add('pulse');
        }
        title.textContent = text;
        title.style.position = 'absolute';
        title.style.left = `${x}px`;
        title.style.top = `${y}px`;
        title.style.transform = 'translate(-50%, -50%)';
        title.style.fontSize = settings.fontSize;
        
        // Добавляем заголовок в DOM
        document.getElementById('ui-container').appendChild(title);
        
        // Создаем объект Phaser для отслеживания заголовка
        const titleObj = scene.add.zone(x, y, 1, 1);
        
        // Добавляем методы для управления заголовком
        return {
            text: {
                visible: true,
                set visible(value) {
                    title.style.display = value ? 'block' : 'none';
                },
                get visible() {
                    return title.style.display !== 'none';
                }
            },
            glow1: {
                visible: true,
                set visible(value) {
                    // Для совместимости с существующим кодом
                }
            },
            glow2: {
                visible: true,
                set visible(value) {
                    // Для совместимости с существующим кодом
                }
            },
            updateText(newText) {
                title.textContent = newText;
            },
            destroy() {
                title.remove();
                titleObj.destroy();
            }
        };
    },
    
    /**
     * Создает переключатель (toggle) в киберпанк-стиле с использованием HTML и CSS
     * @param {Phaser.Scene} scene - Сцена, в которой создается переключатель
     * @param {number} x - Позиция по X
     * @param {number} y - Позиция по Y
     * @param {string} text - Текст переключателя
     * @param {boolean} initialState - Начальное состояние переключателя
     * @param {function} callback - Функция, вызываемая при изменении состояния
     * @param {object} options - Дополнительные опции
     * @returns {object} - Объект с элементами переключателя
     */
    createCyberSwitch(scene, x, y, text, initialState, callback, options = {}) {
        // Настройки по умолчанию
        const settings = {
            width: options.width || 400,
            height: options.height || 40,
            fontSize: options.fontSize || '28px',
            pulseAnimation: options.pulseAnimation !== false
        };
        
        // Создаем контейнер для переключателя
        const container = document.createElement('div');
        container.className = 'cyber-switch';
        container.style.position = 'absolute';
        container.style.left = `${x - settings.width/2}px`;
        container.style.top = `${y - settings.height/2}px`;
        container.style.width = `${settings.width}px`;
        container.style.height = `${settings.height}px`;
        
        // Создаем текст для переключателя
        const label = document.createElement('span');
        label.textContent = text;
        label.style.fontSize = settings.fontSize;
        container.appendChild(label);
        
        // Создаем чекбокс
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = initialState;
        checkbox.style.display = 'none'; // Скрываем стандартный чекбокс
        container.appendChild(checkbox);
        
        // Создаем кастомный переключатель
        const toggle = document.createElement('div');
        toggle.className = 'cyber-icon';
        toggle.style.backgroundImage = `url('assets/ui/${initialState ? 'checkbox_on' : 'checkbox_off'}.png')`;
        container.appendChild(toggle);
        
        // Добавляем обработчик клика
        container.addEventListener('click', () => {
            checkbox.checked = !checkbox.checked;
            toggle.style.backgroundImage = `url('assets/ui/${checkbox.checked ? 'checkbox_on' : 'checkbox_off'}.png')`;
            callback(checkbox.checked);
        });
        
        // Добавляем переключатель в DOM
        document.getElementById('ui-container').appendChild(container);
        
        // Создаем объект Phaser для отслеживания переключателя
        const switchObj = scene.add.zone(x, y, settings.width, settings.height);
        switchObj.setOrigin(0.5);
        
        // Добавляем методы для управления переключателем
        return {
            group: {
                getChildren() {
                    return [switchObj];
                }
            },
            label,
            indicator: toggle,
            setState(state) {
                checkbox.checked = state;
                toggle.style.backgroundImage = `url('assets/ui/${state ? 'checkbox_on' : 'checkbox_off'}.png')`;
            },
            destroy() {
                container.remove();
                switchObj.destroy();
            }
        };
    },
    
    /**
     * Создает текст в киберпанк-стиле с использованием HTML и CSS
     * @param {Phaser.Scene} scene - Сцена, в которой создается текст
     * @param {number} x - Позиция по X
     * @param {number} y - Позиция по Y
     * @param {string} text - Текст
     * @param {object} options - Дополнительные опции (fontSize, etc.)
     * @returns {object} - Объект с элементами текста
     */
    createTechText(scene, x, y, text, options = {}) {
        // Настройки по умолчанию
        const settings = {
            fontSize: options.fontSize || '24px',
            width: options.width || 'auto',
            align: options.align || 'center',
            backgroundColor: options.backgroundColor || 'transparent'
        };
        
        // Создаем HTML-элемент текста
        const textElement = document.createElement('p');
        textElement.className = 'tech-text';
        textElement.textContent = text;
        textElement.style.position = 'absolute';
        textElement.style.left = `${x}px`;
        textElement.style.top = `${y}px`;
        textElement.style.transform = 'translate(-50%, -50%)';
        textElement.style.fontSize = settings.fontSize;
        textElement.style.width = settings.width;
        textElement.style.textAlign = settings.align;
        
        if (settings.backgroundColor !== 'transparent') {
            textElement.style.backgroundColor = settings.backgroundColor;
            textElement.style.padding = '8px 15px';
        }
        
        // Добавляем текст в DOM
        document.getElementById('ui-container').appendChild(textElement);
        
        // Создаем объект Phaser для отслеживания текста
        const textObj = scene.add.zone(x, y, 1, 1);
        
        // Добавляем методы для управления текстом
        return {
            element: textElement,
            zone: textObj,
            setText(newText) {
                textElement.textContent = newText;
            },
            setVisible(visible) {
                textElement.style.display = visible ? 'block' : 'none';
            },
            destroy() {
                textElement.remove();
                textObj.destroy();
            }
        };
    },
    
    /**
     * Очищает все HTML-элементы UI
     */
    clearUI() {
        const container = document.getElementById('ui-container');
        if (container) {
            container.innerHTML = '';
        }
    }
};