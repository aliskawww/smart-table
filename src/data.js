const BASE_URL = "https://webinars.webdev.education-services.ru/sp7-api";

export function initData() {
  let sellersMap = null;
  let customersMap = null;
  let allRecords = null;

  const getIndexes = async () => {
    if (!sellersMap || !customersMap) {
      try {
        const sellersResponse = await fetch(`${BASE_URL}/sellers`);
        const customersResponse = await fetch(`${BASE_URL}/customers`);
        
        const sellersData = await sellersResponse.json();
        const customersData = await customersResponse.json();
        
        sellersMap = {};
        Object.keys(sellersData).forEach(key => {
          const match = key.match(/\d+/);
          if (match) {
            const id = parseInt(match[0], 10);
            sellersMap[`seller_${id}`] = sellersData[key];
            sellersMap[id] = sellersData[key];
          }
        });
        
        customersMap = {};
        Object.keys(customersData).forEach(key => {
          const match = key.match(/\d+/);
          if (match) {
            const id = parseInt(match[0], 10);
            customersMap[`customer_${id}`] = customersData[key];
            customersMap[id] = customersData[key];
          }
        });
      } catch (error) {
        console.error("Failed to fetch indexes:", error);
        throw error;
      }
    }

    return { sellers: sellersMap, customers: customersMap };
  };

  const loadAllRecords = async () => {
    if (!allRecords) {
      try {
        const response = await fetch(`${BASE_URL}/records?limit=1000`);
        const data = await response.json();
        const recordsArray = data.items || [];
        
        allRecords = recordsArray.map((item) => ({
          id: item.receipt_id,
          date: item.date,
          seller: sellersMap[item.seller_id] || item.seller_id,
          customer: customersMap[item.customer_id] || item.customer_id,
          total: item.total_amount,
        }));
      } catch (error) {
        console.error("Failed to load records:", error);
        throw error;
      }
    }
    return allRecords.map(record => ({ ...record }));
  };

  const getRecords = async (query = {}, isUpdated = false) => {
    if (!sellersMap || !customersMap) {
      await getIndexes();
    }
    
    let filteredData = await loadAllRecords();
    
    // 1. СНАЧАЛА применяем фильтры (date, customer, seller, totalFrom, totalTo)
    if (query.filter && Object.keys(query.filter).length > 0) {
      const filter = query.filter;
      
      if (filter.date && filter.date !== '') {
        filteredData = filteredData.filter(row => row.date && row.date.includes(filter.date));
        console.log(`After date filter "${filter.date}": ${filteredData.length} rows`);
      }
      
      if (filter.customer && filter.customer !== '') {
        filteredData = filteredData.filter(row => 
          row.customer && row.customer.toLowerCase().includes(filter.customer.toLowerCase())
        );
        console.log(`After customer filter "${filter.customer}": ${filteredData.length} rows`);
      }
      
      if (filter.seller && filter.seller !== '') {
        filteredData = filteredData.filter(row => row.seller === filter.seller);
        console.log(`After seller filter "${filter.seller}": ${filteredData.length} rows`);
      }
      
      if (filter.totalFrom && filter.totalFrom !== '') {
        const from = parseFloat(filter.totalFrom);
        if (!isNaN(from)) {
          filteredData = filteredData.filter(row => row.total >= from);
        }
      }
      
      if (filter.totalTo && filter.totalTo !== '') {
        const to = parseFloat(filter.totalTo);
        if (!isNaN(to)) {
          filteredData = filteredData.filter(row => row.total <= to);
        }
      }
    }
    
    // 2. ЗАТЕМ применяем поиск (search) - ищет по всем полям
    if (query.search && query.search !== '') {
      const searchLower = query.search.toLowerCase();
      filteredData = filteredData.filter(row =>
        (row.date && row.date.toLowerCase().includes(searchLower)) ||
        (row.seller && row.seller.toLowerCase().includes(searchLower)) ||
        (row.customer && row.customer.toLowerCase().includes(searchLower)) ||
        row.total.toString().includes(searchLower)
      );
      console.log(`After search "${query.search}": ${filteredData.length} rows`);
    }
    
    // 3. ПОСЛЕДНЕЙ применяем сортировку
    if (query.sort) {
      const [field, order] = query.sort.split(':');
      console.log(`Sorting by ${field} in ${order} order on ${filteredData.length} rows`);
      
      filteredData.sort((a, b) => {
        let aVal = a[field];
        let bVal = b[field];
        
        if (field === 'total') {
          aVal = parseFloat(aVal);
          bVal = parseFloat(bVal);
        } else if (field === 'date') {
          const aDate = aVal && aVal.length >= 10 ? new Date(aVal).getTime() : null;
          const bDate = bVal && bVal.length >= 10 ? new Date(bVal).getTime() : null;
          
          if (aDate === null && bDate === null) return 0;
          if (aDate === null) return 1;
          if (bDate === null) return -1;
          
          aVal = aDate;
          bVal = bDate;
        }
        
        if (order === 'asc') {
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
    
    console.log(`Final: returning ${items.length} items out of ${total} total`);
    
    return { total, items };
  };

  return {
    getIndexes,
    getRecords,
  };
}