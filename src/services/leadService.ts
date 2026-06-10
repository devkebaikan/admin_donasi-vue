import HttpClient from "@/helpers/http-client";

export const getAllLeads = async (params = {}) => {
  try {
    const res = await HttpClient.get("/settings/leads", { params });
    return res.data.data;
  } catch (error) {
    console.error("Error fetching leads:", error);
    return { data: [], meta: { total: 0, last_page: 1 } };
  }
};

export const getLeadById = async (id: number) => {
  try {
    const res = await HttpClient.get(`/settings/leads/${id}`);
    return res.data.data;
  } catch (error) {
    console.error(`Error fetching lead with id ${id}:`, error);
    return null;
  }
};

export const getLeadTypes = async () => {
  try {
    const res = await HttpClient.get("/settings/leads/types");
    return res.data.data as { label: string; value: string }[];
  } catch (error) {
    console.error("Error fetching lead types:", error);
    return [];
  }
};

export const createLead = async (data: {
  code: string;
  name: string;
  type: string;
}) => {
  try {
    const res = await HttpClient.post("/settings/leads", data);
    return res.data.data;
  } catch (error) {
    console.error("Error creating lead:", error);
    throw error;
  }
};

export const updateLead = async (
  id: number,
  data: { code: string; name: string; type: string },
) => {
  try {
    const res = await HttpClient.put(`/settings/leads/${id}`, data);
    return res.data.data;
  } catch (error) {
    console.error(`Error updating lead with id ${id}:`, error);
    throw error;
  }
};

export const deleteLead = async (id: number) => {
  try {
    await HttpClient.delete(`/settings/leads/${id}`);
    return true;
  } catch (error) {
    console.error(`Error deleting lead with id ${id}:`, error);
    throw error;
  }
};
