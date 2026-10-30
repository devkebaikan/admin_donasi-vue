import HttpClient from "@/helpers/http-client";

export interface InfluencerProfile {
  id: number;
  name: string;
  display_name: string;
  entity_type: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  niche: string;
  status: string;
  source: string;
  notes: string;
  created_at: string;
  updated_at: string;
  edges?: Record<string, any>;
}

export interface InfluencerSocialAccount {
  id: number;
  influencer_profile_id: number;
  platform: string;
  handle: string;
  profile_url: string;
  follower_count: number;
  follower_count_checked_at: string;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
  edges?: Record<string, any>;
}

// 1. Fetch all influencers (paginated)
export const getAllInfluencers = async (params = {}) => {
  try {
    const res = await HttpClient.get("/influencers", { params });
    const responseData = res.data;

    // Menangani format { data: [...], meta: { ... } } atau { data: [...] }
    const list = Array.isArray(responseData.data)
      ? responseData.data
      : responseData.data?.data || [];

    const meta = responseData.meta ||
      responseData.data?.meta || {
        total: list.length,
        last_page: 1,
      };

    return {
      data: list,
      meta,
    };
  } catch (error) {
    console.error("Error fetching influencers:", error);
    return { data: [], meta: { total: 0, last_page: 1 } };
  }
};

// 2. Fetch single influencer by ID
export const getInfluencerById = async (id: number | string) => {
  try {
    const res = await HttpClient.get(`/influencers/${id}`);
    return res.data.data;
  } catch (error) {
    console.error(`Error fetching influencer ${id}:`, error);
    return null;
  }
};

// 3. Create new influencer
export const createInfluencer = async (data: Record<string, any>) => {
  try {
    const res = await HttpClient.post("/influencers", data);
    return res.data.data;
  } catch (error) {
    console.error("Error creating influencer:", error);
    throw error;
  }
};

// 4. Update influencer
export const updateInfluencer = async (
  id: number | string,
  data: Record<string, any>,
) => {
  try {
    const res = await HttpClient.put(`/influencers/${id}`, data);
    return res.data.data;
  } catch (error) {
    console.error(`Error updating influencer ${id}:`, error);
    throw error;
  }
};

// 5. Delete influencer
export const deleteInfluencer = async (id: number | string) => {
  try {
    await HttpClient.delete(`/influencers/${id}`);
    return true;
  } catch (error) {
    console.error(`Error deleting influencer ${id}:`, error);
    throw error;
  }
};

// ── Social Accounts Sub-resources ──────────────────────────────────────────

// 6. Get all social accounts of an influencer
export const getInfluencerSocialAccounts = async (
  influencerId: number | string,
) => {
  try {
    const res = await HttpClient.get(`/influencers/${influencerId}/social-accounts`);
    return Array.isArray(res.data.data) ? res.data.data : [];
  } catch (error) {
    console.error(`Error fetching social accounts for influencer ${influencerId}:`, error);
    return [];
  }
};

// 7. Create social account
export const createInfluencerSocialAccount = async (
  influencerId: number | string,
  data: Record<string, any>,
) => {
  try {
    const res = await HttpClient.post(
      `/influencers/${influencerId}/social-accounts`,
      data,
    );
    return res.data.data;
  } catch (error) {
    console.error("Error creating social account:", error);
    throw error;
  }
};

// 8. Get single social account
export const getInfluencerSocialAccountById = async (
  influencerId: number | string,
  accountId: number | string,
) => {
  try {
    const res = await HttpClient.get(
      `/influencers/${influencerId}/social-accounts/${accountId}`,
    );
    return res.data.data;
  } catch (error) {
    console.error(`Error fetching social account ${accountId}:`, error);
    return null;
  }
};

// 9. Update social account
export const updateInfluencerSocialAccount = async (
  influencerId: number | string,
  accountId: number | string,
  data: Record<string, any>,
) => {
  try {
    const res = await HttpClient.put(
      `/influencers/${influencerId}/social-accounts/${accountId}`,
      data,
    );
    return res.data.data;
  } catch (error) {
    console.error(`Error updating social account ${accountId}:`, error);
    throw error;
  }
};

// 10. Delete social account
export const deleteInfluencerSocialAccount = async (
  influencerId: number | string,
  accountId: number | string,
) => {
  try {
    await HttpClient.delete(
      `/influencers/${influencerId}/social-accounts/${accountId}`,
    );
    return true;
  } catch (error) {
    console.error(`Error deleting social account ${accountId}:`, error);
    throw error;
  }
};

