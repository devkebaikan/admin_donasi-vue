import HttpClient from "@/helpers/http-client";

export const getPaymentMethod = async (params = {}) => {
  try {
    const res = HttpClient.get("/setting-payment-method", { params });
    return (await res).data.data;
  } catch (error) {
    console.log("Error fetching payment method", error);
    return [];
  }
};
