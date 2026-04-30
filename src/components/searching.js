export function initSearching(searchField) {
  return (query, state) => {
    const value = String(state[searchField] ?? "").trim();

    if (value) {
      return Object.assign({}, query, { search: value });
    }

    const next = { ...query };
    delete next.search;
    return next;
  };
}
