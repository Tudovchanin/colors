import { Slider } from "../utils/Slider";
import { removeClassFromElements } from "../utils/dom.utils";



export function initHeroSection() {

  const media = [{ 1: window.matchMedia("(min-width: 1px)") }];
  const sliderAllElem = {
    btnNext: document.querySelector(".slider__btn--next"),
    btnPrev: document.querySelector(".slider__btn--prev"),
    slider: document.querySelector(".slider__track"),
    itemLength: document.querySelectorAll(".slider__item").length,
    item: document.querySelector(".slider__item"),
  };
  const sliderObj = new Slider(media);
  const iconsSteps = {
    containerSelector: ".slider__container-icons",
    classNameIcon: "slider__icon",
    length: sliderAllElem.itemLength,
  };

  //Init slider
  sliderObj.initSlider(sliderAllElem);
  //инициализация drag'n drop (по желанию)
  // Если вызвать метод без аргумента — drag'n'drop будет активен только на мобильных устройствах.
  // Если передать строку "desktop" — drag'n'drop будет активен и на десктопе, и на мобильных.
  sliderObj.initDragDrop("desktop");

  const initIconsStepsSlider = ({ containerSelector, classNameIcon, length }) => {
    const fragment = new DocumentFragment();
    const $containerIcons = document.querySelector(containerSelector);
    for (let index = 0; index < length; index++) {
      const $icon = document.createElement("div");
      $icon.className = classNameIcon;
      fragment.append($icon);
    }

    $containerIcons.append(fragment);
  };
  
  initIconsStepsSlider(iconsSteps);

  const $iconStepsSlider = document.querySelectorAll(".slider__icon");

  // slideChanged — это специальное событие слайдера, сигнализирующее о смене текущего слайда, срабатывает при первой загрузке что бы показать текущий шаг
  // шаги начинаются с 1, а не 0
  sliderAllElem.slider.addEventListener("slideChanged", (e) => {
    removeClassFromElements($iconStepsSlider, "slider__icon--active");

    $iconStepsSlider[e.detail.currentStep - 1].classList.add(
      "slider__icon--active"
    );

    if (e.detail.currentStep === 1) {
      sliderAllElem.btnPrev.setAttribute(
        "aria-label",
        "Предыдущий слайд недоступен"
      );
    } else {
      sliderAllElem.btnPrev.setAttribute("aria-label", "Предыдущий слайд");
    }

    if (e.detail.currentStep === e.detail.totalSteps) {
      sliderAllElem.btnNext.setAttribute(
        "aria-label",
        "Следующий слайд недоступен"
      );
    } else {
      sliderAllElem.btnNext.setAttribute("aria-label", "Следующий слайд");
    }

  });





}

