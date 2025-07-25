
import './AppElem.scss';

export class AppElement {
  constructor({ className, text = '', tag = 'div', attrs = {} }) {
    this.className = className;
    this.text = text;
    this.tag = tag;
    this.attrs = attrs;
   
  }

  render() {

    const elem = document.createElement(this.tag);

    if (this.className) {
      elem.className = this.className;
    }

    if (this.text) {
      elem.textContent = this.text;
    }
    if (this.productId) {
      elem.dataset.productId = this.productId;
    }

    Object.entries(this.attrs).forEach(([key, value]) => {
      elem.setAttribute(key, value);
    });

    return elem;
  }
}
