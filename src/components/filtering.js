import { createComparison, defaultRules } from "../lib/compare.js";

// defaultRules уже является массивом правил
const compare = createComparison(defaultRules);

export function initFiltering(elements, indexes) {
  // @todo: #4.1 — заполнить выпадающие списки опциями
  Object.keys(indexes).forEach((elementName) => {
    if (elements[elementName]) {
      elements[elementName].append(
        ...Object.values(indexes[elementName]).map((name) => {
          const option = document.createElement("option");
          option.value = name;
          option.textContent = name;
          return option;
        }),
      );
    }
  });

  return (data, state, action) => {
    // @todo: #4.2 — обработать очистку поля
    if (action && action.name === "clear") {
      const parent = action.closest(".filter-field");
      if (parent) {
        const input = parent.querySelector("input, select");
        if (input) {
          input.value = "";
          const fieldName = action.dataset.field;
          if (fieldName && state[fieldName] !== undefined) {
            state[fieldName] = "";
          }
        }
      }
    }

    // @todo: #4.5 — отфильтровать данные используя компаратор

    // Преобразуем totalFrom и totalTo в числа перед фильтрацией
    const stateForCompare = { ...state };

    if (
      stateForCompare.totalFrom !== undefined &&
      stateForCompare.totalFrom !== ""
    ) {
      stateForCompare.totalFrom = parseFloat(stateForCompare.totalFrom);
    }
    if (
      stateForCompare.totalTo !== undefined &&
      stateForCompare.totalTo !== ""
    ) {
      stateForCompare.totalTo = parseFloat(stateForCompare.totalTo);
    }

    return data.filter((row) => compare(row, stateForCompare));
  };
}
