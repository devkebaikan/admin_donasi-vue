import HttpClient from "@/helpers/http-client";

// Fetch zakat Types
export const getZakatTypes = async (params = {}) => {
  try {
    const res = await HttpClient.get("/zakat/type", { params });
    return res.data.data;
  } catch (error) {
    console.error("Error fetching zakat type:", error);
    return [];
  }
};
