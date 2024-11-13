import { Context } from "probot";
import { PRDetails } from "../types/index.js";

export const getReviewCommentsGraphql = async ({
  context,
  prDetails,
}: {
  context: Context<"pull_request">;
  prDetails: PRDetails;
}) => {
  const query = `
    query ($owner: String!, $name: String!, $number: Int!) {
        repository(owner: $owner, name: $name) {
            pullRequest(number: $number) {
                reviewThreads(first: 100) {
                    edges {
                        node {
                            id
                            comments(first: 100) {
                                edges {
                                    node {
                                        id
                                        author {
                                            login
                                        }
                                        outdated
                                        minimizedReason
                                        originalCommit {
                                            id
                                            oid
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
  `;
  const response: any = await context.octokit.graphql(query, {
    owner: prDetails.owner,
    name: prDetails.repo,
    number: prDetails.pull_number,
  });
  return response.repository.pullRequest.reviewThreads.edges;
};
