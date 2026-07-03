import HttpClient from "@/helpers/http-client";

export const getAllKegiatan = async (params = {}) => {
  try {
    const res = await HttpClient.get("/program/kegiatan", { params });
    return res.data.data;
  } catch (error) {
    console.error("Error fetching kegiatans:", error);
    return { data: [], meta: { total: 0, last_page: 1 } };
  }
};

export const getKegiatanByProjectId = async (params = {}) => {
  try {
    const res = await HttpClient.get(`/program/kegiatan/project`, { params });
    return res.data.data;
  } catch (error) {
    console.error("Error fetching kegiatans:", error);
    return { data: [], meta: { total: 0, last_page: 1 } };
  }
};

export const getKegiatanById = async (id: number) => {
  try {
    const res = await HttpClient.get(`/program/kegiatan/${id}`);
    return res.data.data;
  } catch (error) {
    console.error(`Error fetching kegiatan with id ${id}:`, error);
    return null;
  }
};

export const createKegiatan = async (data: FormData) => {
  try {
    const res = await HttpClient.post("/program/kegiatan", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.data;
  } catch (error) {
    console.error("Error creating kegiatan:", error);
    throw error;
  }
};

export const updateKegiatan = async (id: number, data: FormData) => {
  try {
    const res = await HttpClient.put(`/program/kegiatan/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.data;
  } catch (error) {
    console.error(`Error updating kegiatan with id ${id}:`, error);
    throw error;
  }
};

export const deleteKegiatan = async (id: number) => {
  try {
    await HttpClient.delete(`/program/kegiatan/${id}`);
    return true;
  } catch (error) {
    console.error(`Error deleting kegiatan with id ${id}:`, error);
    throw error;
  }
};
