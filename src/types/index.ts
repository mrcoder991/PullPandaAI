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