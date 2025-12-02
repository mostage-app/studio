import type { Presentation } from "@/features/presentation/services/presentationService";

export interface ProfileUser {
  name?: string;
  username: string;
  createdAt?: string;
}

export interface DeleteModalState {
  isOpen: boolean;
  slug: string;
  name: string;
}

export interface EditModalState {
  isOpen: boolean;
  presentation: Presentation | null;
}

export type SharePlatform = "twitter" | "facebook" | "linkedin" | "copy";
