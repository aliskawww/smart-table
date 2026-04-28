export function initFiltering(elements) {
  const updateIndexes = (elementsObject, indexes) => {
    Object.keys(indexes).forEach((elementName) => {
      elementsObject[elementName].append(
        ...Object.values(indexes[elementName]).map((name) => {
          const option = document.createElement("option");
          option.textContent = name;
          option.value = name;
          return option;
        }),
      );
    });
  };

  const applyFiltering = (query, state, action) => {
    if (action && action.name === "clear") {
      const parent = action.closest(".filter-field");
      const input = parent.querySelector("input, select");
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
        filter[`filter[${element.name}]`] = element.value;
      }
    });

    return Object.keys(filter).length
      ? Object.assign({}, query, filter)
      : query;
  };

  return {
    updateIndexes,
    applyFiltering,
  };
}
