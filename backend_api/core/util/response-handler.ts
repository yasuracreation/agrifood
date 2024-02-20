
import { Response } from "express";
import { mapSuccessResponse, mapErrorResponse } from "../mapper/response-mapper";
import ResponseCodes from "../const/app-response-status-codes";

export const appResponse = {
    Success<T>(response: Response, result?: T): Response {
        return response.status(ResponseCodes.SUCCESS).json(mapSuccessResponse(result));
    },
    NotFound(response: Response, message?: string): Response {
        return response.status(ResponseCodes.NOT_FOUND).json(mapErrorResponse(message || "Not Found", message, ResponseCodes.NOT_FOUND));
    },
    BadRequest(response: Response, message?: string): Response {
        return response.status(ResponseCodes.BAD_REQUEST).json(mapErrorResponse(message || "Bad Request", message, ResponseCodes.BAD_REQUEST));
    },
    Unauthorized(response: Response, message?: string): Response {
        return response.status(ResponseCodes.UNAUTHORIZED).json(mapErrorResponse(message || "Unauthorized", message, ResponseCodes.UNAUTHORIZED));
    },
    Forbidded(response: Response, message?: string): Response {
        return response.status(ResponseCodes.FORBIDDED).json(mapErrorResponse(message || "Forbidden", message, ResponseCodes.FORBIDDED));
    },
    InternalServerError(response: Response, message?: string): Response {
        return response.status(ResponseCodes.INTERNAL_SERVER_ERROR).json(mapErrorResponse(message || "Something went wrong", message, ResponseCodes.INTERNAL_SERVER_ERROR));
    }
}