export interface ResponseWrapper<T> {
    msg: string;
    no: string;
    errorcode?: Error;
    success: boolean;
    state: string;
    state_code: string;
    response_object: T;
}
