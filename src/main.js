import "./fonts/ys-display/fonts.css";
import "./style.css";

import { initData } from "./data.js";
import { processFormData } from "./lib/utils.js";

import { initTable } from "./components/table.js";
import { initPagination } from "./components/pagination.js";
import { initSorting } from "./components/sorting.js";
import { initFiltering } from "./components/filtering.js";
import { initSearching } from "./components/searching.js";

const api = initData();

function collectState() {
  const state = processFormData(new FormData(sampleTable.container));
  const rowsPerPage = parseInt(state.rowsPerPage, 10);
  const page = parseInt(state.page ?? 1, 10);

  return {
    ...state,
    rowsPerPage,
    page,
  };
}

async function render(action) {
  const state = collectState();
  let query = {};

  query = applySearching(query, state, action);
  query = applyFiltering(query, state, action);
  query = applySorting(query, state, action);
  query = applyPagination(query, state, action);

  const { total, items } = await api.getRecords(query);

  updatePagination(total, query);
  sampleTable.render(items);
}

const sampleTable = initTable(
  {
    tableTemplate: "table",
    rowTemplate: "row",
    before: ["search", "header", "filter"],
    after: ["pagination"],
  },
  render,
);

const { applyPagination, updatePagination } = initPagination(
  sampleTable.pagination.elements,
  (element, pageNumber, isCurrent) => {
    const input = element.querySelector("input");
    const label = element.querySelector("span");
    if (input) input.value = pageNumber;
    if (input) input.checked = isCurrent;
    if (label) label.textContent = pageNumber;
    return element;
  },
);

const applySorting = initSorting([
  sampleTable.header.elements.sortByDate,
  sampleTable.header.elements.sortByTotal,
]);

const { applyFiltering, updateIndexes } = initFiltering(
  sampleTable.filter.elements,
);

const applySearching = initSearching("search");

const appRoot = document.querySelector("#app");
if (appRoot) {
  appRoot.appendChild(sampleTable.container);
}

async function init() {
  const indexes = await api.getIndexes();
  if (indexes.sellers && sampleTable.filter.elements.searchBySeller) {
    updateIndexes(sampleTable.filter.elements, {
      searchBySeller: indexes.sellers,
    });
  }
}

init().then(render);
