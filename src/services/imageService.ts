import HttpClient from "@/helpers/http-client";

export const getAllImages = async (params = {}) => {
  try {
    const res = await HttpClient.get("/settings/images", { params });
    return res.data.data;
  } catch (error) {
    console.error("Error fetching images:", error);
    return { data: [], meta: { total: 0, last_page: 1 } };
  }
};

export const getImageById = async (id: number) => {
  try {
    const res = await HttpClient.get(`/settings/images/${id}`);
    return res.data.data;
  } catch (error) {
    console.error(`Error fetching image with id ${id}:`, error);
    return null;
  }
};

export const createImage = async (data: FormData) => {
  try {
    const res = await HttpClient.post("/settings/images", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.data;
  } catch (error) {
    console.error("Error creating image:", error);
    throw error;
  }
};

export const updateImage = async (id: number, data: FormData) => {
  try {
    const res = await HttpClient.put(`/settings/images/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.data;
  } catch (error) {
    console.error(`Error updating image with id ${id}:`, error);
    throw error;
  }
};

export const deleteImage = async (id: number) => {
  try {
    await HttpClient.delete(`/settings/images/${id}`);
    return true;
  } catch (error) {
    console.error(`Error deleting image with id ${id}:`, error);
    throw error;
  }
};
