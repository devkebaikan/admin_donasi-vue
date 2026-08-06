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

// transaction detail by invoice
export const getCrmTransactionById = async (id: number) => {
  try {
    const res = await HttpClient.get(`/admin/transactions/${id}`);
    return res.data.data;
  } catch (error) {
    console.error(`Error fetching transaction ${id}:`, error);
    return null;
  }
};

// list project by id user
export const getCrmProjects = async (params = {}) => {
  try {
    const res = await HttpClient.get("/program/projects", { params });
    return res.data.data;
  } catch (error) {
    console.error("Error fetching projects:", error);
    return { data: [], meta: { total: 0, last_page: 1 } };
  }
};

// list kegiatan filter by projectid
export const getCrmKegiatans = async (params = {}) => {
  try {
    const res = await HttpClient.get("/program/kegiatan", { params });
    return res.data.data;
  } catch (error) {
    console.error("Error fetching kegiatans:", error);
    return { data: [], meta: { total: 0, last_page: 1 } };
  }
};

// list riwayat transaction by userId
export const getCrmTransactions = async (params = {}) => {
  try {
    const res = await HttpClient.get("/admin/transactions", { params });
    return res.data.data;
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return { data: [], meta: { total: 0, last_page: 1 } };
  }
};

// list template chat crm
export const getCrmChatTemplates = async (params = {}) => {
  try {
    const res = await HttpClient.get("/crm/whatsapp-templates", { params });
    return res.data.data;
  } catch (error) {
    console.error("Error fetching chat templates:", error);
    return { data: [], meta: { total: 0, last_page: 1 } };
  }
};

// detail template chat crm
export const getCrmChatTemplateDetail = async (id: number) => {
  try {
    const res = await HttpClient.get(`/crm/whatsapp-templates/${id}`);
    return res.data.data;
  } catch (error) {
    console.error(`Error fetching chat template ${id}:`, error);
    return null;
  }
};

// buat template chat baru (khusus type "crm")
export const createCrmChatTemplate = async (data: any) => {
  try {
    const res = await HttpClient.post("/crm/whatsapp-templates", data);
    return res.data.data;
  } catch (error) {
    console.error("Error creating chat template:", error);
    throw error;
  }
};

// update template chat
export const updateCrmChatTemplate = async (id: number, data: FormData) => {
  try {
    const res = await HttpClient.post(`/crm/whatsapp-templates/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.data;
  } catch (error) {
    console.error(`Error updating chat template ${id}:`, error);
    throw error;
  }
};

// hapus template chat
export const deleteCrmChatTemplate = async (id: number) => {
  try {
    await HttpClient.delete(`/crm/whatsapp-templates/${id}`);
    return true;
  } catch (error) {
    console.error(`Error deleting chat template ${id}:`, error);
    throw error;
  }
};

// template by stage pipeline
export const getCrmChatTemplatesByStage = async (stageId: number) => {
  try {
    const res = await HttpClient.get(
      `/crm/whatsapp-templates/by-pipeline/${stageId}`,
    );
    return res.data.data;
  } catch (error) {
    console.error("Error fetching chat templates by stage:", error);
    return [];
  }
};

// render template chat by template id
export const getCrmChatTemplateById = async (
  templateId: number,
  params = {},
) => {
  try {
    const res = await HttpClient.post(
      `/crm/whatsapp-templates/${templateId}/render`,
      params,
    );
    return res.data.data;
  } catch (error) {
    console.error("Error fetching chat template by id:", error);
    return null;
  }
};

// send chat to donor
export const sendCrmChatToDonor = async (
  id: number,
  data: Record<string, any>,
) => {
  try {
    const res = await HttpClient.post(`/crm/donors/${id}/chat`, data);
    return res.data.data;
  } catch (error) {
    console.error("Error sending chat to donor:", error);
    throw error;
  }
};
