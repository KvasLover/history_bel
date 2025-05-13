document.addEventListener('DOMContentLoaded', function() {

    // Меню
    const navToggle = document.querySelector('.nav-toggle');
    const mainNav = document.querySelector('#main-nav');

    if (navToggle && mainNav) {
        navToggle.addEventListener('click', () => {
            const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
            navToggle.setAttribute('aria-expanded', !isExpanded);
            mainNav.classList.toggle('nav--open');
        });
    }

    // Карусель
    const carousel = document.querySelector('.carousel');
    if (carousel) {
        const track = carousel.querySelector('.carousel-track');
        const slides = Array.from(track.children);
        const nextButton = carousel.querySelector('.carousel-button--next');
        const prevButton = carousel.querySelector('.carousel-button--prev');
        const indicatorsContainer = carousel.querySelector('.carousel-indicators');
        let currentIndex = 0;
        let autoPlayInterval = null;
        const autoPlayDelay = 5000;
        let slideWidth = 0; // Переменная для хранения актуальной ширины слайда в px

        if (slides.length > 0) {
            const setupCarouselDimensions = () => {
                // Получаем актуальную ширину видимой области карусели
                // ".carousel" является контейнером с overflow:hidden, его ширина - это видимая ширина.
                slideWidth = carousel.offsetWidth;

                // Устанавливаем ширину для каждого слайда
                slides.forEach(slide => {
                    slide.style.width = `${slideWidth}px`;
                });

                // Устанавливаем общую ширину трека, чтобы вместить все слайды в ряд
                if (track) { // Добавим проверку существования track
                    track.style.width = `${slideWidth * slides.length}px`;
                }


                // Обновляем позицию трека без анимации, если это resize
                // (чтобы не было "прыжка" с предыдущей процентной позиции)
                // Анимация будет при кликах/автопрокрутке
                updateSlidePosition(false); // Передаем false для отключения анимации при resize
            };

            const updateSlidePosition = (useTransition = true) => {
                if (track && slideWidth > 0) {
                    if (useTransition) {
                        track.style.transition = 'transform 0.5s ease-in-out';
                    } else {
                        track.style.transition = 'none'; // Отключаем анимацию для мгновенного обновления
                    }
                    track.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
                    // Восстанавливаем анимацию после мгновенного обновления (если она была отключена)
                    if (!useTransition) {
                        // Небольшая задержка, чтобы браузер успел применить 'none'
                        setTimeout(() => {
                            if (track) track.style.transition = 'transform 0.5s ease-in-out';
                        }, 50);
                    }
                }
            };

            const updateIndicators = () => {
                if (!indicatorsContainer) return;
                const currentIndicator = indicatorsContainer.querySelector('.active');
                if (currentIndicator) {
                    currentIndicator.classList.remove('active');
                }
                // Убедимся, что indicatorsContainer.children[currentIndex] существует
                if (indicatorsContainer.children && indicatorsContainer.children[currentIndex]) {
                    const newIndicator = indicatorsContainer.children[currentIndex];
                    newIndicator.classList.add('active');
                }
            };

            const moveToSlide = (index) => {
                if (slides.length === 0) return;

                if (index < 0) {
                    index = slides.length - 1;
                } else if (index >= slides.length) {
                    index = 0;
                }
                currentIndex = index;
                updateSlidePosition(); // Анимация по умолчанию включена
                updateIndicators();
                resetAutoPlay();
            };

            const startAutoPlay = () => {
                 if (slides.length <= 1) return;
                if (autoPlayInterval) clearInterval(autoPlayInterval);
                 autoPlayInterval = setInterval(() => {
                    moveToSlide(currentIndex + 1);
                }, autoPlayDelay);
            };

            const stopAutoPlay = () => {
                clearInterval(autoPlayInterval);
                autoPlayInterval = null;
            };

            const resetAutoPlay = () => {
                stopAutoPlay();
                startAutoPlay();
            };

            if (indicatorsContainer) {
                indicatorsContainer.innerHTML = ''; // Очищаем старые индикаторы
                slides.forEach((_, index) => {
                    const button = document.createElement('button');
                    button.classList.add('carousel-indicator');
                    button.setAttribute('aria-label', `Перейти к слайду ${index + 1}`);
                    if (index === 0) button.classList.add('active');
                    button.addEventListener('click', () => moveToSlide(index));
                    indicatorsContainer.appendChild(button);
                });
            } else {
                console.warn("Carousel indicators container not found.");
            }

            if (nextButton) {
                nextButton.addEventListener('click', () => moveToSlide(currentIndex + 1));
            } else {
                 console.warn("Carousel next button not found.");
            }
            if (prevButton) {
                prevButton.addEventListener('click', () => moveToSlide(currentIndex - 1));
            } else {
                console.warn("Carousel previous button not found.");
            }

            carousel.addEventListener('mouseenter', stopAutoPlay);
            carousel.addEventListener('mouseleave', startAutoPlay);
            carousel.addEventListener('focusin', stopAutoPlay);
            carousel.addEventListener('focusout', startAutoPlay);

            // Обработчик изменения размера окна
            let resizeTimeout;
            window.addEventListener('resize', () => {
                clearTimeout(resizeTimeout);
                // Debounce: ждем окончания изменения размера перед пересчетом
                resizeTimeout = setTimeout(() => {
                    setupCarouselDimensions();
                }, 250); // Задержка в мс
            });

            // Первоначальная настройка размеров и позиции
            setupCarouselDimensions(); // Сначала настраиваем размеры
            updateIndicators();      // Затем обновляем индикаторы
            startAutoPlay();         // И запускаем автопрокрутку

        } else {
             console.warn("No slides found in the carousel track.");
             if (nextButton) nextButton.style.display = 'none';
             if (prevButton) prevButton.style.display = 'none';
             if (indicatorsContainer) indicatorsContainer.style.display = 'none';
        }
    }


    const animatedElements = document.querySelectorAll('.animate-on-scroll');

    if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const delay = entry.target.dataset.animationDelay || '0';
                    entry.target.style.transitionDelay = `${delay}ms`;
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            rootMargin: '0px',
            threshold: 0.1
        });

        animatedElements.forEach(el => observer.observe(el));
    } else {
        animatedElements.forEach(el => el.classList.add('is-visible'));
    }


    // Цветовая тема
    const themeToggleButton = document.getElementById('theme-toggle-button');
    const body = document.body;

    const applyTheme = (theme) => {
        body.classList.remove('light-theme', 'dark-theme');
        const isLight = theme === 'light';

        if (isLight) {
            body.classList.add('light-theme');
        } else {
            body.classList.add('dark-theme');
        }

        if (themeToggleButton) {
            const nextThemeAction = isLight ? 'тёмную' : 'светлую';
            themeToggleButton.setAttribute('aria-label', `Переключить на ${nextThemeAction} тему`);
        }

    };

    const storedTheme = localStorage.getItem('theme');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)').matches; // Проверяем системную тему
    applyTheme(storedTheme || (prefersDarkScheme ? 'dark' : 'light')); // Приоритет localStorage, затем системная, затем светлая по умолчанию

    if (themeToggleButton) {
        themeToggleButton.addEventListener('click', () => {
            const currentTheme = body.classList.contains('light-theme') ? 'light' : 'dark';
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';

            applyTheme(newTheme);
            localStorage.setItem('theme', newTheme);
        });
    } else {
        console.warn("Theme toggle button not found.");
    }

});