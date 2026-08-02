import type { Response } from "express";

import type {
  ApiPaginatedResponse,
  ApiSuccessResponse,
  PaginationMetadata,
} from "../types/api-response.js";

export const sendSuccess = <T>(
  response: Response,
  statusCode: number,
  data: T,
  message?: string,
): Response<ApiSuccessResponse<T>> => {
  const responseBody: ApiSuccessResponse<T> = {
    success: true,
    data,
  };

  if (message !== undefined) {
    responseBody.message = message;
  }

  return response.status(statusCode).json(responseBody);
};

export const sendPaginatedSuccess = <T>(
  response: Response,
  statusCode: number,
  data: T[],
  pagination: PaginationMetadata,
  message?: string,
): Response<ApiPaginatedResponse<T>> => {
  const responseBody: ApiPaginatedResponse<T> = {
    success: true,
    data,
    pagination,
  };

  if (message !== undefined) {
    responseBody.message = message;
  }

  return response.status(statusCode).json(responseBody);
};