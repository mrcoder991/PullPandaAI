import { CommandHandler } from "../types/index.js";
import { handleFullReview, handleSkipReview, handleSoftReview } from "./handlers.js";

export const commandRegistry: { [key: string]: CommandHandler } = {
  "/review": handleFullReview,
  "/soft-review": handleSoftReview,
  "/skip-review": handleSkipReview,
};