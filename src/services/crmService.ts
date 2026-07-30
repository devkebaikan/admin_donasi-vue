import HttpClient from "@/helpers/http-client";

// CRM Pipeline
export const getPipeline = async (params = {}) => {
  try {
    const res = await HttpClient.get("/crm/pipeline-stages", { params });
    return res.data.data;
  } catch (error) {
    console.error("Error fetching crm pipeline:", error);
    return [];
  }
};

// CRM Donors — pipeline cases (donasi masuk yang berjalan di kanban)
export const getDonorCases = async (params: Record<string, any> = {}) => {
  try {
    const res = await HttpClient.get("/crm/donors", { params });
    return res.data.data;
  } catch (error) {
    console.error("Error fetching crm donors:", error);
    return { data: [], meta: { total: 0, last_page: 1 } };
  }
};

// CRM Donor detail — profil lengkap donatur beserta follow up & chat
export const getDonorDetail = async (id: number) => {
  try {
    const res = await HttpClient.get(`/crm/donors/${id}`);
    return res.data.data;
  } catch (error) {
    console.error("Error fetching crm donor detail:", error);
    return null;
  }
};
