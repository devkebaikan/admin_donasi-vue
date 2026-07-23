import HttpClient from "@/helpers/http-client";

export const getAllBlogCategory = async (params = {}) => {
  try {
    const res = await HttpClient.get("/blogs/kategori", { params });
    return res.data.data;
  } catch (error) {
    console.error("Error fetching blog category:", error);
    return { data: [], meta: { total: 0, last_page: 1 } };
  }
};

export const getBlogCategoryById = async (id: number) => {
  try {
    const res = await HttpClient.get(`/blogs/kategori/${id}`);
    return res.data.data;
  } catch (error) {
    console.error(`Error fetching blog category with id ${id}:`, error);
    return null;
  }
};

export const createBlogCategory = async (data: Record<string, any>) => {
  try {
    const res = await HttpClient.post("/blogs/kategori", data);
    return res.data.data;
  } catch (error) {
    console.error("Error creating blog category:", error);
    throw error;
  }
};

export const updateBlogCategory = async (
  id: number,
  data: Record<string, any>,
) => {
  try {
    const res = await HttpClient.put(`/blogs/kategori/${id}`, data);
    return res.data.data;
  } catch (error) {
    console.error(`Error updating blog category with id ${id}:`, error);
    throw error;
  }
};

export const deleteBlogCategory = async (id: number) => {
  try {
    await HttpClient.delete(`/blogs/kategori/${id}`);
    return true;
  } catch (error) {
    console.error(`Error deleting blog category with id ${id}:`, error);
    throw error;
  }
};
