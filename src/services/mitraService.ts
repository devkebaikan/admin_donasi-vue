import HttpClient from "@/helpers/http-client";

// Fetch all mitra
export const getAllMitra = async (params = {}) => {
  try {
    const res = await HttpClient.get("/mitras", { params });
    return res.data.data;
  } catch (error) {
    console.error("Error fetching all mitras:", error);
    return [];
  }
};
