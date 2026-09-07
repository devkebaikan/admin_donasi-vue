import HttpClient from "@/helpers/http-client";

// Fetch all event salur (paginated)
export const getAllEventSalur = async (params = {}) => {
  try {
    const res = await HttpClient.get("/event-salur", { params });
    return res.data.data;
  } catch (error) {
    console.error("Error fetching all event salurs:", error);
    return { data: [], meta: { total: 0, last_page: 1 } };
  }
};

// Fetch event salur by ID
export const getEventSalurById = async (id: number) => {
  try {
    const res = await HttpClient.get(`/event-salur/${id}`);
    return res.data.data;
  } catch (error) {
    console.error(`Error fetching event salur with id ${id}:`, error);
    return null;
  }
};

// Create a new event salur
export const createEventSalur = async (eventData: any) => {
  try {
    const res = await HttpClient.post("/event-salur", eventData);
    return res.data.data;
  } catch (error) {
    console.error("Error creating event salur:", error);
    throw error;
  }
};

// Update event salur by ID
export const updateEventSalur = async (id: number, eventData: any) => {
  try {
    const res = await HttpClient.put(`/event-salur/${id}`, eventData);
    return res.data.data;
  } catch (error) {
    console.error(`Error updating event salur with id ${id}:`, error);
    throw error;
  }
};

// Delete event salur by ID
export const deleteEventSalur = async (id: number) => {
  try {
    await HttpClient.delete(`/event-salur/${id}`);
    return true;
  } catch (error) {
    console.error(`Error deleting event salur with id ${id}:`, error);
    throw error;
  }
};

// Attach / Add projects to event salur
export const attachProjectsToEventSalur = async (
  id: number,
  data: { project_ids: number[] } | any,
) => {
  try {
    const res = await HttpClient.post(`/event-salur/${id}/projects`, data);
    return res.data;
  } catch (error) {
    console.error(
      `Error attaching projects to event salur with id ${id}:`,
      error,
    );
    throw error;
  }
};

// Detach / Delete project from event salur
export const deleteProjectFromEventSalur = async (
  eventSalurId: number,
  projectId: number,
) => {
  try {
    const res = await HttpClient.delete(
      `/event-salur/${eventSalurId}/projects/${projectId}`,
    );
    return res.data;
  } catch (error) {
    console.error(
      `Error deleting project ${projectId} from event salur ${eventSalurId}:`,
      error,
    );
    throw error;
  }
};
