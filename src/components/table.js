import { cloneTemplate } from "../lib/utils.js";

export function initTable(settings, onAction) {
  const { tableTemplate, rowTemplate, before, after } = settings;
  const root = cloneTemplate(tableTemplate);

  // Добавляем дополнительные шаблоны
  if (before && Array.isArray(before)) {
    [...before].reverse().forEach((subName) => {
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

  // Обработка событий
  root.container.addEventListener("change", () => onAction());
  root.container.addEventListener("reset", () =>
    setTimeout(() => onAction(), 0),
  );
  root.container.addEventListener("submit", (e) => {
    e.preventDefault();
    onAction(e.submitter);
  });

  const render = (data) => {
    const rowsContainer = root.container.querySelector('[data-name="rows"]');

    if (!rowsContainer) {
      console.error("Контейнер rows не найден!");
      return;
    }

    if (!data || data.length === 0) {
      rowsContainer.innerHTML = '<div class="empty-row">Нет данных</div>';
      return;
    }

    const nextRows = data.map((item) => {
      const row = cloneTemplate(rowTemplate);

      // Заполняем ячейки
      const dateCell = row.container.querySelector('[data-name="date"]');
      const customerCell = row.container.querySelector(
        '[data-name="customer"]',
      );
      const sellerCell = row.container.querySelector('[data-name="seller"]');
      const totalCell = row.container.querySelector('[data-name="total"]');

      if (dateCell) dateCell.textContent = item.date || "";
      if (customerCell) customerCell.textContent = item.customer || "";
      if (sellerCell) sellerCell.textContent = item.seller || "";
      if (totalCell) totalCell.textContent = item.total || "";

      row.container.setAttribute("data-testid", "table-row");
      row.container.setAttribute("role", "row");

      const cells = row.container.querySelectorAll("[data-name]");
      cells.forEach((cell) => {
        cell.setAttribute("role", "cell");
      });

      return row.container;
    });

    console.log("Всего создано строк:", nextRows.length);
    rowsContainer.replaceChildren(...nextRows);
  };

  return { ...root, render };
}
