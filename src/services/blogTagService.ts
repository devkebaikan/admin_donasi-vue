import HttpClient from "@/helpers/http-client";

export const getAllBlogTag = async (params = {}) => {
  try {
    const res = await HttpClient.get("/blogs/tags", { params });
    return res.data.data;
  } catch (error) {
    console.error("Error fetching blog tag:", error);
    return { data: [], meta: { total: 0, last_page: 1 } };
  }
};

export const getBlogTagById = async (id: number) => {
  try {
    const res = await HttpClient.get(`/blogs/tags/${id}`);
    return res.data.data;
  } catch (error) {
    console.error(`Error fetching blog tag with id ${id}:`, error);
    return null;
  }
};

export const createBlogTag = async (data: Record<string, any>) => {
  try {
    const res = await HttpClient.post("/blogs/tags", data);
    return res.data.data;
  } catch (error) {
    console.error("Error creating blog tag:", error);
    throw error;
  }
};

export const updateBlogTag = async (id: number, data: Record<string, any>) => {
  try {
    const res = await HttpClient.put(`/blogs/tags/${id}`, data);
    return res.data.data;
  } catch (error) {
    console.error(`Error updating blog tag with id ${id}:`, error);
    throw error;
  }
};

export const deleteBlogTag = async (id: number) => {
  try {
    await HttpClient.delete(`/blogs/tags/${id}`);
    return true;
  } catch (error) {
    console.error(`Error deleting blog tag with id ${id}:`, error);
    throw error;
  }
};
