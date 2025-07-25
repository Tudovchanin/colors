export class CartStore {
  constructor(callback) {
    this.localStorageKey = "cart";
    this.cart = this.loadCart();
    this.report = callback
  }

  loadCart() {
    const savedCart = localStorage.getItem(this.localStorageKey);
    return savedCart ? JSON.parse(savedCart) : {};
  }

  saveCart() {
    localStorage.setItem(this.localStorageKey, JSON.stringify(this.cart));
  }

  add(idProduct, quantity = 1) {
    if (quantity <= 0) return;
    if (!this.cart[idProduct]) {
      this.cart[idProduct] = 0;
    }
    this.cart[idProduct] += quantity;
    this.saveCart();
    this.report();
  }

  remove(idProduct, quantity = 1) {
    if (quantity <= 0) return;
    if (!this.cart[idProduct]) return;
    this.cart[idProduct] -= quantity;
    if (this.cart[idProduct] <= 0) {
      delete this.cart[idProduct];
    }
    this.saveCart();
    this.report();
  }

  removeAll(idProduct) {
    console.log(idProduct, 'removeAll', this.cart);
    if (!this.cart[idProduct]) return;
    delete this.cart[idProduct];
    this.saveCart();
    this.report();
  }

  clear() {
    this.cart = {};
    this.saveCart();
    this.report();
  }

  getQuantityProduct() {
    return Object.values(this.cart).reduce((acc, quantity) => acc + quantity, 0);
  }

  getLengthCart() {
    return Object.keys(this.cart).length;
  }

  getProductsInCart(products) {
    return products.reduce((acc, product) => {
      if (this.cart[product.id]) {
        acc.push(product);
      }
      return acc;
    }, [])
  }

  getSumPriceInCart(products, cart) {
 
   return products.reduce((acc, product) => {
      if (cart[product.id]) {
       acc = acc + product.price * cart[product.id]
      }
      return acc;
    }, 0)
  }
}
