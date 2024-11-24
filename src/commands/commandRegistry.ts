import { CommandHandler } from "../types/index.js";
import { handleFullReview, handleSkipReview, handleSoftReview } from "./handlers.js";

export const commandRegistry: { [key: string]: CommandHandler } = {
  "/review": handleFullReview,
  "/soft-review": handleSoftReview,
  "/skip-review": handleSkipReview,
};

export const commandDescriptions: { [key: string]: string } = {
  "@PullPanda /review": "Get a full line by line review of the pull request.",
  "@PullPanda /soft-review": "Get full detailed review in the review body only. this does not touches the `Files Changed` page",
  "@PullPanda /skip-review": "Skips the review process for the pull request.",
};