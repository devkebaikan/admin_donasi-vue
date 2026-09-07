import HttpClient from "@/helpers/http-client";

// Fetch all tema (paginated)
export const getAllTema = async (params = {}) => {
  try {
    const res = await HttpClient.get("/program-themes", { params });
    return res.data.data;
  } catch (error) {
    console.error("Error fetching all temas:", error);
    return { data: [], meta: { total: 0, last_page: 1 } };
  }
};

// Fetch tema by ID
export const getTemaById = async (id: number) => {
  try {
    const res = await HttpClient.get(`/program-themes/${id}`);
    return res.data.data;
  } catch (error) {
    console.error(`Error fetching tema with id ${id}:`, error);
    return null;
  }
};

// Create a new tema
export const createTema = async (temaData: any) => {
  try {
    const res = await HttpClient.post("/program-themes", temaData);
    return res.data.data;
  } catch (error) {
    console.error("Error creating tema:", error);
    throw error;
  }
};

// Update tema by ID
export const updateTema = async (id: number, temaData: any) => {
  try {
    const res = await HttpClient.put(`/program-themes/${id}`, temaData);
    return res.data.data;
  } catch (error) {
    console.error(`Error updating tema with id ${id}:`, error);
    throw error;
  }
};

// Delete tema by ID
export const deleteTema = async (id: number) => {
  try {
    await HttpClient.delete(`/program-themes/${id}`);
    return true;
  } catch (error) {
    console.error(`Error deleting tema with id ${id}:`, error);
    throw error;
  }
};

// Attach / Add programs to tema
export const attachProgramsToTema = async (
  id: number,
  data: { program_ids: number[] },
) => {
  try {
    const res = await HttpClient.post(`/program-themes/${id}/programs`, data);
    return res.data;
  } catch (error) {
    console.error(`Error attaching programs to tema with id ${id}:`, error);
    throw error;
  }
};

// Detach / Delete a program from tema
export const deleteProgramFromTema = async (
  temaId: number,
  programId: number,
) => {
  try {
    const res = await HttpClient.delete(
      `/program-themes/${temaId}/programs/${programId}`,
    );
    return res.data;
  } catch (error) {
    console.error(
      `Error deleting program ${programId} from tema ${temaId}:`,
      error,
    );
    throw error;
  }
};
