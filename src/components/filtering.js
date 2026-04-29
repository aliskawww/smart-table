export function initFiltering(elements) {
  const updateIndexes = (elementsObject, indexes) => {
    Object.keys(indexes).forEach((elementName) => {
      const element = elementsObject[elementName];
      if (element) {
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
      }
      return query;
    }

    const filter = {};
    
    // Выводим все элементы и их значения
    console.log("=== FILTER ELEMENTS ===");
    Object.keys(elements).forEach(key => {
      const el = elements[key];
      console.log(`Key: "${key}", Tag: ${el?.tagName}, Name: ${el?.getAttribute('name')}, Value: "${el?.value}"`);
      
      if (el && (el.tagName === 'INPUT' || el.tagName === 'SELECT')) {
        const value = el.value;
        const name = el.getAttribute('name') || key;
        
        if (value && value !== '') {
          filter[name] = value;
          console.log(`  -> Added filter: ${name} = "${value}"`);
        }
      }
    });
    
    console.log("Final filter:", filter);
    
    return Object.keys(filter).length ? Object.assign({}, query, { filter }) : query;
  };

  return {
    updateIndexes,
    applyFiltering,
  };
}