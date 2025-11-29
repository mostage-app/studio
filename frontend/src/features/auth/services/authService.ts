// Authentication service for managing user authentication tokens and user data

export class AuthService {
  private static readonly ACCESS_TOKEN_KEY = "mostage-access-token";
  private static readonly ID_TOKEN_KEY = "mostage-id-token";
  private static readonly REFRESH_TOKEN_KEY = "mostage-refresh-token";
  private static readonly USER_KEY = "mostage-user-data";

  // Cookie settings for secure token storage (accessible in Server Components)
  private static readonly COOKIE_OPTIONS = {
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
  };

  /**
   * Set a cookie (client-side only)
   */
  private static setCookie(
    name: string,
    value: string,
    options = this.COOKIE_OPTIONS
  ): void {
    if (typeof document === "undefined") return; // Server-side check

    const { maxAge, path, sameSite, secure } = options;
    const expires = maxAge ? `; max-age=${maxAge}` : "";
    const secureFlag = secure ? "; secure" : "";
    document.cookie = `${name}=${value}${expires}; path=${path}; sameSite=${sameSite}${secureFlag}`;
  }

  /**
   * Remove a cookie (client-side only)
   */
  private static removeCookie(name: string): void {
    if (typeof document === "undefined") return; // Server-side check

    document.cookie = `${name}=; path=/; max-age=0; sameSite=lax`;
  }

  static saveTokens(tokens: {
    accessToken: string;
    idToken: string;
    refreshToken: string;
  }): void {
    try {
      // Save to localStorage (for client-side access)
      localStorage.setItem(this.ACCESS_TOKEN_KEY, tokens.accessToken);
      localStorage.setItem(this.ID_TOKEN_KEY, tokens.idToken);
      localStorage.setItem(this.REFRESH_TOKEN_KEY, tokens.refreshToken);

      // Also save to cookies (for Server Component access)
      // Only save ID token to cookies as it's what we need for API authentication
      this.setCookie(this.ID_TOKEN_KEY, tokens.idToken);
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
      // Remove from localStorage
      localStorage.removeItem(this.ACCESS_TOKEN_KEY);
      localStorage.removeItem(this.ID_TOKEN_KEY);
      localStorage.removeItem(this.REFRESH_TOKEN_KEY);

      // Also remove from cookies
      this.removeCookie(this.ID_TOKEN_KEY);
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

  /**
   * Sync ID token from localStorage to cookies
   * This is useful when user has token in localStorage but not in cookies
   * (e.g., after page refresh or when cookies were cleared)
   */
  static syncTokenToCookies(): void {
    try {
      const idToken = this.getIdToken();
      if (idToken) {
        // Only sync if token exists in localStorage but not in cookies
        // We check by trying to read from cookies (client-side only)
        if (typeof document !== "undefined") {
          const cookies = document.cookie.split(";");
          const hasTokenInCookies = cookies.some((cookie) =>
            cookie.trim().startsWith(`${this.ID_TOKEN_KEY}=`)
          );

          if (!hasTokenInCookies) {
            // Token exists in localStorage but not in cookies, sync it
            this.setCookie(this.ID_TOKEN_KEY, idToken);
          }
        }
      }
    } catch (error) {
      console.error("Failed to sync token to cookies:", error);
    }
  }
}
