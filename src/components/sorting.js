export function initSorting(columns) {
  return (query, state, action) => {
    if (action && action.name === "sort") {
      const currentValue = action.dataset.value;

      let nextValue;
      if (currentValue === "none") nextValue = "up";
      else if (currentValue === "up") nextValue = "down";
      else nextValue = "none";

      action.dataset.value = nextValue;

      columns.forEach((column) => {
        if (column.dataset.field !== action.dataset.field) {
          column.dataset.value = "none";
        }
      });
    }

    const newQuery = { ...query };

    let field = null;
    let order = null;

    for (const column of columns) {
      const value = column.dataset.value;
      if (value !== "none") {
        field = column.dataset.field;
        order = value;
        break;
      }
    }

    const sort = field && order ? `${field}:${order}` : null;

    if (!sort) {
      delete newQuery.sort;
      return newQuery;
    }

    return Object.assign({}, newQuery, { sort });
  };
}
