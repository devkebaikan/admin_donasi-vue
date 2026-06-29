import HttpClient from "@/helpers/http-client";

export const getProjects = async (params = {}) => {
  try {
    const res = await HttpClient.get("/program/project-program", { params });
    return res.data.data;
  } catch (error) {
    console.error("Error fetching projects:", error);
    return { data: [], meta: { total: 0, last_page: 1 } };
  }
};

export const getProjectById = async (id: number) => {
  try {
    const res = await HttpClient.get(`/program/project-program/${id}`);
    return res.data.data;
  } catch (error) {
    console.error(`Error fetching project with id ${id}:`, error);
    return null;
  }
};

export const createProject = async (data: any) => {
  try {
    const res = await HttpClient.post("/program/project-program", data);
    return res.data.data;
  } catch (error) {
    console.error("Error creating project:", error);
    throw error;
  }
};

export const updateProject = async (id: number, data: any) => {
  try {
    const res = await HttpClient.put(`/program/project-program/${id}`, data);
    return res.data.data;
  } catch (error) {
    console.error(`Error updating project with id ${id}:`, error);
    throw error;
  }
};

export const deleteProject = async (id: number) => {
  try {
    await HttpClient.delete(`/program/project-program/${id}`);
    return true;
  } catch (error) {
    console.error(`Error deleting project with id ${id}:`, error);
    throw error;
  }
};
