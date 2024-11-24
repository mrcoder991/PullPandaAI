import { RestEndpointMethodTypes } from "@octokit/rest";

export enum HttpMethod {
  GET = "GET",
  DELETE = "DELETE",
  HEAD = "HEAD",
  OPTIONS = "OPTIONS",
  POST = "POST",
  PUT = "PUT",
  PATCH = "PATCH",
  PURGE = "PURGE",
  LINK = "LINK",
  UNLINK = "UNLINK",
}

export interface PRDetails {
  owner: string;
  repo: string;
  pull_number: number;
  title: string;
  description: string;
  commit_id: string;
}

export type RepoDetails = RestEndpointMethodTypes["repos"]["get"]["response"] & {
  
}

export interface Review {
  lineNumber: string;
  reviewComment: string;
}

export interface AiResponse {
  reviews: Review[];
}

export interface ReviewComment { 
  body: string;
  path: string;
  line: number;
}

export enum CommandFlag {
  FullReviewEnabled = "fullReviewEnabled",
  SoftReviewEnabled = "softReviewEnabled",
  ReviewSkipped = "reviewSkipped"
}

export type CommandFlags = {
  [key in CommandFlag]?: boolean;
};

export type CommandHandler = (context: any, flag: CommandFlag) => Promise<CommandFlag>;
