import * as fs from "fs";
import * as path from "path";

/**
 * Email template names for Cognito
 */
export const COGNITO_EMAIL_TEMPLATES = {
  VERIFICATION: "verification.html",
  PASSWORD_RESET: "password-reset.html",
} as const;

/**
 * Reads email template from Cognito templates directory
 */
export function readCognitoEmailTemplate(templateName: string): string {
  const templatePath = path.join(__dirname, "templates", templateName);
  try {
    return fs.readFileSync(templatePath, "utf-8");
  } catch (error) {
    throw new Error(
      `Failed to read Cognito email template ${templateName}: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}
