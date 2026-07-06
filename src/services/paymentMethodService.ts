import HttpClient from "@/helpers/http-client";

export const getAllPaymentMethods = async (params = {}) => {
  try {
    const res = await HttpClient.get("/settings/payment-methods", { params });
    return res.data.data;
  } catch (error) {
    console.error("Error fetching payment methods:", error);
    return { data: [], meta: { total: 0, last_page: 1 } };
  }
};

export const getPaymentMethodById = async (id: number) => {
  try {
    const res = await HttpClient.get(`/settings/payment-methods/${id}`);
    return res.data.data;
  } catch (error) {
    console.error(`Error fetching payment method with id ${id}:`, error);
    return null;
  }
};

export const createPaymentMethod = async (data: Record<string, any>) => {
  try {
    const res = await HttpClient.post("/settings/payment-methods", data);
    return res.data.data;
  } catch (error) {
    console.error("Error creating payment method:", error);
    throw error;
  }
};

export const updatePaymentMethod = async (
  id: number,
  data: Record<string, any>,
) => {
  try {
    const res = await HttpClient.put(`/settings/payment-methods/${id}`, data);
    return res.data.data;
  } catch (error) {
    console.error(`Error updating payment method with id ${id}:`, error);
    throw error;
  }
};

export const deletePaymentMethod = async (id: number) => {
  try {
    await HttpClient.delete(`/settings/payment-methods/${id}`);
    return true;
  } catch (error) {
    console.error(`Error deleting payment method with id ${id}:`, error);
    throw error;
  }
};

export const togglePaymentMethodStatus = async (id: number) => {
  try {
    const res = await HttpClient.patch(
      `/settings/payment-methods/${id}/toggle`,
    );
    return res.data.data;
  } catch (error) {
    console.error(`Error toggling payment method status with id ${id}:`, error);
    throw error;
  }
};
