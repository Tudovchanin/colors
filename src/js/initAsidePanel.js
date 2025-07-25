import { storeCart } from "./initCart";
import { storePaints } from "./initPaints";
import { declOfNum } from "../utils/lang.utils";
import { HorizontalProductCard } from "../components/ProductCard/HorizontalProductCard";
import { AppElement } from "../components/AppElem/AppElem";
import {
  renderCards,
  clearDomElem,
  disablePageScroll,
  enablePageScroll,
} from "../utils/dom.utils";


/**
 * Инициализация панели корзины:
 * - получение DOM-элементов
 * - создание экземпляров UI-компонентов
 * - управление рендерингом товаров и состоянием удаления
 * - установка обработчиков событий для взаимодействия пользователя
 */

export function initAsidePanel() {
  // DOM элементы панели корзины: кнопки, контейнеры, отображение количества и цены
  const $cartBtn = document.getElementById("cart");
  const $asidePanel = document.querySelector(".panel-aside");
  const $containerCardsAsidePanel = document.querySelector(
    ".panel-aside__products-list"
  );
  const $btnCloseAsidePanel = document.querySelector(".panel-aside__close-btn");
  const $totalPaints = document.querySelector(".panel-aside__cart-quantity");
  const $btnClearCart = document.querySelector(".panel-aside__cart-clear-btn");
  const $totalPrice = document.querySelector(".panel-aside__total-price");

  // Экземпляры UI компонентов кнопок увеличения/уменьшения количества и карточек товара
  const btnIncrease = new AppElement({
    className: "product-cart__btn  cart-button cart-button--increase sr-only-text",
    text: 'увеличить'

  });
  const btnDecrease = new AppElement({
    className: "product-cart__btn cart-button cart-button--decrease sr-only-text",
    text: 'уменьшить'
  });
  const numberOfUnitPaint = new AppElement({
    className: "product-cart__quantity",
  });
  const cartPaintCard = new HorizontalProductCard({
    elements: [btnIncrease, numberOfUnitPaint, btnDecrease],
    classNameCard: "product-cart",
  });

   // Временное хранение товаров, помеченных к удалению, до подтверждения
  let pendingDeletionItems = {};

  // Формирование DocumentFragment с карточками товаров
  const createFragmentCardsCart = (elemCards) => {
    const fragment = new DocumentFragment();
    for (let i = 0; i < elemCards.length; i++) {
      const $li = document.createElement("li");
      $li.className = "panel-aside__product-item";
      $li.append(elemCards[i]);
      $li.append(createBtnDelete());
      $li.append(createBtnRestore());
      fragment.append($li);
    }
    return fragment;
  };

   // Создание кнопок удалить/восстановить для товаров в списке
  const createBtnDelete = () => {
    const btn = document.createElement("button");
    btn.className = "panel-aside__item-delete";
    btn.setAttribute("aria-label", "удалить товар");
    return btn;
  };
  const createBtnRestore = () => {
    const btn = document.createElement("button");
    btn.className = "panel-aside__item-restore d-none";
    btn.setAttribute("aria-label", "восстановить товар");
    return btn;
  };

  // Обновление текста общего количества товаров с правильным склонением
  const updateTotalPaints = () => {
    const count = storeCart.getQuantityProduct();
    const str = declOfNum(count, ["товар", "товара", "товаров"]);
    $totalPaints.textContent = count + " " + str;
  };

 // Удаление из корзины всех товаров, помеченных на удаление
  const deleteProducts = () => {
    for (const key in pendingDeletionItems) {
      if (Object.hasOwnProperty.call(pendingDeletionItems, key)) {
        storeCart.removeAll(key);
      }
    }
  };

   // Расчёт итоговой суммы, исключая товары, помеченные на удаление
  const calculateTheAmount = () => {
    const newCartState = { ...storeCart.cart };
    for (const keyId in pendingDeletionItems) {
      if (Object.hasOwnProperty.call(pendingDeletionItems, keyId)) {
        delete newCartState[keyId];
      }
    }
    const sum =
      storeCart.getSumPriceInCart(storePaints.data, newCartState).toFixed(2) +
      "₽";
    return sum;
  };

  // Переключение состояний кнопок удаления/восстановления и opacity карточки товара
  const handleDeleteRestore = (
    { target, itemList, product, productId, stateDelete },
    selector,
    event
  ) => {
    const btn = itemList.querySelector(selector);
    target.classList.add("d-none");
    btn.classList.remove("d-none");
    if (event === "delete") {
      stateDelete[productId] = storeCart.cart[productId];
      product.classList.add("ghost-mode");
    } else {
      delete stateDelete[productId];
      product.classList.remove("ghost-mode");
    }
  };


 // Обработчики событий:
  
  // Закрытие панели по клику вне контента, очистка, удаление товаров и разблокировка прокрутки
  $asidePanel.addEventListener("click", (e) => {
    if (e.target === $asidePanel) {
      $asidePanel.classList.add("panel-aside--hidden");
      clearDomElem($containerCardsAsidePanel);
      enablePageScroll();
      deleteProducts();
      pendingDeletionItems = {};
    }
  });
    // Управление кликами по товарам: удаление, восстановление, изменение количества
  $containerCardsAsidePanel.addEventListener("click", (e) => {
    const target = e.target;
    const itemList = target.closest(".panel-aside__product-item");
    if (!itemList) return;
    const paintProduct = itemList.querySelector(".product-cart");
    const paintId = paintProduct.dataset.productId;
    const $quantity = paintProduct.querySelector(".product-cart__quantity");

    if (!paintId) return;

    const targetObj = {
      target: target,
      itemList: itemList,
      product: paintProduct,
      productId: paintId,
      stateDelete: pendingDeletionItems,
    };

    if (e.target.classList.contains("panel-aside__item-delete")) {
      const selector = ".panel-aside__item-restore";
      handleDeleteRestore(targetObj, selector, "delete");
      $totalPrice.textContent = calculateTheAmount();
      return;
    }

    if (e.target.classList.contains("panel-aside__item-restore")) {
      const selector = ".panel-aside__item-delete";
      handleDeleteRestore(targetObj, selector, "restore");
      $totalPrice.textContent = calculateTheAmount();
      return;
    }

    if (e.target.classList.contains("cart-button--increase")) {
      storeCart.add(paintId);
      $quantity.textContent = storeCart.cart[paintId];
      $totalPrice.textContent = calculateTheAmount();
    }

    if (e.target.classList.contains("cart-button--decrease")) {
      if (storeCart.cart[paintId] <= 1) return;

      storeCart.remove(paintId);
      $quantity.textContent = storeCart.cart[paintId];
      $totalPrice.textContent = calculateTheAmount();
    }
  });
    // Открытие панели: вывод товаров, обновление счетчиков и блокировка прокрутки страницы
  $cartBtn.addEventListener("click", () => {
    $asidePanel.classList.remove("panel-aside--hidden");
    updateTotalPaints();
    const paints = storeCart.getProductsInCart(storePaints.data);
    const elemPaintsCard = renderCards(paints, cartPaintCard);
    $containerCardsAsidePanel.append(createFragmentCardsCart(elemPaintsCard));
    const $allNumberOfUnitPaint = document.querySelectorAll(
      ".product-cart__quantity"
    );

    $allNumberOfUnitPaint.forEach((containerQuantity) => {
      const paintCard = containerQuantity.closest(".product-cart");
      const paintId = paintCard.dataset.productId;
      containerQuantity.textContent = storeCart.cart[paintId];
    });

    $totalPrice.textContent = calculateTheAmount();

    disablePageScroll();
  });
 // Кнопка закрытия панели: очистка контента, удаление, разблокировка прокрутки
  $btnCloseAsidePanel.addEventListener("click", (e) => {
    e.stopPropagation();
    $asidePanel.classList.add("panel-aside--hidden");
    clearDomElem($containerCardsAsidePanel);
    deleteProducts();
    pendingDeletionItems = {};
    enablePageScroll();
  });
    // Кнопка очистки корзины: полная очистка состояния и UI
  $btnClearCart.addEventListener("click", () => {
    pendingDeletionItems = {};
    storeCart.clear();
    $containerCardsAsidePanel.innerHTML = "";
    $totalPrice.textContent = "0₽";
    $totalPaints.textContent = "0 товаров";
  });
}
