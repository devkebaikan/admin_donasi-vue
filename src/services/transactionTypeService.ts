import HttpClient from "@/helpers/http-client";

export const getAllTransactionType = async (params = {}) => {
  try {
    const res = await HttpClient.get("/admin/transaction-types", { params });
    return res.data.data;
  } catch (error) {
    console.error("Error fetching transaction type:", error);
    return { data: [], meta: { total: 0, last_page: 1 } };
  }
};
