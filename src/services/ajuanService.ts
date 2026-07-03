import HttpClient from "@/helpers/http-client";

export const getAllAjuan = async (params = {}) => {
  try {
    const res = await HttpClient.get("/program/project-ajuans", { params });
    return res.data.data;
  } catch (error) {
    console.error("Error fetching ajuan: ", error);
    return { data: [], meta: { total: 0, last_page: 1 } };
  }
};

export const getAjuanById = async (id: number) => {
  try {
    const res = await HttpClient.get(`/program/project-ajuans/${id}`);
    return res.data.data;
  } catch (error) {
    console.error(`Error fetching ajuan with id ${id}:`, error);
    return null;
  }
};

export const createAjuan = async (data: Record<string, any>) => {
  try {
    const res = await HttpClient.post("/program/project-ajuans", data);
    return res.data.data;
  } catch (error) {
    console.error("Error creating ajuan:", error);
    throw error;
  }
};

export const updateAjuan = async (id: number, data: Record<string, any>) => {
  try {
    const res = await HttpClient.put(`/program/project-ajuans/${id}`, data);
    return res.data.data;
  } catch (error) {
    console.error(`Error updating ajuan with id ${id}:`, error);
    throw error;
  }
};

export const deleteAjuan = async (id: number) => {
  try {
    await HttpClient.delete(`/program/project-ajuans/${id}`);
    return true;
  } catch (error) {
    console.error(`Error deleting ajuan with id ${id}:`, error);
    throw error;
  }
};

export const acceptAjuan = async (id: number, data: Record<string, any>) => {
  try {
    const res = await HttpClient.post(
      `/program/project-ajuans/${id}/accept`,
      data,
    );
    return res.data.data;
  } catch (error) {
    console.error(`Error accepting ajuan with id ${id}:`, error);
    throw error;
  }
};
export const rejectAjuan = async (id: number) => {
  try {
    await HttpClient.post(`/program/project-ajuans/${id}/reject`);
    return true;
  } catch (error) {
    console.error(`Error rejecting ajuan with id ${id}:`, error);
    throw error;
  }
};
export const acceptRefund = async (id: number) => {
  try {
    await HttpClient.post(`/program/project-refunds/${id}/reject`);
    return true;
  } catch (error) {
    console.error(`Error accepting refund with id ${id}:`, error);
    throw error;
  }
};
export const rejectRefund = async (id: number) => {
  try {
    await HttpClient.post(`/program/project-refunds/${id}/reject`);
    return true;
  } catch (error) {
    console.error(`Error rejecting refund with id ${id}:`, error);
    throw error;
  }
};
