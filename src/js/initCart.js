import { CartStore } from "../store/CartStore";

export const storeCart = new CartStore(updateCart);

const $cartCount = document.getElementById('cart-count');
function updateCart() {
  const count = storeCart.getQuantityProduct();
  $cartCount.textContent =  count > 99 ? 99 : count
}

updateCart();