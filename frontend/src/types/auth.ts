export type AdminLoginRequest = {
  username: string;
  password: string;
};

export type AdminLoginResponse = {
  token: string;
  username: string;
  nickname: string;
};

export type AdminAuthSession = {
  token: string;
  username: string;
  nickname: string;
  loginAt: string;
  rememberMe: boolean;
};

