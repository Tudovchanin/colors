export const removeClassFromElements = (elements, className) => {
  elements.forEach(element => {
    element.classList.remove(className);
  });
};

export const clearDomElem = (el) => {
  el.innerHTML = '';
}

export function renderCards(products, cardComponent) {
  return products.map(product => cardComponent.render(product));
}


const getScrollWidth = () => window.innerWidth - document.documentElement.clientWidth;

export const disablePageScroll = () => {
  const scrollWidth = getScrollWidth();
  document.documentElement.classList.add('no-scroll');
  document.body.classList.add('no-scroll');
  if (scrollWidth > 0) {
    document.body.style.paddingRight = `${scrollWidth}px`;
  }
};

export const enablePageScroll = () => {
  document.documentElement.classList.remove('no-scroll');
  document.body.classList.remove('no-scroll');
  document.body.style.paddingRight = '';
};
