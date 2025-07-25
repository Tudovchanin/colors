

import {
  disablePageScroll,
  enablePageScroll,
} from "../utils/dom.utils";


export function initMobile() {
  const burgerBtn = document.querySelector('.burger-btn');
  const mobileMenu = document.querySelector('.header__mobile-menu');
  const overlay = document.createElement('div');
  overlay.classList.add('overlay');

  burgerBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    burgerBtn.classList.toggle('burger-btn--active');
    mobileMenu.classList.toggle('header__mobile-menu--active');
    if (burgerBtn.classList.contains('burger-btn--active')) {
      document.body.append(overlay);
      disablePageScroll();
    } else {
      overlay.remove();
      enablePageScroll();
    }
  })

  document.addEventListener('click', (e) => {
    const clickElem = e.target;
    if (clickElem === overlay) {
      burgerBtn.classList.remove('burger-btn--active');
      mobileMenu.classList.remove('header__mobile-menu--active');
      overlay.remove();
      enablePageScroll();
    }
  })
}