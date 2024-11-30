import { Octokit } from "@octokit/rest";
import { deleteReviewComments } from "../handlers/deleteReview.js";
import { CommandFlag, CommandHandler, PRDetails } from "../types/index.js";

export const handleFullReview: CommandHandler = async () => {
  return CommandFlag.FullReviewEnabled;
};

export const handleSoftReview: CommandHandler = async () => {
  return CommandFlag.SoftReviewEnabled;
};

export const handleSkipReview: CommandHandler = async () => {
  return CommandFlag.ReviewSkipped;
};

export const deleteReview: CommandHandler = async ({ octokit, prDetails }) => {
  await deleteReviewComments({
    octokit: octokit as Octokit,
    prDetails: prDetails as PRDetails
  })
  return CommandFlag.ReviewDeleted;
}