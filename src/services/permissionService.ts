import HttpClient from "@/helpers/http-client";

export const getAllPermissions = async (params = {}) => {
  try {
    const res = await HttpClient.get("/rbac/permissions", { params });
    return res.data.data;
  } catch (error) {
    console.error("Error fetching permissions:", error);
    return { data: [], meta: { total: 0, last_page: 1 } };
  }
};

export const getPermissionById = async (id: number) => {
  try {
    const res = await HttpClient.get(`/rbac/permissions/${id}`);
    return res.data.data;
  } catch (error) {
    console.error(`Error fetching permission with id ${id}:`, error);
    return null;
  }
};

export const createPermission = async (data: {
  guard_name: string;
  name: string;
  type: string;
  main?: number;
}) => {
  try {
    const res = await HttpClient.post("/rbac/permissions", data);
    return res.data.data;
  } catch (error) {
    console.error("Error creating permission:", error);
    throw error;
  }
};

export const updatePermission = async (
  id: number,
  data: { guard_name: string; name: string; type: string; main?: number },
) => {
  try {
    const res = await HttpClient.put(`/rbac/permissions/${id}`, data);
    return res.data.data;
  } catch (error) {
    console.error(`Error updating permission with id ${id}:`, error);
    throw error;
  }
};

export const deletePermission = async (id: number) => {
  try {
    await HttpClient.delete(`/rbac/permissions/${id}`);
    return true;
  } catch (error) {
    console.error(`Error deleting permission with id ${id}:`, error);
    throw error;
  }
};
