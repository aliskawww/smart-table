export function initFiltering(elements) {
  const updateIndexes = (elementsObject, indexes) => {
    Object.keys(indexes).forEach((elementName) => {
      const element = elementsObject[elementName];
      if (element) {
        // Очищаем существующие опции, кроме первой (пустой)
        while (element.options.length > 1) {
          element.remove(1);
        }

        Object.values(indexes[elementName]).forEach((name) => {
          const option = document.createElement("option");
          option.textContent = name;
          option.value = name;
          element.appendChild(option);
        });
      }
    });
  };

  const applyFiltering = (query, state, action) => {
    if (action && action.name === "clear") {
      const parent = action.closest(".filter-field");
      const input = parent?.querySelector("input, select");
      if (input) {
        input.value = "";
        const fieldName = action.dataset.field;
        if (fieldName && state[fieldName] !== undefined) {
          state[fieldName] = "";
        }
      }
    }

    const filter = {};
    Object.keys(elements).forEach((key) => {
      const element = elements[key];
      if (
        element &&
        ["INPUT", "SELECT"].includes(element.tagName) &&
        element.value
      ) {
        filter[key] = element.value;
      }
    });

    return Object.keys(filter).length
      ? Object.assign({}, query, { filter })
      : query;
  };

  return {
    updateIndexes,
    applyFiltering,
  };
}
