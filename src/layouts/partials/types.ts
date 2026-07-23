type MessageType = {
  user?: {
    avatar?: string;
    name?: string;
  };
  message?: string;
};

export type NotificationType = {
  icon?: string;
  title?: string;
  content?: string;
} & MessageType;

export type NotificationExtraType = {
  project_id?: number;
  type?: string;
  url?: string;
  [key: string]: any;
};

export type NotificationParsedDataType = {
  title?: string;
  body?: string;
  extra?: NotificationExtraType;
};

export type NotificationItemType = {
  id: string;
  type?: string;
  notifiable_type?: string;
  notifiable_id?: number;
  data?: string;
  parsed_data?: NotificationParsedDataType;
  read_at?: string | null;
  created_at?: string;
  updated_at?: string;
};
