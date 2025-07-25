


export class Slider {
  // Конструктор класса Slider, принимает объект mediaQueries 
  constructor(mediaQueries) {
    this.mediaQueries = mediaQueries; // Медиа-запросы для определения количества видимых слайдов
  }

  // Метод инициализации слайдера, принимает объект с параметрами
  initSlider({ btnNext = null, btnPrev = null, slider, item, itemLength }) {
    this.flagDragDropMouse = false; // Флаг dragDrop для desktop
    this.flagDragDropTouch = false; // Флаг dragDrop для touch устройств

    this.windowWidth = document.documentElement.clientWidth; // Ширина окна

    this.elemItem = item; // Один элемент слайдера
    this.elemBtnNext = btnNext; // Кнопка для перехода к следующему слайду
    this.elemBtnPrev = btnPrev; // Кнопка для перехода к предыдущему слайду
    this.elemSlider = slider; // Сам слайдер

    this.stepNumber = 1; // Текущий шаг
    this.position = 0; // Начальная позиция слайдера
    this.sliderLength = itemLength; // Количество элементов item слайдера
    this.visibleSlides = this.getVisibleSlidesMediaQueries(this.mediaQueries); // Количество видимых слайдов
    this.distance = this.updateWidthItem(); // Ширина одного элемента слайдера
    this.setTotalSteps();

    this.onResize = this.handleResize.bind(this); // обработчик события resize
    this.onDOMLoaded = this.handleDOMLoaded.bind(this); // обработчик события DOMContentLoaded

    // Установка обработчика события, когда документ полностью загружен
    document.addEventListener("DOMContentLoaded", this.onDOMLoaded);

    // Обработчик события изменения размера окна
    window.addEventListener("resize", this.onResize);

    // Установка обработчиков событий для кнопок вперед / назад
    if (this.elemBtnNext && this.elemBtnPrev) {
      this.onclickNext = this.handleClickNext.bind(this);
      this.onclickPrev = this.handleClickPrev.bind(this);

      this.elemBtnNext.addEventListener("click", this.onclickNext);
      this.elemBtnPrev.addEventListener("click", this.onclickPrev);
    }
  }

  dispatchSlideChangeEvent() {
    const event = new CustomEvent("slideChanged", {
      bubbles: true,
      detail: {
        currentStep: this.stepNumber,
        totalSteps: this.totalSteps,
      },
    });

    this.elemSlider.dispatchEvent(event);
  }

  initStepsCallback(callBack) {
    this.callBackSteps = callBack;
  }

  initResizeCallback(callback) {
    this.callBackResize = callback;
  }

  // Удаление событий
  removeAllListener() {
    document.removeEventListener("DOMContentLoaded", this.onDOMLoaded);
    window.removeEventListener("resize", this.onResize);

    if (this.elemBtnNext && this.elemBtnPrev) {
      this.elemBtnNext.removeEventListener("click", this.onclickNext);
      this.elemBtnPrev.removeEventListener("click", this.onclickPrev);
    }

    if (this.flagDragDropMouse) {
      // Обработчики событий для мыши
      this.elemSlider.removeEventListener("mousedown", this.onmousedown);

      this.elemSlider.removeEventListener("mousemove", this.onmousemove);

      document.removeEventListener("mouseup", this.onmouseup);
    }

    if (this.flagDragDropTouch) {
      this.elemSlider.removeEventListener("touchstart", this.ontouchstart);
      this.elemSlider.removeEventListener("touchmove", this.ontouchmove);
      document.removeEventListener("touchend", this.ontouchend);
    }
  }

  handleClickNext() {
    this.moveNext();
    this.updateButtonStates();
    this.setSlideStep();
  }

  handleClickPrev() {
    this.movePrev();
    this.updateButtonStates();
    this.setSlideStep();
  }

  handleResize() {
    let newWindowWidth = document.documentElement.clientWidth;
    if (newWindowWidth === this.windowWidth) return;
    this.resetSlider();
    this.distance = this.updateWidthItem();
    this.visibleSlides = this.getVisibleSlidesMediaQueries(this.mediaQueries);
    this.updateButtonStates();
    this.setTotalSteps();
    this.windowWidth = newWindowWidth;
    this.dispatchSlideChangeEvent();
    if (this.callBackResize) {
      this.callBackResize();
    }
    if (this.callBackSteps) {
      this.callBackSteps(this.stepNumber, this.totalSteps);
    }
  }

  handleDOMLoaded() {
    this.updateButtonStates();
    this.setTotalSteps();
    this.dispatchSlideChangeEvent();
    if (this.callBackSteps) {
      this.callBackSteps(this.stepNumber, this.totalSteps);
    }
  }

