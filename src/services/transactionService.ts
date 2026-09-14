import HttpClient from "@/helpers/http-client";

export const getAllTransactions = async (params = {}) => {
  try {
    const res = await HttpClient.get("/admin/transactions", { params });
    return res.data.data;
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return { data: [], meta: { total: 0, last_page: 1 } };
  }
};

export const getTransactionById = async (id: number) => {
  try {
    const res = await HttpClient.get(`/admin/transactions/${id}`);
    return res.data.data;
  } catch (error) {
    console.error(`Error fetching transaction ${id}:`, error);
    return null;
  }
};

export const createTransaction = async (data: Record<string, any>) => {
  try {
    const res = await HttpClient.post("/admin/transactions", data);
    return res.data.data;
  } catch (error) {
    console.error("Error creating transaction:", error);
    throw error;
  }
};

export const updateTransaction = async (
  id: number,
  data: Record<string, any>,
) => {
  try {
    const res = await HttpClient.put(`/admin/transactions/${id}`, data);
    return res.data.data;
  } catch (error) {
    console.error(`Error updating transaction ${id}:`, error);
    throw error;
  }
};

export const deleteTransaction = async (id: number) => {
  try {
    await HttpClient.delete(`/admin/transactions/${id}`);
    return true;
  } catch (error) {
    console.error(`Error deleting transaction ${id}:`, error);
    throw error;
  }
};

export const getUserTransactionHistory = async (
  userId: number,
  params = {},
) => {
  try {
    const res = await HttpClient.get(`/admin/users/${userId}/transactions`, {
      params,
    });
    return res.data.data;
  } catch (error) {
    console.error(
      `Error fetching transaction history for user ${userId}:`,
      error,
    );
    return { data: [], meta: { total: 0, last_page: 1 } };
  }
};

export const verifTransaction = async (
  id: number,
  data: Record<string, any>,
) => {
  try {
    const res = await HttpClient.put(`/admin/transactions/${id}/verify`, data);
    return res.data.data;
  } catch (error) {
    console.error(`Error verifikasi transaction ${id}:`, error);
    throw error;
  }
};

export const updateTransactionDetailProject = async (
  id: number,
  data: { project_id: number },
) => {
  try {
    const res = await HttpClient.put(`/admin/transactions/details/${id}`, data);
    return res.data.data;
  } catch (error) {
    console.error(`Error updating transaction detail ${id}:`, error);
    throw error;
  }
};

export interface ProposeRefundPayload {
  account_behalf: string;
  account_number: string;
  bank_reference_id: number;
  notes: string;
  refund_amounts: number[];
  transaction_detail_ids: number[];
  transaction_id: number;
}

export const proposeRefund = async (data: ProposeRefundPayload) => {
  try {
    const res = await HttpClient.post("/admin/transactions/refund/propose", data);
    return res.data.data;
  } catch (error) {
    console.error("Error proposing refund:", error);
    throw error;
  }
};

