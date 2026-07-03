import HttpClient from "@/helpers/http-client";

export const checkFundingProject = async (id: number) => {
  try {
    const res = await HttpClient.get(`/program/projects/fund/check/${id}`);
    return res.data.data;
  } catch (error) {
    console.error("Error checking fund project:", error);
    return null;
  }
};

export const disburseFunding = async (id: number, data = {}) => {
  try {
    const res = await HttpClient.post(`/program/projects/fund/${id}`, data);
    return res.data.data;
  } catch (error) {
    console.error("Error disbursing fund:", error);
    throw error;
  }
};

export const claimFunding = async (id: number, data = {}) => {
  try {
    const res = await HttpClient.post(
      `/program/projects/fund/${id}/claim`,
      data,
    );
    return res.data.data;
  } catch (error) {
    console.error("Error claiming fund:", error);
    throw error;
  }
};

export const getClaimableDonationsByProjectId = async (
  id: number,
  data: { nominal: number; program_id: number },
) => {
  try {
    const res = await HttpClient.post(
      `/program/projects/fund/${id}/claimable`,
      data,
    );
    return res.data.data;
  } catch (error) {
    console.error("Error fetching claimable donations:", error);
    return null;
  }
};
