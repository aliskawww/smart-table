import { makeIndex } from "./lib/utils.js";

const BASE_URL = "https://webinars.webdev.education-services.ru/sp7-api";

export function initData(sourceData) {
  let sellers = null;
  let customers = null;
  let lastResult = null;
  let lastQuery = null;

  const mapRecords = (data) =>
    data.map((item) => ({
      id: item.receipt_id,
      date: item.date,
      seller: sellers[item.seller_id],
      customer: customers[item.customer_id],
      total: item.total_amount,
    }));

  const getIndexes = async () => {
    if (sourceData && sourceData.sellers && sourceData.customers) {
      sellers = makeIndex(
        sourceData.sellers,
        "id",
        (v) => `${v.first_name} ${v.last_name}`,
      );
      customers = makeIndex(
        sourceData.customers,
        "id",
        (v) => `${v.first_name} ${v.last_name}`,
      );
      return { sellers, customers };
    }

    if (!sellers || !customers) {
      try {
        [sellers, customers] = await Promise.all([
          fetch(`${BASE_URL}/sellers`).then((res) => res.json()),
          fetch(`${BASE_URL}/customers`).then((res) => res.json()),
        ]);
      } catch (error) {
        console.error("Failed to fetch indexes:", error);
        throw error;
      }
    }

    return { sellers, customers };
  };

  const getRecords = async (query = {}, isUpdated = false) => {
    if (sourceData && sourceData.purchase_records && sellers && customers) {
      let data = sourceData.purchase_records.map((item) => ({
        id: item.receipt_id,
        date: item.date,
        seller: sellers[item.seller_id],
        customer: customers[item.customer_id],
        total: item.total_amount,
      }));

      // Применяем поиск
      if (query.search) {
        const searchLower = query.search.toLowerCase();
        data = data.filter(
          (row) =>
            row.date.toLowerCase().includes(searchLower) ||
            (row.seller && row.seller.toLowerCase().includes(searchLower)) ||
            (row.customer &&
              row.customer.toLowerCase().includes(searchLower)) ||
            row.total.toString().includes(searchLower),
        );
      }

      // Применяем фильтры
      if (query.filter) {
        Object.keys(query.filter).forEach((key) => {
          const value = query.filter[key];
          if (value !== undefined && value !== null && value !== "") {
            if (key === "date") {
              data = data.filter((row) => row.date.includes(value));
            } else if (key === "customer") {
              data = data.filter((row) =>
                row.customer.toLowerCase().includes(value.toLowerCase()),
              );
            } else if (key === "searchBySeller" || key === "seller") {
              data = data.filter((row) => row.seller === value);
            } else if (key === "total") {
              const numValue = parseFloat(value);
              if (!isNaN(numValue)) {
                data = data.filter((row) => row.total === numValue);
              }
            } else if (key === "totalFrom") {
              const numValue = parseFloat(value);
              if (!isNaN(numValue)) {
                data = data.filter((row) => row.total >= numValue);
              }
            } else if (key === "totalTo") {
              const numValue = parseFloat(value);
              if (!isNaN(numValue)) {
                data = data.filter((row) => row.total <= numValue);
              }
            }
          }
        });
      }

      // Сортируем данные
      if (query.sort) {
        const [field, order] = query.sort.split(":");

        // Преобразуем 'up' и 'down' в 'asc' и 'desc'
        let sortOrder = order;
        if (order === "up") sortOrder = "asc";
        if (order === "down") sortOrder = "desc";

        data.sort((a, b) => {
          let aVal = a[field];
          let bVal = b[field];

          // Для total преобразуем в число
          if (field === "total") {
            aVal = parseFloat(aVal);
            bVal = parseFloat(bVal);
          }
          // Для date - сравниваем как строки (формат YYYY-MM-DD корректно сравнивается)
          else if (field === "date") {
            aVal = aVal;
            bVal = bVal;
          }
          // Для customer и seller - сравниваем как строки
          else if (field === "customer" || field === "seller") {
            aVal = aVal || "";
            bVal = bVal || "";
          }

          // Сравнение с учетом регистра для строк
          if (sortOrder === "asc") {
            if (aVal < bVal) return -1;
            if (aVal > bVal) return 1;
            return 0;
          } else {
            if (aVal > bVal) return -1;
            if (aVal < bVal) return 1;
            return 0;
          }
        });
      } else {
        // Сортировка по умолчанию по id
        data.sort((a, b) => a.id - b.id);
      }

      const total = data.length;
      const limit = parseInt(query.limit) || 10;
      const page = parseInt(query.page) || 1;
      const start = (page - 1) * limit;
      const items = data.slice(start, start + limit);

      return { total, items };
    }

    // Для реального API
    const qs = new URLSearchParams(query);
    const nextQuery = qs.toString();

    if (lastQuery === nextQuery && !isUpdated) {
      return lastResult;
    }

    try {
      const response = await fetch(`${BASE_URL}/records?${nextQuery}`);
      const records = await response.json();

      lastQuery = nextQuery;
      lastResult = {
        total: records.total,
        items: mapRecords(records.items),
      };

      return lastResult;
    } catch (error) {
      console.error("Failed to fetch records:", error);
      throw error;
    }
  };

  return {
    getIndexes,
    getRecords,
  };
}
