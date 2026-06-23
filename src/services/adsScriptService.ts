import HttpClient from "@/helpers/http-client";

export const getAdsScripts = async (params = {}) => {
  try {
    const res = await HttpClient.get("/settings/ads-scripts", { params });
    return res.data.data;
  } catch (error) {
    console.error("Error fetching ads scripts:", error);
    return { data: [], meta: { total: 0, last_page: 1 } };
  }
};

export const getAdsScriptById = async (id: number, unmask = false) => {
  try {
    const res = await HttpClient.get(`/settings/ads-scripts/${id}`, {
      params: unmask ? { unmask: true } : {},
    });
    return res.data.data;
  } catch (error) {
    console.error(`Error fetching ads script with id ${id}:`, error);
    return null;
  }
};

export const createAdsScript = async (data: Record<string, any>) => {
  try {
    const res = await HttpClient.post("/settings/ads-scripts", data);
    return res.data.data;
  } catch (error) {
    console.error("Error creating ads script:", error);
    throw error;
  }
};

export const updateAdsScript = async (id: number, data: Record<string, any>) => {
  try {
    const res = await HttpClient.put(`/settings/ads-scripts/${id}`, data);
    return res.data.data;
  } catch (error) {
    console.error(`Error updating ads script with id ${id}:`, error);
    throw error;
  }
};

export const deleteAdsScript = async (id: number) => {
  try {
    await HttpClient.delete(`/settings/ads-scripts/${id}`);
    return true;
  } catch (error) {
    console.error(`Error deleting ads script with id ${id}:`, error);
    throw error;
  }
};
