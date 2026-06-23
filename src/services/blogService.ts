import HttpClient from "@/helpers/http-client";

export const getAllBlogs = async (params = {}) => {
  try {
    const res = await HttpClient.get("/blogs", { params });
    return res.data.data;
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return { data: [], meta: { total: 0, last_page: 1 } };
  }
};

export const getBlogById = async (id: number) => {
  try {
    const res = await HttpClient.get(`/blogs/id/${id}`);
    return res.data.data;
  } catch (error) {
    console.error(`Error fetching blog with id ${id}:`, error);
    return null;
  }
};

export const createBlog = async (blogData: FormData) => {
  try {
    const res = await HttpClient.post("/blogs", blogData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.data;
  } catch (error) {
    console.error("Error creating blog:", error);
    throw error;
  }
};

export const updateBlog = async (id: number, blogData: FormData) => {
  try {
    const res = await HttpClient.post(`/blogs/${id}`, blogData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.data;
  } catch (error) {
    console.error(`Error updating blog with id ${id}:`, error);
    throw error;
  }
};

export const deleteBlog = async (id: number) => {
  try {
    await HttpClient.delete(`/blogs/${id}`);
    return true;
  } catch (error) {
    console.error(`Error deleting blog with id ${id}:`, error);
    throw error;
  }
};

export const getBlogCategories = async () => {
  try {
    const res = await HttpClient.get("/blogs/kategori", {
      params: { mode: "list" },
    });
    return res.data.data ?? res.data ?? [];
  } catch (error) {
    console.error("Error fetching blog categories:", error);
    return [];
  }
};
