import { Context } from "probot";
import { getPullRequestContext } from "../utils/getPullRequestContext.js";
import { getOutdatedComments } from "../utils/getOutDatedReviewComments.js";

export const processPullPandaComments = async ({
  context,
}: {
  context: Context<"pull_request">;
}) => {
  const { prDetails } = await getPullRequestContext({ context });

  const outdatedComments = await getOutdatedComments({
    context,
    prDetails,
  });

  const resolveReviewThreadMutation = `
    mutation resolveReviewThread($threadId: ID!) {
      resolveReviewThread(input: {threadId: $threadId}) {
        thread {
          id
          isResolved
        }
      }
    }
  `;

  try {
    const response: any = await context.octokit.graphql(
      resolveReviewThreadMutation,
      {
        threadId: "PRRT_kwDOIqlOIs5F_Hap",
      }
    );

    context.log.info(
      `Resolved thread: ${response.resolveReviewThread.thread.id}`
    );
  } catch (error) {
    context.log.error(`Error resolving thread: ${error}`);
  }

  console.log(outdatedComments);
};
