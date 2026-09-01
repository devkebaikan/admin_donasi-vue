import HttpClient from "@/helpers/http-client";

export const getAllBenefits = async (params: Record<string, any> = {}) => {
  try {
    const res = await HttpClient.get("/crm/benefits", { params });
    const responseData = res.data;
    if (responseData && responseData.meta) {
      return responseData;
    }

    return {
      data: responseData.data ?? [],
      meta: {
        total: Array.isArray(responseData.data) ? responseData.data.length : 0,
        last_page: 1,
      },
    };
  } catch (error) {
    console.error("Error fetching CRM benefits:", error);
    return { data: [], meta: { total: 0, last_page: 1 } };
  }
};

export const getBenefitDetail = async (id: number) => {
  try {
    const res = await HttpClient.get(`/crm/benefits/${id}`);
    return res.data.data;
  } catch (error) {
    console.error(`Error fetching CRM benefit detail ${id}:`, error);
    return null;
  }
};

export const createBenefit = async (data: Record<string, any>) => {
  try {
    const res = await HttpClient.post("/crm/benefits", data);
    return res.data.data;
  } catch (error) {
    console.error("Error creating CRM benefit:", error);
    throw error;
  }
};

export const updateBenefit = async (id: number, data: Record<string, any>) => {
  try {
    const res = await HttpClient.put(`/crm/benefits/${id}`, data);
    return res.data.data;
  } catch (error) {
    console.error(`Error updating CRM benefit ${id}:`, error);
    throw error;
  }
};

export const deleteBenefit = async (id: number) => {
  try {
    await HttpClient.delete(`/crm/benefits/${id}`);
    return true;
  } catch (error) {
    console.error(`Error deleting CRM benefit ${id}:`, error);
    throw error;
  }
};
