import { PRDetails, ReviewComment } from "../types/index.js";
import { Octokit } from "@octokit/rest";

export const postReviewComments = async ({
  octokit,
  prDetails,
  reviewBody,
  reviewComments,
}: {
  octokit: Octokit;
  prDetails: PRDetails;
  reviewBody: string;
  reviewComments: ReviewComment[];
}) => {
  await octokit.pulls.createReview({
    owner: prDetails.owner,
    repo: prDetails.repo,
    pull_number: prDetails.pull_number,
    body: reviewBody,
    event: "COMMENT",
    commit_id: prDetails.head_sha,
    comments: reviewComments,
  });
};

export const postComment = async ({
  octokit,
  prDetails,
  comment,
}: {
  octokit: Octokit;
  prDetails: PRDetails;
  comment: string;
}) => {
  await octokit.issues.createComment({
    owner: prDetails.owner,
    repo: prDetails.repo,
    issue_number: prDetails.pull_number,
    body: comment,
  });
};
