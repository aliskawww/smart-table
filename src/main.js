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
// const { data, ...indexes } = initData(sourceData);
const api = initData();

/**
 * Сбор и обработка полей из таблицы
 * @returns {Object}
 */
function collectState() {
  const state = processFormData(new FormData(sampleTable.container));

  const rowsPerPage = parseInt(state.rowsPerPage);
  const page = parseInt(state.page ?? 1);

  // Преобразуем значения для фильтрации по диапазону
  const totalFrom =
    state.totalFrom !== "" &&
    state.totalFrom !== undefined &&
    state.totalFrom !== null
      ? parseFloat(state.totalFrom)
      : undefined;
  const totalTo =
    state.totalTo !== "" &&
    state.totalTo !== undefined &&
    state.totalTo !== null
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
async function render(action) {
  let state = collectState(); // состояние полей из таблицы
  let query = {}; // здесь будут формироваться параметры запроса
  // другие apply*
  query = applySearching(query, state, action);
  query = applyFiltering(query, state, action);
  query = applySorting(query, state, action);
  query = applyPagination(query, state, action); // обновляем query

  const { total, items } = await api.getRecords(query); // запрашиваем данные с собранными параметрами

  updatePagination(total, query); // перерисовываем пагинатор
  sampleTable.render(items);
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
const { applyPagination, updatePagination } = initPagination(
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

const { applyFiltering, updateIndexes } = initFiltering(
  sampleTable.filter.elements,
);

const applySearching = initSearching(sampleTable.search.elements); // Передаём имя поля поиска

const appRoot = document.querySelector("#app");
appRoot.appendChild(sampleTable.container);

async function init() {
  const indexes = await api.getIndexes();

  updateIndexes(sampleTable.filter.elements, {
    searchBySeller: indexes.sellers,
  });
}

init().then(render);
