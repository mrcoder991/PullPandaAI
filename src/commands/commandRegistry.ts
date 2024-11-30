import { CommandHandler } from "../types/index.js";
import { deleteReview, handleFullReview, handleSkipReview, handleSoftReview } from "./handlers.js";

export const commandRegistry: { [key: string]: CommandHandler } = {
  "/review": handleFullReview,
  "/soft-review": handleSoftReview,
  "/skip-review": handleSkipReview,
  "/clear-review": deleteReview,
};

export const commandDescriptionsForPRDescription: { [key: string]: string } = {
  "@PullPanda /review": "Get a full line by line review of the pull request. (default behavior when no command is used)",
  "@PullPanda /soft-review": "Get Detailed review but do not touch the `Files Changed` page",
  "@PullPanda /skip-review": "Skip the review for the pull request.",
};

export const commandDescriptionsForComment: { [key: string]: string } = {
  "@PullPanda /clear-review": "Clear / Delete the review for the pull request to start fresh",
}