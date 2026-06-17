import HttpClient from "@/helpers/http-client";

export const getAllAccountMaster = async (params = {}) => {
  try {
    const res = await HttpClient.get("/finance/akun-master", { params });
    return res.data.data;
  } catch (error) {
    console.error("Error fetching finance account master", error);
    return { data: [], meta: { total: 0, last_page: 1 } };
  }
};

export const getAccountMasterById = async (id: number) => {
  try {
    const res = await HttpClient.get(`/finance/akun-master/${id}`);
    return res.data.data;
  } catch (error) {
    console.error(`Error fetching account master with id ${id}:`, error);
    return null;
  }
};

export const updateAccountMaster = async (id: number, data: any) => {
  try {
    const res = await HttpClient.put(`/finance/akun-master/${id}`, data);
    return res.data.data;
  } catch (error) {
    console.error(`Error updating account master with id ${id}:`, error);
    throw error;
  }
};
