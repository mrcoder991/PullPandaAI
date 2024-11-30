import { Context } from "probot";
import { getPullRequestContext } from "../utils/getPullRequestContext.js";
import { getOutdatedComments } from "../utils/getOutDatedReviewComments.js";

export const processPullPandaComments = async ({
  context,
}: {
  context: Context<"pull_request">;
}) => {
  const { prDetails } = await getPullRequestContext({
    owner: context.payload.repository.owner.login,
    repo: context.payload.repository.name,
    pull_number: context.payload.pull_request.number,
    octokit: context.octokit as any,
  });

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
