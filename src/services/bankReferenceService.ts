import HttpClient from "@/helpers/http-client";

export const getAllBankReferences = async (params = {}) => {
  try {
    const res = await HttpClient.get("/settings/bank-references", { params });
    return res.data.data;
  } catch (error) {
    console.error("Error fetching bank references:", error);
    return { data: [], meta: { total: 0, last_page: 1 } };
  }
};

export const getBankReferenceById = async (id: number) => {
  try {
    const res = await HttpClient.get(`/settings/bank-references/${id}`);
    return res.data.data;
  } catch (error) {
    console.error(`Error fetching bank reference with id ${id}:`, error);
    return null;
  }
};

export const createBankReference = async (data: FormData) => {
  try {
    const res = await HttpClient.post("/settings/bank-references", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.data;
  } catch (error) {
    console.error("Error creating bank reference:", error);
    throw error;
  }
};

export const updateBankReference = async (id: number, data: FormData) => {
  try {
    const res = await HttpClient.post(`/settings/bank-references/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.data;
  } catch (error) {
    console.error(`Error updating bank reference with id ${id}:`, error);
    throw error;
  }
};

export const deleteBankReference = async (id: number) => {
  try {
    await HttpClient.delete(`/settings/bank-references/${id}`);
    return true;
  } catch (error) {
    console.error(`Error deleting bank reference with id ${id}:`, error);
    throw error;
  }
};

export const toggleBankReferenceStatus = async (id: number) => {
  try {
    const res = await HttpClient.patch(`/settings/bank-references/${id}/toggle`);
    return res.data.data;
  } catch (error) {
    console.error(`Error toggling bank reference status with id ${id}:`, error);
    throw error;
  }
};
