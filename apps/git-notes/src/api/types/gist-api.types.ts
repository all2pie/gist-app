export interface User {
  name?: string | null;
  email?: string | null;
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  gravatar_id: string | null;
  url: string;
  html_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  starred_url: string;
  subscriptions_url: string;
  organizations_url: string;
  repos_url: string;
  events_url: string;
  received_events_url: string;
  type: string;
  site_admin: boolean;
  starred_at?: string;
  user_view_type?: string;
}

export interface GistFile {
  filename: string;
  type: string;
  language: string | null;
  raw_url: string;
  size: number;
  encoding?: string;
}

export interface Gist {
  url: string;
  forks_url: string;
  commits_url: string;
  id: string;
  node_id: string;
  git_pull_url: string;
  git_push_url: string;
  html_url: string;
  files: Record<string, GistFile>;
  public: boolean;
  created_at: string;
  updated_at: string;
  description: string | null;
  comments: number;
  user: User | null;
  comments_url: string;
  // Optional fields that may appear in extended responses
  owner?: User;
  truncated?: boolean;
  comments_enabled?: boolean;
  forks?: unknown[];
  history?: unknown[];
}

export type GistList = Gist[];

export interface CreateGistData {
  description: string;
  public: boolean;
  files: Record<string, { content: string }>;
}

// Pagination types
export interface PaginationParams {
  page?: number;
  per_page?: number;
}

export interface PaginationInfo {
  first?: string;
  prev?: string;
  next?: string;
  last?: string;
  page: number;
  per_page: number;
  total_pages?: number;
}

export interface PaginatedResponse<T> {
  data: T;
  pagination: PaginationInfo;
}
