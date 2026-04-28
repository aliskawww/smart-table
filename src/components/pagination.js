import { getPages } from "../lib/utils.js";

export const initPagination = (
  { pages, fromRow, toRow, totalRows },
  createPage,
) => {
  const pageTemplate = pages.firstElementChild?.cloneNode(true);

  if (pageTemplate) {
    pages.firstElementChild?.remove();
  }
  pages.innerHTML = "";

  let pageCount = 0;

  const applyPagination = (query, state, action) => {
    const limit = state.rowsPerPage;
    let page = state.page;

    if (action) {
      switch (action.name) {
        case "prev":
          page = Math.max(1, page - 1);
          break;
        case "next":
          page = Math.min(pageCount || 1, page + 1);
          break;
        case "first":
          page = 1;
          break;
        case "last":
          page = pageCount || 1;
          break;
        default:
          break;
      }
    }

    return Object.assign({}, query, { limit, page });
  };

  const updatePagination = (total, { page, limit }) => {
    pageCount = Math.ceil(total / limit) || 1;

    const visiblePages = getPages(page, pageCount, 5);

    if (pageTemplate) {
      pages.replaceChildren(
        ...visiblePages.map((pageNumber) => {
          const element = pageTemplate.cloneNode(true);
          return createPage(element, pageNumber, pageNumber === page);
        }),
      );
    }

    fromRow.textContent = total === 0 ? 0 : (page - 1) * limit + 1;
    toRow.textContent = Math.min(page * limit, total);
    totalRows.textContent = total;
  };

  return {
    updatePagination,
    applyPagination,
  };
};
