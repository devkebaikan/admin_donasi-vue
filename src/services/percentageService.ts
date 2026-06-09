import HttpClient from "@/helpers/http-client";

// Fetch all percentages (paginated)
export const getAllPercentage = async (params = {}) => {
  try {
    const res = await HttpClient.get("/program-percentage", { params });
    return res.data.data;
  } catch (error) {
    console.error("Error fetching all percentage:", error);
    return { data: [], meta: { total: 0, last_page: 1 } };
  }
};

// Fetch percentage by ID
export const getPercentageById = async (id: number) => {
  try {
    const res = await HttpClient.get(`/program-percentage/${id}`);
    return res.data.data;
  } catch (error) {
    console.error(`Error fetching percentage with id ${id}:`, error);
    return null;
  }
};

// Create a new percentage
export const createPercentage = async (data: {
  name: string;
  program: number;
  operasional: number;
  komisi: number;
}) => {
  try {
    const res = await HttpClient.post("/program-percentage", data);
    return res.data.data;
  } catch (error) {
    console.error("Error creating percentage:", error);
    throw error;
  }
};

// Update percentage by ID
export const updatePercentage = async (
  id: number,
  data: { name: string; program: number; operasional: number; komisi: number },
) => {
  try {
    const res = await HttpClient.put(`/program-percentage/${id}`, data);
    return res.data.data;
  } catch (error) {
    console.error(`Error updating percentage with id ${id}:`, error);
    throw error;
  }
};

// Delete percentage by ID
export const deletePercentage = async (id: number) => {
  try {
    await HttpClient.delete(`/program-percentage/${id}`);
    return true;
  } catch (error) {
    console.error(`Error deleting percentage with id ${id}:`, error);
    throw error;
  }
};
