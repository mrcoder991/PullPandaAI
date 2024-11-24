import { CommandFlag, CommandHandler } from "../types/index.js";

export const handleFullReview: CommandHandler = async () => {
  return CommandFlag.FullReviewEnabled;
};

export const handleSoftReview: CommandHandler = async () => {
  return CommandFlag.SoftReviewEnabled;
};

export const handleSkipReview: CommandHandler = async () => {
  return CommandFlag.ReviewSkipped;
};