  initDragDrop(desktop = false) {
    this.flagDragDropTouch = true;
    this.isDragging = false; // Флаг перетаскивания
    this.touchStart = 0; // Начальная точка касания/клика
    this.touchEnd = 0; // Конечная точка касания/клика
    this.touchMove = 0; // Текущая позиция перетаскивания
    this.ontouchstart = this.handleStart.bind(this);
    this.ontouchmove = this.handleMove.bind(this);
    this.ontouchend = this.handleEnd.bind(this);

    // Обработчик события начала касания
    this.elemSlider.addEventListener("touchstart", this.ontouchstart, {
      passive: false,
    });

    // Обработчик события перемещения касания
    this.elemSlider.addEventListener("touchmove", this.ontouchmove, {
      passive: false,
    });

    // Обработчик события завершения касания
    document.addEventListener("touchend", this.ontouchend);

    if (!desktop) return;
    this.flagDragDropMouse = true;

    this.onmousedown = this.handleStart.bind(this);
    this.onmousemove = this.handleMove.bind(this);
    this.onmouseup = this.handleEnd.bind(this);

    // Обработчики событий для мыши
    this.elemSlider.addEventListener("mousedown", this.onmousedown, {
      passive: false,
    });

    this.elemSlider.addEventListener("mousemove", this.onmousemove, {
      passive: false,
    });

    document.addEventListener("mouseup", this.onmouseup);
  }

  handleStart(e) {
    e.preventDefault();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;

    this.startDragDrop(clientX);
  }

  handleMove(e) {
    if (!this.isDragging) return;
    // e.preventDefault();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    this.moveDragDrop(clientX);
  }

  handleEnd(e) {
    if (!this.isDragging) return;
    // e.preventDefault();
    this.endDragDrop();
  }

  // Метод начала перетаскивания
  startDragDrop(value) {
    this.isDragging = true;
    this.touchStart = value;
  }

  // Метод перемещения при перетаскивании
  moveDragDrop(value) {
    this.touchMove = value - this.touchStart + this.position;
    this.animateSlider(this.elemSlider, this.touchMove);
    this.touchEnd = value;
  }

  // Метод завершения перетаскивания
  endDragDrop() {
    this.isDragging = false;
    this.position = this.touchMove;

    setTimeout(() => {
      // Если позиция больше 0, вернуться к началу
      if (this.position > 0) {
        this.animateSlider(this.elemSlider, 0);
        this.position = 0;

        this.setSlideStep();

        // Если позиция меньше конца слайдера, вернуться к концу
      } else if (this.position < this.sliderEnd()) {
        this.animateSlider(this.elemSlider, this.sliderEnd());
        this.position = this.sliderEnd();
        this.setSlideStep();
        // Если перетаскивание было значительным, перейти на следующий слайд
      } else if (this.touchEnd - this.touchStart < -20) {
        this.position =
          this.distance * Math.floor(this.position / this.distance);

        this.setSlideStep();
        this.animateSlider(this.elemSlider, this.position);

        // Если перетаскивание было значительным, перейти на предыдущий слайд
      } else if (this.touchEnd - this.touchStart > 20) {
        this.position =
          this.distance * Math.ceil(this.position / this.distance);

        this.setSlideStep();
        this.animateSlider(this.elemSlider, this.position);
        // Иначе, оставить на текущем слайде
      } else {
        this.position =
          this.distance * Math.round(this.position / this.distance);
        this.animateSlider(this.elemSlider, this.position);
      }
      this.updateButtonStates();
      this.dispatchSlideChangeEvent();
    }, 100);
  }

  // Метод вычисления конца слайдера
  sliderEnd() {
    return -(
      this.sliderLength * this.distance -
      this.visibleSlides * this.distance
    );
  }

  // Метод установки общего количества шагов
  setTotalSteps() {
    this.totalSteps = this.sliderLength - this.visibleSlides + 1;
  }

  // Метод установки текущего шага
  setSlideStep() {
    if (this.position > 0) return;
    const valueStep = Math.abs(this.position / this.distance) + 1;
    this.stepNumber = valueStep;

    if (this.callBackSteps) {
      this.callBackSteps(this.stepNumber, this.totalSteps);
    }
    this.dispatchSlideChangeEvent();
  }

  // Метод получения количества видимых слайдов по медиа-запросам
  getVisibleSlidesMediaQueries(arrObjectsMedia) {

		for (let index = 0; index < arrObjectsMedia.length; index++) {
			const objMedia = arrObjectsMedia[index];
			for (let key in objMedia) {
				if (objMedia.hasOwnProperty(key) && objMedia[key].matches) {
					return parseInt(key);
				}
			}
		}

  }

  // Метод обновления ширины элемента
  updateWidthItem() {
    return this.elemItem.offsetWidth;
  }

  //Метод проверки кнопок для отключения или включения
  updateButtonStates() {
    if (this.elemBtnNext) {
      this.elemBtnNext.disabled = this.position <= this.sliderEnd();
    }
    if (this.elemBtnPrev) {
      this.elemBtnPrev.disabled = this.position >= 0;
    }
  }

  // Метод перехода к следующему слайду
  moveNext() {
    const valueEnd =
      this.visibleSlides * this.distance - this.distance * this.sliderLength;
    if (this.position <= valueEnd) return;

    this.position = this.position - this.distance;
    this.animateSlider(this.elemSlider, this.position);
  }

  // Метод перехода к предыдущему слайду
  movePrev() {
    if (this.position === 0) return;

    this.position = this.position + this.distance;
    this.animateSlider(this.elemSlider, this.position);
  }

  // Метод анимации слайдера
  animateSlider(elem, valueTranslate) {
    requestAnimationFrame(() => {
      elem.style.transform = `translateX(${valueTranslate}px)`;
    });
  }

  // Метод сброса слайдера
  resetSlider() {
    this.stepNumber = 1;
    this.position = 0;
    this.animateSlider(this.elemSlider, this.position);
  }
}