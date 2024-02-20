class ResponseCodes {
    /** OK (Request succeeded) */
    public static readonly SUCCESS = 200;
    /** (Request resulted in a new resource) */
    public static readonly CREATED = 201;
    /** (Invalid request syntax or parameters) */
    public static readonly BAD_REQUEST = 400;
    /** (Authentication required or credentials invalid) */
    public static readonly UNAUTHORIZED = 401;
    /** (Request is understood but refused) */
    public static readonly FORBIDDED = 403;
    /** (Resource not found) */
    public static readonly NOT_FOUND = 404;
    /** Internal Server Error (Generic server error) */
    public static readonly INTERNAL_SERVER_ERROR = 500;
}

export default ResponseCodes;
