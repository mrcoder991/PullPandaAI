import nock from "nock";
import myProbotApp from "../src/index";
import { Probot, ProbotOctokit } from "probot";
import pullRequestOpenedPayload from "./fixtures/pull_request.opened.json";

describe("My Probot app", () => {
  let probot;

  beforeEach(() => {  
    nock.disableNetConnect();
    probot = new Probot({
      githubToken: "test",
      Octokit: ProbotOctokit.defaults({
        retry: { enabled: false },
        throttle: { enabled: false },
      }),
    });
    probot.load(myProbotApp);
  });

  test("creates a comment when a pull request is opened", async () => {
    nock("https://api.github.com")
      .post("/repos/owner/repo/pulls/1/reviews", (body) => {
        expect(body).toMatchObject({
          body: "PR comment",
          path: "file.js",
          position: 1,
        });
        return true;
      })
      .reply(200);

    await probot.receive({ name: "pull_request", payload: pullRequestOpenedPayload });
  });

  afterEach(() => {
    nock.cleanAll();
    nock.enableNetConnect();
  });
});