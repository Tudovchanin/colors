
import './HorizontalProductCard.scss';
import { ProductCard } from './ProductCard.js';

export class HorizontalProductCard extends ProductCard {

  constructor(option) {
    super(option)
  }

  render(product) {
    if (!product) {
      throw new Error("Error product parameters");
    }

    const article = this._createArticle(product);

    const left = document.createElement("div");
    left.className = `${this.classNameCard}__left`;
    left.append(this._createImg(product));

  
    const center = document.createElement("div");
    center.className = `${this.classNameCard}__center`;
    center.append(this._createTitle(product), this._createPrice(product));


    const right = document.createElement("div");
    right.className = `${this.classNameCard}__right`;

    if (this.elements.length) {
      this.elements.forEach((element) => {
        right.append(element.render());
      });
    }
   
    article.append(left,center,right)
    return article;
  }
}
