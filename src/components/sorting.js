import { sortMap } from "../lib/sort.js";

export function initSorting(columns) {
  return (query, state, action) => {
    let field = null;
    let order = null;

    if (action && action.name === "sort") {
      const currentValue = action.dataset.value;

      let nextValue;
      if (currentValue === "none" || currentValue === "up") {
        nextValue = "down";
      } else if (currentValue === "down") {
        nextValue = "none";
      } else {
        nextValue = sortMap[currentValue] || "asc";
      }

      action.dataset.value = nextValue;
      field = action.dataset.field;
      order = nextValue;

      columns.forEach((column) => {
        if (column.dataset.field !== action.dataset.field) {
          column.dataset.value = "none";
        }
      });
    } else {
      columns.forEach((column) => {
        if (column.dataset.value !== "none") {
          field = column.dataset.field;
          order = column.dataset.value;
        }
      });
    }

    const newQuery = { ...query };
    delete newQuery.sort;

    let apiOrder = null;
    if (order === "up" || order === "asc") {
      apiOrder = "asc";
    } else if (order === "down" || order === "desc") {
      apiOrder = "desc";
    }

    if (field && apiOrder && order !== "none") {
      const sort = `${field}:${apiOrder}`;
      return Object.assign({}, newQuery, { sort });
    }

    return newQuery;
  };
}
