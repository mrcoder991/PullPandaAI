import { Context } from "probot";
import { CommandFlag } from "../types/index.js";
import { shouldReturn } from "../utils/shouldReturnHandler.js";
import { getPullRequestContext } from "../utils/getPullRequestContext.js";
import { commandRegistry } from "../commands/commandRegistry.js";
import { getCommand } from "../utils/commonUtils.js";
import { reviewPullRequest } from "../handlers/reviewPullRequest.js";

export const reviewCodeAndPostComments = async ({
  context,
  readyForReview = false,
}: {
  context: Context<"pull_request">;
  readyForReview?: boolean;
}) => {
  const { repoDetails, prDetails } = await getPullRequestContext({ context });

  context.log.info(
    `Received event "${context.payload.action}" for title: "${context.payload.pull_request.title}" - ${context.payload.pull_request.html_url}`
  );

  if (shouldReturn({ context, readyForReview, prDetails, repoDetails })) {
    return;
  }

  const botMentions = ["@pullpandaai", "@pullpanda"];
  // this default flag can be what it is defined in config file in future
  // currently if no command is found, we will do a full review
  let flag = CommandFlag.FullReviewEnabled;

  if (
    botMentions.some((mention) =>
      prDetails.description.toLowerCase().includes(mention)
    )
  ) {
    const command = getCommand(prDetails.description);

    if (command && commandRegistry[command]) {
      flag = await commandRegistry[command](context, flag);
      await reviewPullRequest({ context, prDetails, flag });
    } else {
      context.log.info("Bot Mention found but no valid command found, performing full review");
      await reviewPullRequest({ context, prDetails, flag: CommandFlag.FullReviewEnabled });
    }
  } else {
    await reviewPullRequest({ context, prDetails, flag });
  }

  context.log.info(`Review completed... Flag used: ${flag}`);
};
