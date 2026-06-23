import HttpClient from "@/helpers/http-client";

export const getEvents = async (params = {}) => {
  try {
    const res = await HttpClient.get("/events", { params });
    return res.data.data;
  } catch (error) {
    console.error("Error fetching events:", error);
    return { data: [], meta: { total: 0, last_page: 1 } };
  }
};

export const getEventById = async (id: number) => {
  try {
    const res = await HttpClient.get(`/events/${id}`);
    return res.data.data;
  } catch (error) {
    console.error(`Error fetching event with id ${id}:`, error);
    return null;
  }
};

export const createEvent = async (data: FormData) => {
  try {
    const res = await HttpClient.post("/events", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.data;
  } catch (error) {
    console.error("Error creating event:", error);
    throw error;
  }
};

export const updateEvent = async (id: number, data: FormData) => {
  try {
    const res = await HttpClient.post(`/events/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.data;
  } catch (error) {
    console.error(`Error updating event with id ${id}:`, error);
    throw error;
  }
};

export const deleteEvent = async (id: number) => {
  try {
    await HttpClient.delete(`/events/${id}`);
    return true;
  } catch (error) {
    console.error(`Error deleting event with id ${id}:`, error);
    throw error;
  }
};

// ========================================================= Event Types =========================================================
export const getEventTypes = async (params = {}) => {
  try {
    const res = await HttpClient.get("/event-types", { params });
    return res.data;
  } catch (error) {
    console.error("Error fetching event types:", error);
    return [];
  }
};

export const getEventTypeById = async (id: number) => {
  try {
    const res = await HttpClient.get(`/event-types/${id}`);
    return res.data.data;
  } catch (error) {
    console.error(`Error fetching event with id ${id}:`, error);
    return null;
  }
};

export const createEventType = async (data: FormData) => {
  try {
    const res = await HttpClient.post("/event-types", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.data;
  } catch (error) {
    console.error("Error creating event type:", error);
    throw error;
  }
};

export const updateEventType = async (id: number, data: FormData) => {
  try {
    const res = await HttpClient.post(`/event-types/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.data;
  } catch (error) {
    console.error(`Error updating event type with id ${id}:`, error);
    throw error;
  }
};

export const deleteEventType = async (id: number) => {
  try {
    await HttpClient.delete(`/event-types/${id}`);
    return true;
  } catch (error) {
    console.error(`Error deleting event type with id ${id}:`, error);
    throw error;
  }
};

// ========================================================= Event Attribute =========================================================
export const getEventAttributes = async (params = {}) => {
  try {
    const res = await HttpClient.get("/event-attributes", { params });
    return res.data;
  } catch (error) {
    console.error("Error fetching event types:", error);
    return [];
  }
};

export const getEventAttributeById = async (id: number) => {
  try {
    const res = await HttpClient.get(`/event-attributes/${id}`);
    return res.data.data;
  } catch (error) {
    console.error(`Error fetching event with id ${id}:`, error);
    return null;
  }
};

export const createEventAttribute = async (data: FormData) => {
  try {
    const res = await HttpClient.post("/event-attributes", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.data;
  } catch (error) {
    console.error("Error creating event type:", error);
    throw error;
  }
};

export const updateEventAttribute = async (id: number, data: FormData) => {
  try {
    const res = await HttpClient.post(`/event-attributes/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.data;
  } catch (error) {
    console.error(`Error updating event type with id ${id}:`, error);
    throw error;
  }
};

export const deleteEventAttribute = async (id: number) => {
  try {
    await HttpClient.delete(`/event-attributes/${id}`);
    return true;
  } catch (error) {
    console.error(`Error deleting event type with id ${id}:`, error);
    throw error;
  }
};
