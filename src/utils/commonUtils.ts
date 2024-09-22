import { AxiosRequestConfig, Method, ResponseType } from "axios";
import { ignoreFiles } from "../constants.js";
import { Chunk, File } from "parse-diff";
import {
  AiResponse,
  PRDetails,
  Review,
  ReviewComment,
} from "../types/index.js";
import { apiKey } from "./config.js";

export const isEmpty = (value?: string | object): boolean =>
  value === undefined ||
  value === null ||
  (typeof value === "object" && Object.keys(value).length === 0) ||
  (typeof value === "string" && value.trim().length === 0);

export const createConfig = ({
  url,
  method,
  body,
  responseType,
}: {
  url: string;
  method: Method;
  body?: object;
  responseType?: ResponseType;
}) => {
  const config: AxiosRequestConfig = {
    method: method,
    maxBodyLength: Infinity,
    url,
    headers: {
      accept: "application/json",
      "X-Authorization": `Bearer ${apiKey}`,
    },
    responseType: responseType || "json",
  };
  if (!isEmpty(body)) {
    config.data = body;
  }
  return config;
};

export const createDiffPrompt = (
  file: File,
  chunk: Chunk,
  prDetails: PRDetails
): string => {
  return `
  ****(scenario 1)**** 
  File name "${file.to}" \n
  Pull request title: ${prDetails.title} \n
  Pull request description: 
  ---
  ${prDetails.description}
  ---
  
  Git diff to review:
  
  \`\`\`diff
  ${chunk.content}
  ${chunk.changes
    // @ts-expect-error - ln and ln2 exists where needed
    .map((c) => `${c.ln ? c.ln : c.ln2} ${c.content}`)
    .join("\n")}
  \`\`\`
  `;
};

export const createComment = (
  file: File,
  aiResponses: AiResponse
): ReviewComment[] => {
  if (!aiResponses.reviews) {
    return [];
  }
  return aiResponses.reviews.flatMap((aiResponse: Review) => {
    if (!file.to) {
      return [];
    }
    return {
      body: aiResponse.reviewComment,
      path: file.to,
      line: Number(aiResponse.lineNumber),
    };
  });
};

export const shouldIgnoreFile = (filePath: string = ""): boolean => {
  return ignoreFiles.filter((value, index, self) => self.indexOf(value) === index)
    .some((pattern) =>
      new RegExp(pattern.replace(/\./g, "\\.").replace(/\*/g, ".*")).test(
        filePath
      )
    );
};
