import { Context } from "probot";
import { CommandFlag } from "../types/index.js";
import { shouldReturn } from "../utils/shouldReturnHandler.js";
import { getPullRequestContext } from "../utils/getPullRequestContext.js";
import { commandRegistry } from "../commands/commandRegistry.js";
import { getCommand } from "../utils/commonUtils.js";
import { reviewPullRequest } from "../handlers/reviewPullRequest.js";
import { botMentions } from "../constants.js";
import { loadConfig } from "../utils/loadConfig.js";

export const reviewCodeAndPostComments = async ({
  context,
  readyForReview = false,
}: {
  context: Context<"pull_request">;
  readyForReview?: boolean;
}) => {
  const config = await loadConfig(context);
  if (!config.enabled) return;

  const { repoDetails, prDetails } = await getPullRequestContext({
    octokit: context.octokit as any,
    owner: context.payload.repository.owner.login,
    repo: context.payload.repository.name,
    pull_number: context.payload.pull_request.number,
  });

  context.log.info(
    `Received event "${context.payload.action}" for title: "${context.payload.pull_request.title}" - ${context.payload.pull_request.html_url}`
  );

  if (
    shouldReturn({
      readyForReview,
      prDetails,
      repoDetails,
      octokit: context.octokit as any,
      logger: context.log,
    })
  ) {
    return;
  }
  
  let flag = config?.reviews.level as CommandFlag;

  if (
    botMentions.some((mention) =>
      prDetails.description.toLowerCase().includes(mention)
    )
  ) {
    const command = getCommand(prDetails.description);

    if (command && commandRegistry[command]) {
      flag = await commandRegistry[command]({
        octokit: context.octokit as any,
      });
      await reviewPullRequest({
        prDetails,
        flag,
        octokit: context.octokit as any,
        logger: context.log,
      });
    } else {
      context.log.info(
        "Bot Mention found but no valid command found, performing full review"
      );
      await reviewPullRequest({
        prDetails,
        flag: CommandFlag.FullReviewEnabled,
        octokit: context.octokit as any,
        logger: context.log,
      });
    }
  } else {
    await reviewPullRequest({
      prDetails,
      flag,
      octokit: context.octokit as any,
      logger: context.log,
    });
  }

  context.log.info(`Review completed... Flag used: ${flag}`);
};
