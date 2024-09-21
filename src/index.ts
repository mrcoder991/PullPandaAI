import { Probot } from "probot";
import getPRDiff from "./utils/getPrDiff.js";
import { createChat } from "./utils/createChat.js";
import parseDiff from "parse-diff";
import { analyzeCode } from "./utils/analyzeCode.js";
import { PRDetails, ReviewComment } from "./types/index.js";

export default (app: Probot) => {
  app.on("issues", async (context) => {
    const issueComment = context.issue({
      body: "Thanks for opening this issue!",
    });
    // console.log(analyzeCode(parsedDiff, prDetails))
    await context.octokit.issues.createComment(issueComment);
  });

  app.on("pull_request", async (context) => {
    const { owner, repo, pull_number } = context.pullRequest();

    // const prDetails = await getPRDetails(owner, repo, pull_number, context);

    const prDetails: PRDetails = {
      title: context.payload.pull_request.title,
      description: context.payload.pull_request.body || "",
      owner,
      repo,
      pull_number,
      commit_id: context.payload.pull_request.head.sha,
    };

    const diff = await getPRDiff(owner, repo, pull_number, context);
    const parsedDiff = parseDiff(diff);

    let reviewComments: ReviewComment[] = [];
    let reviewBody: string = "Added comments";

    if (diff) {
      try {
        const chatId = await createChat();
        reviewComments = await analyzeCode(parsedDiff, prDetails, chatId);
        console.log("reviewComments", reviewComments);
      } catch (error) {
        console.error("Error:", error);
      }

      if (reviewComments.length === 0) {
        reviewBody = "Looks good to me! Great work!";
      }

      await context.octokit.pulls.createReview({
        owner,
        repo,
        pull_number,
        body: reviewBody,
        event: "COMMENT",
        commit_id: context.payload.pull_request.head.sha,
        comments: reviewComments,
      });
    }
  });
};
