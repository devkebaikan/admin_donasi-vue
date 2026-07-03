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
