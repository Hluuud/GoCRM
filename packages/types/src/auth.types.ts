export interface RegisterUserDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  tenantName?: string;
  tenantSlug?: string;
}

export interface LoginDto {
  email: string;
  password: string;
  mfaCode?: string;
  rememberMe?: boolean;
}

export interface AuthUserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  mfaEnabled: boolean;
  tenantId: string;
  tenantName: string;
  tenantSlug: string;
  roles: string[];
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  token: string;
  password: string;
  passwordConfirmation: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
  newPasswordConfirmation: string;
}

export interface MfaSetupResponse {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}

export interface MfaVerifyDto {
  code: string;
}
