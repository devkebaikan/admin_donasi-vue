import HttpClient from "@/helpers/http-client";

// fetch all default nominal
export const getALlNominal = async (params = {}) => {
  try {
    const res = await HttpClient.get("/default-nominal", { params });
    return res.data.data;
  } catch (error) {
    console.error("Error fetching all default nominal:", error);
    return { data: [], meta: { total: 0, last_page: 1 } };
  }
};

// fetch deafault nominal by id
export const getNominalById = async (id: number) => {
  try {
    const res = await HttpClient.get(`/default-nominal/${id}`);
    return res.data.data;
  } catch (error) {
    console.error(`Error fetching default nominal with id ${id}:`, error);
    return null;
  }
};

// create new default nominal
export const createNominal = async (data: {
  nama_pilihan: string;
  nominal: number;
}) => {
  try {
    const res = await HttpClient.post("/default-nominal", data);
    return res.data.data;
  } catch (error) {
    console.error("Error creating default nominal:", error);
    throw error;
  }
};

// update default nominal by id
export const updateNominal = async (
  id: number,
  data: { nama_pilihan: string; nominal: number },
) => {
  try {
    const res = await HttpClient.put(`/default-nominal/${id}`, data);
    return res.data.data;
  } catch (error) {
    console.error(`Error updating default nominal with id ${id}:`, error);
    throw error;
  }
};

// delete default nominal by id
export const deleteNominal = async (id: number) => {
  try {
    const res = await HttpClient.delete(`/default-nominal/${id}`);
    return res.data.data;
  } catch (error) {
    console.error(`Error deleting default nominal with id ${id}:`, error);
    throw error;
  }
};
