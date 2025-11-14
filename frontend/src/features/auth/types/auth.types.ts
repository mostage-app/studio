export interface User {
  id: string;
  username: string;
  email: string;
  name?: string;
  avatar?: string;
  createdAt?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
  name: string;
}

export interface VerifyCredentials {
  username: string;
  code: string;
}

export interface ResendCodeCredentials {
  username: string;
}

export interface ForgotPasswordCredentials {
  username: string;
}

export interface ConfirmForgotPasswordCredentials {
  username: string;
  code: string;
  newPassword: string;
}
