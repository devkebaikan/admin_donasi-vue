import HttpClient from "@/helpers/http-client";

// Fetch all third party logs (paginated)
export const getAllThirdPartyLogs = async (params: any = {}) => {
  try {
    const res = await HttpClient.get("/utility/third-party-logs", {
      params: { mode: "pagination", ...params },
    });
    return res.data.data; // { data: [...], meta: { current_page, last_page, per_page, total } }
  } catch (error) {
    console.error("Error fetching third party logs:", error);
    return { data: [], meta: { total: 0, last_page: 1 } };
  }
};

// Fetch third party log by ID
export const getThirdPartyLogById = async (id: number) => {
  const res = await HttpClient.get(`/utility/third-party-logs/${id}`);
  return res.data.data;
};

// Delete third party log by ID
export const deleteThirdPartyLog = async (id: number) => {
  await HttpClient.delete(`/utility/third-party-logs/${id}`);
  return true;
};

// Resend / re-run a third party call based on the stored request data
export const resendThirdPartyLog = async (id: number) => {
  const res = await HttpClient.post(`/utility/third-party-logs/${id}/resend`);
  return res.data.data;
};

// Stats (for dashboard/summary widgets, optional)
export const getThirdPartyLogStats = async (params: any = {}) => {
  const res = await HttpClient.get("/utility/third-party-logs/stats", { params });
  return res.data.data;
};

// Cleanup logs older than a given date
export const cleanupThirdPartyLogs = async (beforeDate: string) => {
  const res = await HttpClient.delete("/utility/third-party-logs/cleanup", {
    params: { before_date: beforeDate },
  });
  return res.data.data;
};