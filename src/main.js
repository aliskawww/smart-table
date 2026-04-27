import "./fonts/ys-display/fonts.css";
import "./style.css";

import { data as sourceData } from "./data/dataset_1.js";

import { initData } from "./data.js";
import { processFormData } from "./lib/utils.js";

import { initTable } from "./components/table.js";
import { initPagination } from "./components/pagination.js";
import { initSorting } from "./components/sorting.js";
import { initFiltering } from "./components/filtering.js";
// @todo: подключение
import { initSearching } from "./components/searching.js";

// Исходные данные используемые в render()
const { data, ...indexes } = initData(sourceData);

/**
 * Сбор и обработка полей из таблицы
 * @returns {Object}
 */
function collectState() {
  const state = processFormData(new FormData(sampleTable.container));

  const rowsPerPage = parseInt(state.rowsPerPage);
  const page = parseInt(state.page ?? 1);

  // Преобразуем фильтры диапазона в числа
  const totalFrom =
    state.totalFrom !== "" && state.totalFrom !== undefined
      ? parseFloat(state.totalFrom)
      : undefined;
  const totalTo =
    state.totalTo !== "" && state.totalTo !== undefined
      ? parseFloat(state.totalTo)
      : undefined;

  return {
    ...state,
    rowsPerPage,
    page,
    totalFrom,
    totalTo,
  };
}

/**
 * Перерисовка состояния таблицы при любых изменениях
 * @param {HTMLButtonElement?} action
 */
function render(action) {
  let state = collectState(); // состояние полей из таблицы
  let result = [...data]; // копируем для последующего изменения

  // @todo: использование
  result = applySearching(result, state, action); // Поиск (самый первый)
  result = applyFiltering(result, state, action); // Фильтрация
  result = applySorting(result, state, action); // Сортировка
  result = applyPagination(result, state, action); // Пагинация

  sampleTable.render(result);
}

const sampleTable = initTable(
  {
    tableTemplate: "table",
    rowTemplate: "row",
    before: ["search", "header", "filter"], // Поиск перед заголовком
    after: ["pagination"],
  },
  render,
);

// @todo: инициализация
const applyPagination = initPagination(
  sampleTable.pagination.elements,
  (el, page, isCurrent) => {
    const input = el.querySelector("input");
    const label = el.querySelector("span");
    input.value = page;
    input.checked = isCurrent;
    label.textContent = page;
    return el;
  },
);

const applySorting = initSorting([
  sampleTable.header.elements.sortByDate,
  sampleTable.header.elements.sortByTotal,
]);

const applyFiltering = initFiltering(sampleTable.filter.elements, {
  searchBySeller: indexes.sellers,
});

const applySearching = initSearching("search"); // Передаём имя поля поиска

const appRoot = document.querySelector("#app");
appRoot.appendChild(sampleTable.container);

render();
