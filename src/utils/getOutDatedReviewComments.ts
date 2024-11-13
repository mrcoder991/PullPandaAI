import { Context } from "probot";
import { PRDetails } from "../types/index.js";
import { getReviewCommentsGraphql } from "./getReviewCommentsGraphql.js";

export const getOutdatedComments = async ({
  context,
  prDetails,
}: {
  context: Context<"pull_request">;
  prDetails: PRDetails;
}) => {
  const comments = await getReviewCommentsGraphql({ context, prDetails });
  const outdatedComments = comments.filter(
    (comment: any) => comment.node.comments.edges.some(
      (edge: any) => edge.node.outdated
    )
  );
  return outdatedComments;
};
