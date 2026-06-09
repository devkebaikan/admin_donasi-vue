import HttpClient from "@/helpers/http-client";

// Fetch all categories (paginated)
export const getAllCategories = async (params = {}) => {
  try {
    const res = await HttpClient.get("/program-categories", { params });
    return res.data.data;
  } catch (error) {
    console.error("Error fetching all categories:", error);
    return { data: [], meta: { total: 0, last_page: 1 } };
  }
};

// Fetch category by ID
export const getCategoryById = async (id: number) => {
  try {
    const res = await HttpClient.get(`/program-categories/${id}`);
    return res.data.data;
  } catch (error) {
    console.error(`Error fetching category with id ${id}:`, error);
    return null;
  }
};

// Create a new category
export const createCategory = async (categoryData: any) => {
  try {
    const res = await HttpClient.post("/program-categories", categoryData);
    return res.data.data;
  } catch (error) {
    console.error("Error creating category:", error);
    throw error;
  }
};

// Update category by ID
export const updateCategory = async (id: number, categoryData: any) => {
  try {
    const res = await HttpClient.put(`/program-categories/${id}`, categoryData);
    return res.data.data;
  } catch (error) {
    console.error(`Error updating category with id ${id}:`, error);
    throw error;
  }
};

// Delete category by ID
export const deleteCategory = async (id: number) => {
  try {
    await HttpClient.delete(`/program-categories/${id}`);
    return true;
  } catch (error) {
    console.error(`Error deleting category with id ${id}:`, error);
    throw error;
  }
};
