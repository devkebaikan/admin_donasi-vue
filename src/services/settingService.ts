import HttpClient from "@/helpers/http-client";

export const getSettings = async (params = {}) => {
  try {
    const res = await HttpClient.get("/settings/settings", { params });
    return res.data.data;
  } catch (error) {
    console.error("Error fetching settings:", error);
    return { data: [], meta: { total: 0, last_page: 1 } };
  }
};

export const deleteSetting = async (id: number) => {
  try {
    await HttpClient.delete(`/settings/settings/${id}`);
    return true;
  } catch (error) {
    console.error(`Error deleting setting with id ${id}:`, error);
    throw error;
  }
};
