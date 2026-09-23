import HttpClient from "@/helpers/http-client";

export const getAllFinanceJournal = async (params = {}) => {
  try {
    const res = await HttpClient.get("/finance/jurnal", { params });
    return res.data.data;
  } catch (error) {
    console.error("Error fetching finance journals:", error);
    return { data: [], meta: { total: 0, last_page: 1 } };
  }
};

export const getFinanceJournalById = async (id: number) => {
  try {
    const res = await HttpClient.get(`/finance/jurnal/${id}`);
    return res.data.data;
  } catch (error) {
    console.error(`Error fetching finance journal with id ${id}:`, error);
    return null;
  }
};

export const importFinanceJournal = async (file: File | FormData) => {
  try {
    let formData: FormData;
    if (file instanceof FormData) {
      formData = file;
    } else {
      formData = new FormData();
      formData.append("file", file);
    }
    const res = await HttpClient.post("/finance/jurnal/import", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data?.data || res.data;
  } catch (error: any) {
    console.error("Error importing finance journals:", error);
    throw error?.response?.data || error;
  }
};

export const getTemplateImportJournal = async () => {
  try {
    const res = await HttpClient.get("/finance/jurnal/import/template", {
      responseType: "blob",
    });
    return res.data;
  } catch (error: any) {
    console.error("Error fetching template import journal:", error);
    throw error?.response?.data || error;
  }
};