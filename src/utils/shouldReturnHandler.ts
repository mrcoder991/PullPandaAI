import { Context } from "probot";
import { postComment } from "./postReviewComments.js";
import { PRDetails } from "../types/index.js";

export const shouldReturn = ({
  context,
  readyForReview,
  prDetails,
  repoDetails,
}: {
  context: Context<"pull_request">;
  readyForReview: boolean;
  prDetails: PRDetails;
  repoDetails: any;
}): boolean => {
  const prBranch = context.payload.pull_request.base.ref;
  const defaultRepoBranch = repoDetails.data.default_branch;
  if (readyForReview) {
    postComment(context, prDetails, "🐼 Continuing With the review");
    return false;
  }

  // Skip review if PR is Draft
  if (context.payload.pull_request.draft) {
    context.log.info("PR is Draft. Skipping review...");
    postComment(
      context,
      prDetails,
      "Hey! 👋 I see this PR is a draft, so I'll wait until you're ready. 🐼 Just mark it `Ready for Review` when you're good to go! 🚀"
    );
    return true;
  }

  // Skip review if PR is not against default branch and for Prod deployment
  if (
    prBranch !== defaultRepoBranch &&
    context.payload.pull_request.title.toLowerCase().includes("prod") &&
    ["master", "main"].includes(prBranch.toLowerCase()) &&
    ["dev", "develop"].includes(defaultRepoBranch.toLowerCase())
  ) {
    context.log.info("PR for prod deployment Skipping review...");
    postComment(
      context,
      prDetails,
      `Hey! 🐼 This PR looks like a \`${defaultRepoBranch}\` to \`${prBranch}\` merge for **Production Deployment**, so I'll skip the review. Wishing you a smooth release! 🚀✨`
    );
    return true;
  }

  // Skip review if PR is not against default branch
  if (prBranch !== defaultRepoBranch) {
    context.log.info("PR is not against default branch. Skipping review...");
    postComment(
      context,
      prDetails,
      `Hey! 🐼 I noticed this PR isn't targeting the default \`${defaultRepoBranch}\` branch, so I'll skip the review. 👍`
    );
    return true;
  }
  return false;
};
