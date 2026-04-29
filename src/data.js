import { makeIndex } from "./lib/utils.js";

const BASE_URL = "https://webinars.webdev.education-services.ru/sp7-api";

export function initData() {
  let sellers = null;
  let customers = null;
  let lastResult = null;
  let lastQuery = null;

  const mapRecords = (data, sellersMap, customersMap) =>
    data.map((item) => ({
      id: item.receipt_id,
      date: item.date,
      seller: sellersMap[item.seller_id],
      customer: customersMap[item.customer_id],
      total: item.total_amount,
    }));

  const getIndexes = async () => {
    if (!sellers || !customers) {
      try {
        const [sellersData, customersData] = await Promise.all([
          fetch(`${BASE_URL}/sellers`).then((res) => res.json()),
          fetch(`${BASE_URL}/customers`).then((res) => res.json()),
        ]);

        sellers = makeIndex(
          sellersData,
          "id",
          (v) => `${v.first_name} ${v.last_name}`,
        );
        customers = makeIndex(
          customersData,
          "id",
          (v) => `${v.first_name} ${v.last_name}`,
        );
      } catch (error) {
        console.error("Failed to fetch indexes:", error);
        throw error;
      }
    }

    return { sellers, customers };
  };

  const getRecords = async (query = {}, isUpdated = false) => {
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
        items: mapRecords(records.items, sellers, customers),
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
