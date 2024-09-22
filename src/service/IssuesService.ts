import { Context } from "probot";

export const createAndPostWelcomeComment = async (
  context: Context<"issues">
) => {
  const issueComment = context.issue({
    body: "Thanks for opening this issue! May the Force be with you. ✨🚀🌌",
  });
  await context.octokit.issues.createComment(issueComment);
};
