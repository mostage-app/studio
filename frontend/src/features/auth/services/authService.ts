// Authentication service for managing user authentication tokens and user data

export class AuthService {
  private static readonly ACCESS_TOKEN_KEY = "mostage-access-token";
  private static readonly ID_TOKEN_KEY = "mostage-id-token";
  private static readonly REFRESH_TOKEN_KEY = "mostage-refresh-token";
  private static readonly USER_KEY = "mostage-user-data";

  static saveTokens(tokens: {
    accessToken: string;
    idToken: string;
    refreshToken: string;
  }): void {
    try {
      localStorage.setItem(this.ACCESS_TOKEN_KEY, tokens.accessToken);
      localStorage.setItem(this.ID_TOKEN_KEY, tokens.idToken);
      localStorage.setItem(this.REFRESH_TOKEN_KEY, tokens.refreshToken);
    } catch (error) {
      console.error("Failed to save auth tokens:", error);
    }
  }

  static getAccessToken(): string | null {
    try {
      return localStorage.getItem(this.ACCESS_TOKEN_KEY);
    } catch (error) {
      console.error("Failed to get access token:", error);
      return null;
    }
  }

  static getIdToken(): string | null {
    try {
      return localStorage.getItem(this.ID_TOKEN_KEY);
    } catch (error) {
      console.error("Failed to get ID token:", error);
      return null;
    }
  }

  static getRefreshToken(): string | null {
    try {
      return localStorage.getItem(this.REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error("Failed to get refresh token:", error);
      return null;
    }
  }

  static removeTokens(): void {
    try {
      localStorage.removeItem(this.ACCESS_TOKEN_KEY);
      localStorage.removeItem(this.ID_TOKEN_KEY);
      localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error("Failed to remove auth tokens:", error);
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
    this.removeTokens();
    this.removeUser();
  }

  static isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }
}
