import { Octokit } from "@octokit/rest";
import { getReviewComments } from "../utils/getReviewComments.js";
import { PRDetails } from "../types/index.js";
import { postComment } from "../utils/postReviewComments.js";

export const deleteReviewComments = async ({
  octokit,
  prDetails,
}: {
  octokit: Octokit;
  prDetails: PRDetails;
}) => {
  const comments = await getReviewComments({
    octokit,
    prDetails,
  });

  for (const comment of comments) {
    if (comment.user.login === "pullpanda-ai[bot]") {
      await octokit.rest.pulls.deleteReviewComment({
        owner: prDetails.owner,
        repo: prDetails.repo,
        comment_id: comment.id,
      });
    }
  }

  postComment({
    octokit,
    prDetails,
    comment:
      "Hey! 🐼 I noticed the command to delete all review comments, so I've cleared them as requested. (Deleting Review body is not yet supported) Let me know if there's anything else! 🚀",
  });
};
