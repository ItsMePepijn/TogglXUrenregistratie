export interface TogglUser {
  '2fa_enabled': boolean;
  api_token: string;
  at: string;
  authorization_updated_at: string;
  beginning_of_week: number;
  country_id: number | null;
  created_at: string;
  default_workspace_id: number;
  email: string;
  fullname: string;
  has_password: boolean;
  id: number;
  image_url: string;
  intercom_hash: string;
  openid_email: string | null;
  openid_enabled: boolean;
  timezone: string;
  toggl_accounts_id: string;
  updated_at: string;
}
