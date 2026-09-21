import HttpClient from "@/helpers/http-client";

// Fetch all webhook logs (limit/offset based)
export const getAllWebhookLogs = async (params: any = {}) => {
  try {
    const res = await HttpClient.get("/webhook/logs", { params });
    return res.data; // { status, data: [...], meta: { total, limit, offset } }
  } catch (error) {
    console.error("Error fetching webhook logs:", error);
    return { data: [], meta: { total: 0, limit: 20, offset: 0 } };
  }
};

// Fetch webhook log by ID
export const getWebhookLogById = async (id: number) => {
  const res = await HttpClient.get(`/webhook/logs/${id}`);
  return res.data.data;
};

// Delete webhook log by ID
export const deleteWebhookLog = async (id: number) => {
  await HttpClient.delete(`/webhook/logs/${id}`);
  return true;
};

// Resend / replay a stored webhook payload through its original pipeline
export const resendWebhookLog = async (id: number) => {
  const res = await HttpClient.post(`/webhook/logs/${id}/resend`);
  return res.data.data;
};

// Cleanup logs older than a given date
export const cleanupWebhookLogs = async (beforeDate: string) => {
  const res = await HttpClient.delete("/webhook/logs/cleanup", {
    params: { before_date: beforeDate },
  });
  return res.data.data;
};