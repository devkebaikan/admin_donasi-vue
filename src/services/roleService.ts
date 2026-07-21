import HttpClient from "@/helpers/http-client";

export const getAllRoles = async (params = {}) => {
  try {
    const res = await HttpClient.get("/rbac/roles", { params });
    return res.data.data;
  } catch (error) {
    console.error("Error fetching roles:", error);
    return { data: [], meta: { total: 0, last_page: 1 } };
  }
};

export const getRoleById = async (id: number) => {
  try {
    const res = await HttpClient.get(`/rbac/roles/${id}`);
    return res.data.data;
  } catch (error) {
    console.error(`Error fetching role with id ${id}:`, error);
    return null;
  }
};

export const createRole = async (data: {
  guard_name: string;
  role_name?: string;
  name?: string;
  menu_ids?: number[];
  permission_ids?: number[];
  permissions?: (string | number)[];
}) => {
  try {
    const res = await HttpClient.post("/rbac/roles", data);
    return res.data.data;
  } catch (error) {
    console.error("Error creating role:", error);
    throw error;
  }
};

export const updateRole = async (
  id: number,
  data: {
    guard_name: string;
    role_name?: string;
    name?: string;
    menu_ids?: number[];
    permission_ids?: number[];
    permissions?: (string | number)[];
  },
) => {
  try {
    const res = await HttpClient.put(`/rbac/roles/${id}`, data);
    return res.data.data;
  } catch (error) {
    console.error(`Error updating role with id ${id}:`, error);
    throw error;
  }
};

export const deleteRole = async (id: number) => {
  try {
    await HttpClient.delete(`/rbac/roles/${id}`);
    return true;
  } catch (error) {
    console.error(`Error deleting role with id ${id}:`, error);
    throw error;
  }
};

export const getUsersByRole = async (id: number, params = {}) => {
  try {
    const res = await HttpClient.get(`/rbac/roles/${id}/users`, { params });
    return res.data;
  } catch (error) {
    console.error(`Error fetching users by role id ${id}:`, error);
    return {
      data: { data: [], meta: { total: 0, last_page: 1, per_page: 10 } },
      role: null,
    };
  }
};

export const getPermissionsReference = async () => {
  try {
    const res = await HttpClient.get("/rbac/roles/create");
    return res.data.data?.reference ?? null;
  } catch (error) {
    console.error("Error fetching permissions reference:", error);
    return null;
  }
};
