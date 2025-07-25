import "./ProductCard.scss";

export class ProductCard {
  constructor({
    elements = [],
    classNameCard = "card",
    titleTag = "div",
    currencySymbol = "₽",
    extensionImg = "png",
  }) {
    const validTags = ["div", "h1", "h2", "h3", "h4", "h5", "h6", "p", "span"];
    this.titleTag = validTags.includes(titleTag) ? titleTag : "div";

    this.elements = elements;
    this.classNameCard = classNameCard;
    this.currencySymbol = currencySymbol;
    this.extensionImg = extensionImg;
  }
 
  _createImg(product) {
    const img = document.createElement("img");
    img.className = `${this.classNameCard}__img`;
    img.src = `${import.meta.env.BASE_URL}images/${product.img_name}.${this.extensionImg}`;
    img.alt = product.name;
    return img;
  }
  _createArticle(product){
    const article = document.createElement("article");
    article.setAttribute("data-product-id", product.id);
    article.className = this.classNameCard;
    return article;
  }

  _createPrice(product) {
    const priceElem = document.createElement("span");
    priceElem.className = `${this.classNameCard}__price`;
    priceElem.textContent = `${product.price} ${this.currencySymbol}`;
    return priceElem;
  }

  _createTitle(product) {
    const title = document.createElement(this.titleTag);
    title.className = `${this.classNameCard}__title`;
    title.textContent = product.name;
    return title;
  }

  render(product) {
    if (!product) {
      throw new Error("Error product parameters");
    }

    const article =  this._createArticle(product);

    const header = document.createElement("header");
    header.className = `${this.classNameCard}__header`;

    const imageWrapper = document.createElement("div");
    imageWrapper.className = `${this.classNameCard}__image-wrapper`;
    imageWrapper.append(this._createImg(product));

    header.append(imageWrapper);
    header.append(this._createTitle(product));


    const footer = document.createElement("footer");
    footer.className = `${this.classNameCard}__footer`;
    footer.append(this._createPrice(product));

    if (this.elements.length) {
      this.elements.forEach((element) => {
        footer.append(element.render());
      });
    }

    article.append(header,footer);

    return article;
  }
}
