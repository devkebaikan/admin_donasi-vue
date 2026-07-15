import HttpClient from "@/helpers/http-client";
import type { PaginatedResponse } from "@/composables/useDataTable";

export const getRbacMenus = async () => {
  try {
    const res = await HttpClient.get("/rbac/me/menus");
    return res.data;
  } catch (error) {
    console.error("Error fetching RBAC menus:", error);
    return { data: [], status: 500 };
  }
};

export const getAll = async (params = {}) => {
  try {
    const res = await HttpClient.get("/rbac/menus", { params });
    const items = res.data.data || [];
    return {
      data: items,
      meta: {
        total: items.length,
        last_page: 1,
        current_page: 1,
        per_page: items.length,
      },
    };
  } catch (error) {
    console.error("Error fetching menus:", error);
    return { data: [], meta: { total: 0, last_page: 1 } };
  }
};

export const getById = async (id: number) => {
  try {
    const res = await HttpClient.get(`/rbac/menus/${id}`);
    return res.data.data;
  } catch (error) {
    console.error(`Error fetching menu with id ${id}:`, error);
    return null;
  }
};

export const updateMenu = async (id: number, data: {}) => {
  try {
    const res = await HttpClient.put(`/rbac/menus/${id}`, data);
    return res.data.data;
  } catch (error) {
    console.error(`Error updating menu with id ${id}:`, error);
    throw error;
  }
};

export const deleteMenu = async (id: number) => {
  try {
    await HttpClient.delete(`/rbac/menus/${id}`);
    return true;
  } catch (error) {
    console.error(`Error deleting menu with id ${id}:`, error);
    throw error;
  }
};

export const getAllRbacMenu = async (params = {}) => {
  return getAll(params);
};

export const getMenuById = async (id: number) => {
  return getById(id);
};
