import { File } from "parse-diff";
import { AiResponse, PRDetails, ReviewComment } from "../types/index.js";
import { getResponseForPrompt } from "./getResponseForPrompt.js";
import {
  createComment,
  createDiffPrompt,
  shouldIgnoreFile,
} from "./commonUtils.js";
import { Context } from "probot";

export const analyzeCode = async (
  parsedDiff: File[],
  prDetails: PRDetails,
  chatId: string,
  context: Context<"pull_request">
): Promise<ReviewComment[]> => {
  const comments: ReviewComment[] = [];

  for (const file of parsedDiff) {
    // Example usage
    if (file.to === "/dev/null" || shouldIgnoreFile(file.to)) continue; // Ignore deleted files and files in the ignore list
    for (const chunk of file.chunks) {
      const prompt = createDiffPrompt(file, chunk, prDetails);
      let newComments: ReviewComment[] = [];
      try {
        const aiResponse = await getResponseForPrompt(chatId, prompt, context);
        // json gets parsed correctly that means the response is valid
        const parsedAiResponse: AiResponse = JSON.parse(
          aiResponse.replace(/```json/g, "").replace(/```/g, "")
        );
        newComments = createComment(file, parsedAiResponse);
      } catch (error) {
        context.log.error("Error:", error);
        continue;
      }

      if (newComments) {
        comments.push(...newComments);
      }
    }
  }
  return comments;
}

export const getReviewBody = async (chatId: string, context: Context<"pull_request">): Promise<string> => {
  const prompt =
    "****(scenario 2)**** Can you please provide an overall analysis of the entire pull request based on the individual file reviews?";
  return await getResponseForPrompt(chatId, prompt, context);
};
