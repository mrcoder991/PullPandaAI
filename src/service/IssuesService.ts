import { Context } from "probot";
import { loadConfig } from "../utils/loadConfig.js";

export const createAndPostWelcomeComment = async ({
  context,
}: {
  context: Context<"issues">;
}) => {
  const config = await loadConfig(context);
  if (!config.enabled) return;

  const issueComment = context.issue({
    body: "🐼 Thanks for opening this issue! May the Force be with you. ✨🚀🌌",
  });
  await context.octokit.issues.createComment(issueComment);
};
