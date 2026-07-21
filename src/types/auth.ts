export type UserMenuItem = {
  id: number;
  name: string;
  route?: string;
  icon?: string;
  children?: UserMenuItem[];
};

export type User = {
  data: any;
  access_token: any;
  id?: string;
  email?: string;
  username?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  token?: string;
  menus?: UserMenuItem[];
  permissions?: string[];
};
