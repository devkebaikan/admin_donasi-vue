import HttpClient from "@/helpers/http-client";

export const getFinanceAccounts = async (params = {}) => {
  try {
    const res = await HttpClient.get("/finance/akun", { params });
    return res.data.data;
  } catch (error) {
    console.error("Error fetching finance accounts:", error);
    return { data: [], meta: { total: 0, last_page: 1 } };
  }
};

export const getFinanceAccountById = async (id: number) => {
  try {
    const res = await HttpClient.get(`/finance/akun/${id}`);
    return res.data.data;
  } catch (error) {
    console.error(`Error fetching finance account with id ${id}:`, error);
    return null;
  }
};

export const createFinanceAccount = async (data: any) => {
  try {
    const res = await HttpClient.post("/finance/akun", data);
    return res.data.data;
  } catch (error) {
    console.error("Error creating finance account:", error);
    throw error;
  }
};

export const updateFinanceAccount = async (id: number, data: any) => {
  try {
    const res = await HttpClient.put(`/finance/akun/${id}`, data);
    return res.data.data;
  } catch (error) {
    console.error(`Error updating finance account with id ${id}:`, error);
    throw error;
  }
};

export const deleteFinanceAccount = async (id: number) => {
  try {
    await HttpClient.delete(`/finance/akun/${id}`);
    return true;
  } catch (error) {
    console.error(`Error deleting finance account with id ${id}:`, error);
    throw error;
  }
};
