import { Request, Response } from "express";
import { isRequiredFieldsAvailable } from "../util/utility-service";
import { appResponse } from "../util/response-handler";

class Authentication{
    async login(req:Request , res: Response){
        const requiredFields = ["userName", "password"];
        const isValid = isRequiredFieldsAvailable(req.body, requiredFields);
        if (!isValid) {
            return appResponse.BadRequest(res, "One or more required fields are empty");
        }
        const { userName, password } = req.body;
    }
}
export default new Authentication();