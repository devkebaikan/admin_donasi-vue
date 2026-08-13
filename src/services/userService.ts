import HttpClient from "@/helpers/http-client";

export const getUsers = async (params = {}) => {
  try {
    const res = await HttpClient.get("/rbac/users", { params });
    return res.data.data;
  } catch (error) {
    console.error("Error fetching users:", error);
    return { data: [], meta: { total: 0, last_page: 1 } };
  }
};

export const getUserById = async (id: number) => {
  try {
    const res = await HttpClient.get(`/rbac/users/${id}`);
    return res.data.data;
  } catch (error) {
    console.error(`Error fetching user with id ${id}:`, error);
    return null;
  }
};

export const getUserDetailById = async (id: number) => {
  try {
    const res = await HttpClient.get(`/rbac/users/${id}/detail`);
    return res.data.data;
  } catch (error) {
    console.error(`Error fetching user with id ${id}:`, error);
    return null;
  }
};

export const updateUserProfiling = async (
  id: number,
  data: Record<string, any>,
) => {
  try {
    const res = await HttpClient.put(`/rbac/users/${id}/profiling`, data);
    return res.data.data;
  } catch (error) {
    console.error(`Error updating profiling user with id ${id}:`, error);
    throw error;
  }
};

export const createUser = async (data: Record<string, any>) => {
  try {
    const res = await HttpClient.post("/rbac/users", data);
    return res.data.data;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

export const updateUser = async (id: number, data: Record<string, any>) => {
  try {
    const res = await HttpClient.put(`/rbac/users/${id}`, data);
    return res.data.data;
  } catch (error) {
    console.error(`Error updating user with id ${id}:`, error);
    throw error;
  }
};

export const deleteUser = async (id: number) => {
  try {
    await HttpClient.delete(`/rbac/users/${id}`);
    return true;
  } catch (error) {
    console.error(`Error deleting user with id ${id}:`, error);
    throw error;
  }
};
