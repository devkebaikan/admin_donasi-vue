import HttpClient from "@/helpers/http-client";

export interface FundCheckResult {
  project_id: number;
  project_name: string;
  project_status: string;
  project_activity: string;
  total_allocated: number;
  total_disbursed: number;
  available_amount: number;
  breakdown: any;
  status: string;
  message: string;
}

export interface ClaimableProgramRequest {
  nominal: number;
  program_id: number;
}

export interface ClaimableProgramResult {
  program_id: number;
  program_name: string;
  requested_nominal: number;
  total_cart: number;
  cart_count: number;
  donations: any[] | null;
  uncart_total: number;
}

export interface ClaimProgramRequest {
  donation_ids: number[];
  program_id: number;
}

export const checkFundingProject = async (
  id: number,
): Promise<FundCheckResult | null> => {
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

export const claimFunding = async (
  id: number,
  data: { programs: ClaimProgramRequest[] },
) => {
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
  data: { programs: ClaimableProgramRequest[] },
): Promise<{ programs: ClaimableProgramResult[] } | null> => {
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
