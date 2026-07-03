import HttpClient from "@/helpers/http-client";

export const getAllKeuangan = async (params = {}) => {
  try {
    const res = await HttpClient.get("/program/project-keuangan", { params });
    return res.data.data;
  } catch (error) {
    console.error("Error fetching project keuangan:", error);
    return { data: [], meta: { total: 0, last_page: 1 } };
  }
};

export const getKeuanganById = async (id: number) => {
  try {
    const res = await HttpClient.get(`/program/project-keuangan/${id}`);
    return res.data.data;
  } catch (error) {
    console.error(`Error fetching keuangan with id ${id}:`, error);
    return null;
  }
};

export const createKeuangan = async (data: Record<string, any>) => {
  try {
    const res = await HttpClient.post("/program/project-keuangan", data);
    return res.data.data;
  } catch (error) {
    console.error("Error creating keuangan:", error);
    throw error;
  }
};

export const updateKeuangan = async (id: number, data: Record<string, any>) => {
  try {
    const res = await HttpClient.put(`/program/project-keuangan/${id}`, data);
    return res.data.data;
  } catch (error) {
    console.error(`Error updating keuangan with id ${id}:`, error);
    throw error;
  }
};

export const deleteKeuangan = async (id: number) => {
  try {
    await HttpClient.delete(`/program/project-keuangan/${id}`);
    return true;
  } catch (error) {
    console.error(`Error deleting keuangan with id ${id}:`, error);
    throw error;
  }
};
