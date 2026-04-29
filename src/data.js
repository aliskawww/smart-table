import { makeIndex } from "./lib/utils.js";

const BASE_URL = "https://webinars.webdev.education-services.ru/sp7-api";

export function initData(sourceData) {
  let sellers = null;
  let customers = null;
  let allRecords = null;

  const getIndexes = async () => {
    if (!sellers || !customers) {
      try {
        const sellersResponse = await fetch(`${BASE_URL}/sellers`);
        const customersResponse = await fetch(`${BASE_URL}/customers`);

        if (!sellersResponse.ok || !customersResponse.ok) {
          throw new Error("API response not ok");
        }

        const sellersData = await sellersResponse.json();
        const customersData = await customersResponse.json();

        const sellersArray = Object.values(sellersData);
        const customersArray = Object.values(customersData);

        sellers = {};
        sellersArray.forEach((seller, index) => {
          const id = index + 1;
          sellers[`seller_${id}`] = seller;
          sellers[id] = seller;
        });

        customers = {};
        customersArray.forEach((customer, index) => {
          const id = index + 1;
          customers[`customer_${id}`] = customer;
          customers[id] = customer;
        });
      } catch (error) {
        console.error("API unavailable, falling back to local data:", error);

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
        } else {
          throw error;
        }
      }
    }
    return { sellers, customers };
  };

  const loadAllRecords = async () => {
    if (!allRecords) {
      try {
        const response = await fetch(`${BASE_URL}/records?limit=1000`);

        if (!response.ok) {
          throw new Error("API response not ok");
        }

        const data = await response.json();
        const recordsArray = data.items || [];

        allRecords = recordsArray.map((item) => ({
          id: item.receipt_id,
          date: item.date,
          seller: sellers[item.seller_id] || item.seller_id,
          customer: customers[item.customer_id] || item.customer_id,
          total: item.total_amount,
        }));
      } catch (error) {
        console.error("API unavailable, falling back to local data:", error);

        if (sourceData && sourceData.purchase_records && sellers && customers) {
          allRecords = sourceData.purchase_records.map((item) => ({
            id: item.receipt_id,
            date: item.date,
            seller: sellers[item.seller_id],
            customer: customers[item.customer_id],
            total: item.total_amount,
          }));
        } else {
          throw error;
        }
      }
    }
    return allRecords.map((record) => ({ ...record }));
  };

  const getRecords = async (query = {}) => {
    if (!sellers || !customers) {
      await getIndexes();
    }

    let filteredData = await loadAllRecords();

    if (query.filter && Object.keys(query.filter).length > 0) {
      const filter = query.filter;

      if (filter.date && filter.date !== "") {
        filteredData = filteredData.filter(
          (row) => row.date && row.date.includes(filter.date),
        );
      }

      if (filter.customer && filter.customer !== "") {
        filteredData = filteredData.filter(
          (row) =>
            row.customer &&
            row.customer.toLowerCase().includes(filter.customer.toLowerCase()),
        );
      }

      if (filter.seller && filter.seller !== "") {
        filteredData = filteredData.filter(
          (row) => row.seller === filter.seller,
        );
      }

      if (filter.totalFrom && filter.totalFrom !== "") {
        const from = parseFloat(filter.totalFrom);
        if (!isNaN(from)) {
          filteredData = filteredData.filter((row) => row.total >= from);
        }
      }

      if (filter.totalTo && filter.totalTo !== "") {
        const to = parseFloat(filter.totalTo);
        if (!isNaN(to)) {
          filteredData = filteredData.filter((row) => row.total <= to);
        }
      }
    }

    if (query.search && query.search !== "") {
      const searchLower = query.search.toLowerCase();
      filteredData = filteredData.filter(
        (row) =>
          (row.date && row.date.toLowerCase().includes(searchLower)) ||
          (row.seller && row.seller.toLowerCase().includes(searchLower)) ||
          (row.customer && row.customer.toLowerCase().includes(searchLower)) ||
          row.total.toString().includes(searchLower),
      );
    }

    if (query.sort) {
      const [field, order] = query.sort.split(":");

      filteredData.sort((a, b) => {
        let aVal = a[field];
        let bVal = b[field];

        if (field === "total") {
          aVal = parseFloat(aVal);
          bVal = parseFloat(bVal);
        } else if (field === "date") {
          const aDate = aVal ? new Date(aVal).getTime() : 0;
          const bDate = bVal ? new Date(bVal).getTime() : 0;
          aVal = aDate;
          bVal = bDate;
        }

        if (order === "asc") {
          return aVal > bVal ? 1 : -1;
        } else {
          return aVal < bVal ? 1 : -1;
        }
      });
    }

    const total = filteredData.length;
    const limit = parseInt(query.limit) || 10;
    const page = parseInt(query.page) || 1;
    const start = (page - 1) * limit;
    const items = filteredData.slice(start, start + limit);

    return { total, items };
  };

  return {
    getIndexes,
    getRecords,
  };
}
