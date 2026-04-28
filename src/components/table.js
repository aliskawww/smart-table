import { cloneTemplate } from "../lib/utils.js";

export function initTable(settings, onAction) {
  const { tableTemplate, rowTemplate, before, after } = settings;
  const root = cloneTemplate(tableTemplate);

  if (before && Array.isArray(before)) {
    before.reverse().forEach((subName) => {
      root[subName] = cloneTemplate(subName);
      root.container.prepend(root[subName].container);
    });
  }

  if (after && Array.isArray(after)) {
    after.forEach((subName) => {
      root[subName] = cloneTemplate(subName);
      root.container.append(root[subName].container);
    });
  }

  root.container.addEventListener("change", () => {
    onAction();
  });

  root.container.addEventListener("reset", () => {
    setTimeout(() => onAction(), 0);
  });

  root.container.addEventListener("submit", (e) => {
    e.preventDefault();
    onAction(e.submitter);
  });

  const render = (data) => {
    const nextRows = data.map((item) => {
      const row = cloneTemplate(rowTemplate);

      Object.keys(item).forEach((key) => {
        if (row.elements[key]) {
          const element = row.elements[key];
          const value = item[key];

          if (element.tagName === "INPUT" || element.tagName === "SELECT") {
            element.value = value;
          } else {
            element.textContent = value;
          }
        }
      });

      return row.container;
    });

    root.elements.rows.replaceChildren(...nextRows);
  };

  return { ...root, render };
}
