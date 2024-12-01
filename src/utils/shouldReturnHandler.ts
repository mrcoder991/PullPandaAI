import { Logger } from "probot";
import { postComment } from "./postReviewComments.js";
import { PRDetails, RepoDetails } from "../types/index.js";
import { Octokit } from "@octokit/rest";

export const shouldReturn = ({
  readyForReview,
  prDetails,
  repoDetails,
  octokit,
  logger,
}: {
  readyForReview: boolean;
  prDetails: PRDetails;
  repoDetails: RepoDetails;
  octokit: Octokit;
  logger: Logger;
}): boolean => {
  const prBranch = prDetails.baseref;
  const defaultRepoBranch = repoDetails.default_branch;
  if (readyForReview) {
    postComment({octokit, prDetails, comment: "🐼 Continuing With the review..."});
    return false;
  }

  // Skip review if PR is Draft
  if (prDetails.isDraft) {
    logger.info("PR is Draft. Skipping review...");
    postComment({
      octokit,
      prDetails,
      comment: "Hey! 👋 I see this PR is a draft, so I'll wait until you're ready. 🐼 Just mark it `Ready for Review` when you're good to go! 🚀"
    });
    return true;
  }

  // Skip review if PR is not against default branch and for Prod deployment
  if (
    prBranch !== defaultRepoBranch &&
    prDetails.title.toLowerCase().includes("prod") &&
    ["master", "main"].includes(prBranch.toLowerCase()) &&
    ["dev", "develop"].includes(defaultRepoBranch.toLowerCase())
  ) {
    logger.info("PR for prod deployment Skipping review...");
    postComment({
      octokit,
      prDetails,
      comment: `Hey! 🐼 This PR looks like a \`${defaultRepoBranch}\` to \`${prBranch}\` merge for **Production Deployment**, so I'll skip the review. Wishing you a smooth release! 🚀✨`
    });
    return true;
  }

  // Skip review if PR is not against default branch
  if (prBranch !== defaultRepoBranch) {
    logger.info("PR is not against default branch. Skipping review...");
    postComment({
      octokit,
      prDetails,
      comment: `Hey! 🐼 I noticed this PR isn't targeting the default \`${defaultRepoBranch}\` branch, so I'll skip the review. 👍`
    });
    return true;
  }
  return false;
};
