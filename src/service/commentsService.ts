import { Context } from "probot";
import { CommandFlag } from "../types/index.js";
import { getCommand } from "../utils/commonUtils.js";
import { commandRegistry } from "../commands/commandRegistry.js";
import { reviewPullRequest } from "../handlers/reviewPullRequest.js";
import { getPullRequestContext } from "../utils/getPullRequestContext.js";
import { botMentions } from "../constants.js";
import { loadConfig } from "../utils/loadConfig.js";

export const processCommandsInComment = async ({
  context,
}: {
  context: Context<"issue_comment">;
}) => {
  const config = await loadConfig(context);
  if (!config.enabled) return;

  if (context.payload.comment.user.type === "Bot") {
    return;
  }

  const { prDetails } = await getPullRequestContext({
    octokit: context.octokit as any,
    owner: context.payload.repository.owner.login,
    repo: context.payload.repository.name,
    pull_number: context.payload.issue.number,
  });
  const commentBody = context.payload.comment.body;

  if (
    botMentions.some((mention) => commentBody.toLowerCase().includes(mention))
  ) {
    const command = getCommand(commentBody);
    if (command && commandRegistry[command]) {
      const flag = await commandRegistry[command]({
        octokit: context.octokit as any,
        prDetails,
      });
      if (
        flag === CommandFlag.FullReviewEnabled ||
        flag === CommandFlag.SoftReviewEnabled
      ) {
        await reviewPullRequest({
          prDetails,
          flag,
          octokit: context.octokit as any,
          logger: context.log,
        });
      }
      context.log.info(
        `Command "${command}" processed successfully: flag: ${flag}`
      );
    }
  }
  context.log.info(`No valid command found in comment: ${commentBody}`);
};
