import { sortMap } from "../lib/sort.js";

export function initSorting(columns) {
  return (query, state, action) => {
    let field = null;
    let order = null;

    if (action && action.name === "sort") {
      const currentValue = action.dataset.value;

      let nextValue;
      if (currentValue === "none") {
        nextValue = "up";
      } else if (currentValue === "up") {
        nextValue = "down";
      } else {
        nextValue = "none";
      }

      action.dataset.value = nextValue;
      field = action.dataset.field;
      order = nextValue;

      columns.forEach((column) => {
        if (column.dataset.field !== action.dataset.field) {
          column.dataset.value = "none";
        }
      });
    }

    const newQuery = { ...query };
    delete newQuery.sort;

    let activeField = null;
    let activeOrder = null;

    for (const column of columns) {
      const value = column.dataset.value;
      if (value !== "none") {
        activeField = column.dataset.field;
        activeOrder = value === "up" ? "asc" : "desc";
        break;
      }
    }

    if (activeField && activeOrder) {
      const sort = `${activeField}:${activeOrder}`;
      return Object.assign({}, newQuery, { sort });
    }

    return newQuery;
  };
}
