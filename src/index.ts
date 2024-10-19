import { Probot } from "probot";
import { reviewCodeAndPostComments } from "./service/PullRequestService.js";
import { createAndPostWelcomeComment } from "./service/IssuesService.js";

export default (app: Probot) => {
  app.on("issues.opened", async (context) => {
    await createAndPostWelcomeComment({context});
  });

  app.on("pull_request.opened", async (context) => {
    await reviewCodeAndPostComments({context});
  });

  app.on("pull_request.ready_for_review", async (context) => {
    await reviewCodeAndPostComments({context, readyForReview: true});
  });
};
