import { DataApi } from "../api/DataApi";
// import { CartStore } from "../store/CartStore";
import { storeCart } from "./initCart";
import { storePaints } from "./initPaints";
import { ProductCard } from "../components/ProductCard/ProductCard";
import { AppElement } from "../components/AppElem/AppElem";
import { SortPaintsByField } from "../lib/paints/sorts/SortPaints";
import { FilterPaintsByFields } from "../lib/paints/filters/FilterPaints";
import { removeClassFromElements, clearDomElem,  renderCards } from "../utils/dom.utils";
import { declOfNum } from "../utils/lang.utils";

/**
 * Инициализация секции каталога:
 * - загрузка данных из API
 * - кэширование DOM-элементов
 * - создание UI компонентов карточек и кнопок
 * - установка состояния сортировки и фильтрации
 * - рендеринг карточек товаров
 * - обработка пользовательских событий (добавление в корзину, фильтры, сортировка)
 */
export function initCatalogSection() {

  // Основные DOM-узлы для списка товаров, формы фильтров и элементов сортировки
  const $list = document.querySelector(".list-products");
  const $form = document.getElementById("filtersForm");
  const $sort = document.querySelector(".sort");
  const $sortSelected = document.querySelector(".sort__selected");
  const $sortSelectedText = document.querySelector(".sort__selected-text");
  const $sortItems = document.querySelector(".sort__items");
  const $itemSort = document.querySelectorAll(".sort__item");


  // Конфигурация API для загрузки данных о товарах
  const url = import.meta.env.VITE_API_URL;
  const options = {
    headers: {
      Accept: "application/json",
    },
  };
  const apiMock = new DataApi(url, options);

   // Состояния фильтров, сортировки и отфильтрованных товаров
  const stateFilters = {};
  let paintsFiltered = [];
  const sortState = {
    state: { price: "desc" }
  };

  // Элементы для отображения количества товаров с правильным склонением
  const quantityPaintsObj = {
    quantityNumber: document.getElementById("paint-count"),
    quantityText: document.getElementById("paint-label"),
    callback: declOfNum,
    arrVal: ['товар', 'товара', 'товаров']
  } 

 // UI компоненты: кнопка добавления в корзину и карточка товара
  const btnAddToCart = new AppElement({
    tag: 'button',
    className: "product__btn  cart-button cart-button--add sr-only-text",
    text:'добавить в корзину'
  });
  const paintCard = new ProductCard({
    elements: [btnAddToCart],
    classNameCard: "product",
    titleTag: "h2"
  });

 // Логика сортировки и фильтрации товаров
  const sortByPrice = new SortPaintsByField("price");
  const filterPaints = new FilterPaintsByFields();


  // Загрузка данных с API и первичный рендер списка товаров
  const initPaintsCards = async () => {
    try {
      storePaints.data = await apiMock.getData();
      if (!storePaints.data.length) return;
      const sortedPaints = sortByPrice.sort(storePaints.data, "desc");
      renderPaintCardsToList(sortedPaints, $list);
      initQuantityPaints(quantityPaintsObj, sortedPaints);
    } catch (error) {
      console.log(error);
    }
  };

  initPaintsCards();

   // Обновление отображения количества товаров с правильным склонением
  const initQuantityPaints = ({ quantityNumber, quantityText, callback, arrVal }, paints) => {
    quantityNumber.textContent = paints.length
    quantityText.textContent = callback(paints.length, arrVal)
  }

 // Рендер списка карточек товаров в DOM
  const renderPaintCardsToList = (cards, list) => {
    const $paintsCards = renderCards(cards,paintCard );
    list.appendChild(createPaintCardsListItemsFragment($paintsCards));
  };

  // Создание документа-фрагмента с обёртками <li> для карточек
  const createPaintCardsListItemsFragment = (elemCards) => {
    const fragment = new DocumentFragment();
    for (let i = 0; i < elemCards.length; i++) {
      const $li = document.createElement("li");
      $li.className = "list-products__item";
      $li.append(elemCards[i]);
      fragment.append($li);
    }
    return fragment;
  };


   // Обработчик добавления товара в корзину
  $list.addEventListener("click", (e) => {
    const target = e.target;
    const productElem = target.closest(".product");
    if (!productElem) return;
    const paintId = productElem.dataset.productId;
    if (!paintId) return;

    if (target.classList.contains("cart-button--add")) {
      storeCart.add(paintId);
    }
  });

  // Обработка изменений фильтров и рендер отфильтрованных, отсортированных товаров
  $form.addEventListener("change", (e) => {
    const checkBox = e.target;

    if (checkBox.checked && !stateFilters[checkBox.value]) {
      stateFilters[checkBox.value] = checkBox.checked;
    } else if (stateFilters[checkBox.value] && !checkBox.checked) {
      delete stateFilters[checkBox.value];
    }

    paintsFiltered = filterPaints.filter(storePaints.data, stateFilters);

    if (!paintsFiltered.length) {
      clearDomElem($list);
    } else {
      clearDomElem($list);
      paintsFiltered = sortByPrice.sort(
        paintsFiltered,
        sortState.state.price
      );
      renderPaintCardsToList(paintsFiltered, $list);
      initQuantityPaints(quantityPaintsObj, paintsFiltered);
    }
  });

   // Скрытие списка сортировки при клике вне его
  document.addEventListener("click", (e) => {
    if ($sort.contains(e.target)) return;
    $sortItems.classList.remove("sort__items--open");
    $sort.setAttribute("aria-expanded", 'false');
  });

   // Показ списка сортировки при клике на выбранный пункт
  $sortSelected.addEventListener("click", (e) => {
    e.stopPropagation();
    $sortItems.classList.add("sort__items--open");
    $sort.setAttribute('aria-expanded', 'true');
  });

  // Обработка выбора варианта сортировки, обновление отображения
  $sortItems.addEventListener("click", (e) => {
    if (!e.target.classList.contains('sort__item')) return;
    removeClassFromElements($itemSort, "sort__item--selected");
    e.target.classList.add("sort__item--selected");
    $sortItems.prepend(e.target);
    $sortSelectedText.textContent = e.target.textContent;
    $sort.dataset.value = e.target.dataset.value;
    clearDomElem($list);
    const [category, direction] = e.target.dataset.value.split(':');
    paintsFiltered = filterPaints.filter(storePaints.data, stateFilters);
    const sortedPaints = sortByPrice.sort(
      paintsFiltered,
      direction
    );
    sortState.state[category] = direction;
    renderPaintCardsToList(sortedPaints, $list);
    initQuantityPaints(quantityPaintsObj, sortedPaints);
  });


  // Панель фильтров на мобильных

  const btnShowFilterPanel = document.querySelector('.products__filter-btn');
  const overlayFilter = document.querySelector('.products__overlay-filter');

  btnShowFilterPanel.addEventListener('click', ()=> {
    overlayFilter.classList.add('products__overlay-filter--active');
  })

  overlayFilter.addEventListener('click', (e)=> {
    if(e.target === overlayFilter) {
      overlayFilter.classList.remove('products__overlay-filter--active');
    }
  })

}
