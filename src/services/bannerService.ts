import HttpClient from "@/helpers/http-client";

export const getBanners = async (params = {}) => {
  try {
    const res = await HttpClient.get("/settings/banners", { params });
    return res.data.data;
  } catch (error) {
    console.error("Error fetching banners:", error);
    return { data: [], meta: { total: 0, last_page: 1 } };
  }
};

export const getBannerById = async (id: number) => {
  try {
    const res = await HttpClient.get(`/settings/banners/${id}`);
    return res.data.data;
  } catch (error) {
    console.error(`Error fetching banner with id ${id}:`, error);
    return null;
  }
};

export const createBanner = async (data: FormData) => {
  try {
    const res = await HttpClient.post("/settings/banners", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.data;
  } catch (error) {
    console.error("Error creating banner:", error);
    throw error;
  }
};

export const updateBanner = async (id: number, data: FormData) => {
  try {
    const res = await HttpClient.put(`/settings/banners/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.data;
  } catch (error) {
    console.error(`Error updating banner with id ${id}:`, error);
    throw error;
  }
};

export const deleteBanner = async (id: number) => {
  try {
    await HttpClient.delete(`/settings/banners/${id}`);
    return true;
  } catch (error) {
    console.error(`Error deleting banner with id ${id}:`, error);
    throw error;
  }
};
