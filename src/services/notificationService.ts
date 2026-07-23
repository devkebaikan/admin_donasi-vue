import HttpClient from "@/helpers/http-client";

// GET /notifications
export const getNotifications = async (params = {}) => {
  try {
    const res = await HttpClient.get("/notifications", { params });
    return res.data.data;
  } catch (error) {
    console.error("Error fetching all notifications:", error);
    return { data: [], total: 0, page: 1, limit: 10, unread_count: 0 };
  }
};

// GET /notifications/{id}
export const getNotificationById = async (id: string) => {
  try {
    const res = await HttpClient.get(`/notifications/${id}`);
    return res.data.data;
  } catch (error) {
    console.error(`Error fetching notification with id ${id}:`, error);
    return null;
  }
};

// POST /notifications/read { notification_id }
export const readNotification = async (notificationId: string) => {
  try {
    const res = await HttpClient.post("/notifications/read", {
      notification_id: notificationId,
    });
    return res.data.data;
  } catch (error) {
    console.error(
      `Error marking notification ${notificationId} as read:`,
      error,
    );
    throw error;
  }
};

// POST /notifications/read-all
export const readAllNotifications = async () => {
  try {
    await HttpClient.post("/notifications/read-all");
    return true;
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    throw error;
  }
};

// GET /notifications/unread-count
export const getUnreadCount = async () => {
  try {
    const res = await HttpClient.get("/notifications/unread-count");
    return res.data.data?.unread_count ?? 0;
  } catch (error) {
    console.error("Error fetching unread notification count:", error);
    return 0;
  }
};
