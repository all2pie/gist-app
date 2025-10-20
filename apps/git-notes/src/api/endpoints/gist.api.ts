import { api } from '../client';
import {
  CreateGistData,
  Gist,
  GistList,
  PaginationParams,
  PaginatedResponse,
  User,
} from '@/api/types/gist-api.types';
import { parseLinkHeader } from '../utils/pagination';

export const getGists = async (params: PaginationParams = {}) => {
  const { page = 1, per_page = 10 } = params;
  const response = await api.get<GistList>('/gists/public', {
    params: { page, per_page },
  });

  const pagination = parseLinkHeader(
    response.headers.link || null,
    page,
    per_page
  );

  return {
    data: response.data,
    pagination,
  } as PaginatedResponse<GistList>;
};

export const getStarredGists = async (params: PaginationParams = {}) => {
  const { page = 1, per_page = 10 } = params;
  const response = await api.get<GistList>('/gists/starred', {
    params: { page, per_page },
  });

  const pagination = parseLinkHeader(
    response.headers.link || null,
    page,
    per_page
  );

  return {
    data: response.data,
    pagination,
  } as PaginatedResponse<GistList>;
};

export const getGistsByUsername = async (
  username: string,
  params: PaginationParams = {}
) => {
  const { page = 1, per_page = 10 } = params;
  const response = await api.get<GistList>(`/users/${username}/gists`, {
    params: { page, per_page },
  });

  const pagination = parseLinkHeader(
    response.headers.link || null,
    page,
    per_page
  );

  return {
    data: response.data,
    pagination,
  } as PaginatedResponse<GistList>;
};

export const getGistDetails = async (id: string) => {
  const response = await api.get<Gist>(`/gists/${id}`);
  return response.data;
};

export const forkGist = async (id: string) => {
  const response = await api.post<Gist>(`/gists/${id}/forks`);
  return response.data;
};

export const isGistStarred = async (id: string) => {
  try {
    await api.get(`/gists/${id}/star`);
    return true;
  } catch {
    return false;
  }
};

export const starGist = async (id: string) => {
  const response = await api.put(`/gists/${id}/star`);
  return response.data;
};

export const unStarGist = async (id: string) => {
  const response = await api.delete(`/gists/${id}/star`);
  return response.data;
};

export const createGist = async (data: CreateGistData) => {
  const response = await api.post<Gist>('/gists', data);
  return response.data;
};

export const getGistFileContent = async (rawUrl: string) => {
  const response = await fetch(rawUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch file content: ${response.statusText}`);
  }
  return response.text();
};

export const getCurrentUser = async () => {
  const response = await api.get<User>('/user');
  return response.data;
};
