import { Probot } from "probot";
import { reviewCodeAndPostComments } from "./service/PullRequestService.js";
import { createAndPostWelcomeComment } from "./service/IssuesService.js";

export default (app: Probot) => {
  app.on("issues.opened", async (context) => {
    await createAndPostWelcomeComment({ context });
  });

  app.on(
    ["pull_request.opened", "pull_request.ready_for_review"],
    async (context) => {
      const readyForReview = context.payload.action === "ready_for_review";
      await reviewCodeAndPostComments({ context, readyForReview });
    }
  );
};
