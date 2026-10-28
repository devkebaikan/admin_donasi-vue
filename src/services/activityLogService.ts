import HttpClient from "@/helpers/http-client";

// ==========================================
// 1. Whacaster Queue
// ==========================================

export interface WhacasterQueueItem {
  id: string;
  status: "pending" | "processing" | "sent" | "failed" | string;
  phone: string;
  message: string;
  error?: string | null;
  attempts?: number;
  provider_message_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface WhacasterQueueParams {
  status?: string;
  limit?: number;
  offset?: number;
}

export interface WhacasterQueueResponse {
  data: WhacasterQueueItem[];
  meta: {
    limit: number;
    offset: number;
    total: number;
  };
  status?: number;
}

export const getWhacasterQueue = async (
  params: WhacasterQueueParams = {}
): Promise<WhacasterQueueResponse> => {
  try {
    const res = await HttpClient.get("/utility/whacaster-queue", { params });
    return res.data;
  } catch (error) {
    console.error("Error fetching whacaster queue:", error);
    return {
      data: [],
      meta: { limit: params.limit || 25, offset: params.offset || 0, total: 0 },
    };
  }
};

// ==========================================
// 2. Activity Logs
// ==========================================

export interface ActivityLogItem {
  id: number;
  user_id: number | null;
  action: string;
  table_name: string;
  record_id: number | null;
  old_values?: any;
  new_values?: any;
  ip_address?: string;
  user_agent?: string;
  endpoint?: string;
  method?: string;
  duration_ms?: number;
  is_success?: boolean;
  error?: string | null;
  created_at: string;
  user?: {
    id: number;
    name: string;
    email?: string;
  } | null;
}

export interface ActivityLogParams {
  user_id?: number | string;
  action?: string;
  table_name?: string;
  record_id?: number | string;
  is_success?: boolean | string;
  date_from?: string;
  date_to?: string;
  search?: string;
  mode?: "pagination" | "list";
  limit?: number;
  page?: number;
}

export interface ActivityLogResponse {
  data: ActivityLogItem[];
  meta: {
    total: number;
    last_page: number;
    current_page?: number;
    per_page?: number;
  };
}

export const getActivityLogs = async (
  params: ActivityLogParams = {}
): Promise<ActivityLogResponse> => {
  try {
    const res = await HttpClient.get("/utility/activity-logs", {
      params: { mode: "pagination", ...params },
    });
    // Menghandle response nested data: { data: [...], meta: { ... } } atau data: { data: [...] }
    const rawData = res.data?.data;
    if (rawData && Array.isArray(rawData.data)) {
      return {
        data: rawData.data,
        meta: rawData.meta ?? {
          total: rawData.total ?? rawData.data.length,
          last_page: rawData.last_page ?? 1,
          current_page: rawData.current_page ?? 1,
          per_page: rawData.per_page ?? 10,
        },
      };
    }
    if (res.data && Array.isArray(res.data.data)) {
      return {
        data: res.data.data,
        meta: res.data.meta ?? {
          total: res.data.data.length,
          last_page: 1,
        },
      };
    }
    return { data: [], meta: { total: 0, last_page: 1 } };
  } catch (error) {
    console.error("Error fetching activity logs:", error);
    return { data: [], meta: { total: 0, last_page: 1 } };
  }
};

