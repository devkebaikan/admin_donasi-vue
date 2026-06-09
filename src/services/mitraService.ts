import HttpClient from "@/helpers/http-client";

// Fetch all mitra (paginated)
export const getAllMitra = async (params = {}) => {
  try {
    const res = await HttpClient.get("/mitras", { params });
    return res.data.data;
  } catch (error) {
    console.error("Error fetching all mitras:", error);
    return { data: [], meta: { total: 0, last_page: 1 } };
  }
};

// Fetch mitra by ID
export const getMitraById = async (id: number) => {
  try {
    const res = await HttpClient.get(`/mitras/${id}`);
    return res.data.data;
  } catch (error) {
    console.error(`Error fetching mitra with id ${id}:`, error);
    return null;
  }
};

// Create a new mitra
export const createMitra = async (mitraData: any) => {
  try {
    const res = await HttpClient.post("/mitras", mitraData);
    return res.data.data;
  } catch (error) {
    console.error("Error creating mitra:", error);
    throw error;
  }
};

// Update mitra by ID
export const updateMitra = async (id: number, mitraData: any) => {
  try {
    const res = await HttpClient.put(`/mitras/${id}`, mitraData);
    return res.data.data;
  } catch (error) {
    console.error(`Error updating mitra with id ${id}:`, error);
    throw error;
  }
};

// Delete mitra by ID
export const deleteMitra = async (id: number) => {
  try {
    await HttpClient.delete(`/mitras/${id}`);
    return true;
  } catch (error) {
    console.error(`Error deleting mitra with id ${id}:`, error);
    throw error;
  }
};

// Update mitra status by ID
export const updateMitraStatus = async (id: number, status: string) => {
  try {
    const res = await HttpClient.patch(`/mitras/${id}/status`, {
      data: { status },
    });
    return res.data.data;
  } catch (error) {
    console.error(`Error updating status of mitra with id ${id}:`, error);
    throw error;
  }
};
