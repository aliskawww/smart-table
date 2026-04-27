import { createComparison, defaultRules } from "../lib/compare.js";

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
      const parent =
        action.closest(".filter-field") || action.parentElement?.parentElement;
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

    // Создаём копию state с числовыми значениями для диапазонов
    const processedState = { ...state };

    // Преобразуем totalFrom в число
    if (
      processedState.totalFrom !== undefined &&
      processedState.totalFrom !== ""
    ) {
      processedState.totalFrom = parseFloat(processedState.totalFrom);
    } else {
      processedState.totalFrom = undefined;
    }

    // Преобразуем totalTo в число
    if (processedState.totalTo !== undefined && processedState.totalTo !== "") {
      processedState.totalTo = parseFloat(processedState.totalTo);
    } else {
      processedState.totalTo = undefined;
    }

    // Для total используем массив [from, to] для правила arrayAsRange
    if (
      processedState.totalFrom !== undefined ||
      processedState.totalTo !== undefined
    ) {
      processedState.total = [processedState.totalFrom, processedState.totalTo];
    }

    // Создаём компаратор с правилами, включая arrayAsRange
    const compareWithRange = createComparison([
      "skipEmptyTargetValues",
      "arrayAsRange",
      "stringIncludes",
    ]);

    return data.filter((row) => compareWithRange(row, processedState));
  };
}
