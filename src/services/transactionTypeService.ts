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

export const getTransactionTypeById = async (id: number) => {
  try {
    const res = await HttpClient.get(`/admin/transaction-types/${id}`);
    return res.data.data;
  } catch (error) {
    console.error(`Error fetching transaction type with id ${id}:`, error);
    return null;
  }
};

export const createTransactionType = async (data: Record<string, any>) => {
  try {
    const res = await HttpClient.post("/admin/transaction-types", data);
    return res.data.data;
  } catch (error) {
    console.error("Error creating transaction type:", error);
    throw error;
  }
};

export const updateTransactionType = async (
  id: number,
  data: Record<string, any>,
) => {
  try {
    const res = await HttpClient.put(`/admin/transaction-types/${id}`, data);
    return res.data.data;
  } catch (error) {
    console.error(`Error updating transaction type with id ${id}:`, error);
    throw error;
  }
};

export const deleteTransactionType = async (id: number) => {
  try {
    await HttpClient.delete(`/admin/transaction-types/${id}`);
    return true;
  } catch (error) {
    console.error(`Error deleting transaction type with id ${id}:`, error);
    throw error;
  }
};
