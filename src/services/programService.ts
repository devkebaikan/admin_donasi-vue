import HttpClient from "@/helpers/http-client";

// Fetch all programs
export const getAllPrograms = async (params = {}) => {
  try {
    const res = await HttpClient.get("/programs", { params });
    return res.data.data;
  } catch (error) {
    console.error("Error fetching all programs:", error);
    return [];
  }
};

// Fetch program by ID
export const getProgramBylink = async (link: string) => {
  try {
    const res = await HttpClient.get(`/programs/link/${link}`);
    return res.data.data;
  } catch (error) {
    console.error(`Error fetching program with link ${link}:`, error);
    return null;
  }
};

// create a new program
export const createProgram = async (programData: any) => {
  try {
    const res = await HttpClient.post("/programs", programData);
    return res.data.data;
  } catch (error) {
    console.error("Error creating program:", error);
    throw error;
  }
};

// update program by id
export const updateProgram = async (id: number, programData: any) => {
  try {
    const res = await HttpClient.put(`/programs/${id}`, programData);
    return res.data.data;
  } catch (error) {
    console.error(`Error updating program with id ${id}:`, error);
    throw error;
  }
};

// delete program by ID
export const deleteProgram = async (id: number) => {
  try {
    await HttpClient.delete(`/programs/${id}`);
    return true;
  } catch (error) {
    console.error(`Error deleting program with id ${id}:`, error);
    throw error;
  }
};

// fetch all program categories
export const getProgramCategories = async () => {
  try {
    const res = await HttpClient.get("/program-categories");
    return res.data.data;
  } catch (error) {
    console.error("Error fetching program categories:", error);
    return [];
  }
};

// fetch all program types
export const getProgramTypes = async (params = {}) => {
  try {
    const res = await HttpClient.get("/program/tipe", { params });
    return res.data.data;
  } catch (error) {
    console.error("Error fetching program types:", error);
    return [];
  }
};

export const getProgramTypeById = async (id: number) => {
  try {
    const res = await HttpClient.get(`/program/tipe/${id}`);
    return res.data.data;
  } catch (error) {
    console.error(`Error fetching program type with id ${id}:`, error);
    return null;
  }
};

export const createProgramType = async (data: Record<string, any>) => {
  try {
    const res = await HttpClient.post("/program/tipe", data);
    return res.data.data;
  } catch (error) {
    console.error("Error creating program type:", error);
    throw error;
  }
};

export const updateProgramType = async (
  id: number,
  data: Record<string, any>,
) => {
  try {
    const res = await HttpClient.put(`/program/tipe/${id}`, data);
    return res.data.data;
  } catch (error) {
    console.error(`Error updating program type with id ${id}:`, error);
    throw error;
  }
};

export const deleteProgramType = async (id: number) => {
  try {
    await HttpClient.delete(`/program/tipe/${id}`);
    return true;
  } catch (error) {
    console.error(`Error deleting program type with id ${id}:`, error);
    throw error;
  }
};

// fetch all program percentages
export const getProgramPercentages = async (params = {}) => {
  try {
    const res = await HttpClient.get("/program-percentage", { params });
    return res.data.data;
  } catch (error) {
    console.error("Error fetching program percentages:", error);
    return [];
  }
};
