import HttpClient from "@/helpers/http-client";

export const getAllReports = async (params = {}) => {
  try {
    const res = await HttpClient.get("/program/project-laporan", { params });
    return res.data.data;
  } catch (error) {
    console.error("Error fetching reports:", error);
    return { data: [], meta: { total: 0, last_page: 1 } };
  }
};

export const getReportById = async (id: number) => {
  try {
    const res = await HttpClient.get(`/program/project-laporan/${id}`);
    return res.data.data;
  } catch (error) {
    console.error(`Error fetching report with id ${id}:`, error);
    return null;
  }
};

export const createReport = async (data: FormData) => {
  try {
    const res = await HttpClient.post("/program/project-laporan", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.data;
  } catch (error) {
    console.error("Error creating report:", error);
    throw error;
  }
};

export const updateReport = async (id: number, data: FormData) => {
  try {
    const res = await HttpClient.put(`/program/project-laporan/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.data;
  } catch (error) {
    console.error(`Error updating report with id ${id}:`, error);
    throw error;
  }
};

export const deleteReport = async (id: number) => {
  try {
    await HttpClient.delete(`/program/project-laporan/${id}`);
    return true;
  } catch (error) {
    console.error(`Error deleting report with id ${id}:`, error);
    throw error;
  }
};
