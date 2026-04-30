export function initFiltering(elements) {
  const updateIndexes = (elements, indexes) => {
    Object.keys(indexes).forEach((elementName) => {
      const select = elements[elementName];
      const index = indexes[elementName];

      if (!select || !index) return;

      while (select.options.length > 1) select.remove(1);

      const uniq = new Set(
        Object.values(index)
          .map((v) => String(v ?? "").trim())
          .filter(Boolean),
      );

      select.append(
        ...Array.from(uniq).map((name) => {
          const el = document.createElement("option");
          el.textContent = name;
          el.value = name;
          return el;
        }),
      );
    });
  };

  const applyFiltering = (query, state, action) => {
    if (action && action.name === "clear") {
      const parent = action.closest(".filter-field");
      const input = parent?.querySelector("input, select");
      if (input) input.value = "";
    }

    const next = { ...query };
    Object.keys(next).forEach((key) => {
      if (key.startsWith("filter[")) delete next[key];
    });

    const normalizeDateFilter = (raw) => {
      const v = String(raw ?? "").trim();
      if (!v) return null;

      if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
      if (/^\d{4}-\d{2}-\*$/.test(v)) return v;
      if (/^\d{4}-\*-\*$/.test(v)) return v;

      if (/^\d{4}-\d{2}$/.test(v)) return `${v}-*`;

      if (/^\d{4}$/.test(v)) return `${v}-*-*`;

      return null;
    };

    const filter = {};
    Object.keys(elements).forEach((key) => {
      const el = elements[key];
      if (!el) return;

      if (!["INPUT", "SELECT"].includes(el.tagName)) return;

      const value = String(el.value ?? "").trim();
      if (!value) return;

      // специальная обработка даты под требования API
      if (el.name === "date") {
        const normalized = normalizeDateFilter(value);
        if (normalized) filter[`filter[${el.name}]`] = normalized;
        return;
      }

      filter[`filter[${el.name}]`] = value;
    });

    return Object.keys(filter).length ? Object.assign({}, next, filter) : next;
  };

  return {
    updateIndexes,
    applyFiltering,
  };
}
