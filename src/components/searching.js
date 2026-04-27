import { rules, createComparison } from "../lib/compare.js";

export function initSearching(searchField) {
    const compare = createComparison(
        ['skipEmptyTargetValues'],  // стандартные правила по именам
        [rules.searchMultipleFields(searchField, ['date', 'customer', 'seller', 'total'], false)]  // кастомные правила
    );

    return (data, state, action) => {
        return data.filter(row => compare(row, state));
    };
}