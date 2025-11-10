// Authentication service for managing user authentication

export class AuthService {
  private static readonly TOKEN_KEY = "mostage-auth-token";
  private static readonly USER_KEY = "mostage-user-data";

  static saveToken(token: string): void {
    try {
      localStorage.setItem(this.TOKEN_KEY, token);
    } catch (error) {
      console.error("Failed to save auth token:", error);
    }
  }

  static getToken(): string | null {
    try {
      return localStorage.getItem(this.TOKEN_KEY);
    } catch (error) {
      console.error("Failed to get auth token:", error);
      return null;
    }
  }

  static removeToken(): void {
    try {
      localStorage.removeItem(this.TOKEN_KEY);
    } catch (error) {
      console.error("Failed to remove auth token:", error);
    }
  }

  static saveUser(user: Record<string, unknown>): void {
    try {
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error("Failed to save user data:", error);
    }
  }

  static getUser(): Record<string, unknown> | null {
    try {
      const user = localStorage.getItem(this.USER_KEY);
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error("Failed to get user data:", error);
      return null;
    }
  }

  static removeUser(): void {
    try {
      localStorage.removeItem(this.USER_KEY);
    } catch (error) {
      console.error("Failed to remove user data:", error);
    }
  }

  static clearAuth(): void {
    this.removeToken();
    this.removeUser();
  }

  static isAuthenticated(): boolean {
    return !!this.getToken();
  }
}
