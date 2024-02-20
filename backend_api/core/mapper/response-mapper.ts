import { ResponseWrapper } from "../model/response-wrapper.model";

export function mapSuccessResponse<T>(data: T): ResponseWrapper<T> {
    return {
        msg: "Success",
        no: "1",
        success: true,
        state: "OK",
        state_code: "200",
        response_object: data,
    };
}

export function mapErrorResponse(
    errorMsg: string,
    errorCode: any,
    status_code?: number
): ResponseWrapper<null> {
    //// TODO /// need to implement mapping object like error message , code , status code , error code macanisums

    return {
        msg: errorMsg,
        no: "1",
        errorcode: errorCode,
        success: false,
        state: "Error",
        state_code: String(status_code) || "500",
        response_object: null,
    };
}