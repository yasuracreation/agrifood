// configService.ts
import * as dotenv from "dotenv";
import { getENVFileName } from "../util/utility-service";
dotenv.config({ path: `environments/${getENVFileName(process.env.NODE_ENV)}` });
// Define the type for the configuration object
interface Config {
    DB_HOST: string;
    DB_PORT: string;
    DB_USERNAME: string;
    DB_PASSWORD: string;
    DB_DATABASE: string;
    API_KEY: string;
    ENABLE_CREATE_TABLE_ON_READ: boolean;
    ENABLE_CREATE_TABLE_ON_CREATE: boolean;
    ENABLE_CREATE_TABLE_ON_UPDATE: boolean;
    DROP_AND_CREATE_TABLE: boolean;
    DROP_AND_CREATE_TABLE_ON_TYPE_CHANGE: boolean;
    PW_SALT: string;
    GOOGLE_CLIENT_ID: string;
    GOOGLE_CLIENT_SECRET: string;
    BACKEND_DOMAIN: string;
    JWTSECKEY: string;
    DEFAULT_PASSWORD: string;
    VERIFY_EMAIL_LINK: string;
    RESET_PASSWORD_EMAIL_LINK: string;
    TWILIO_AUTH_TOKEN: string;
    TWILIO_VERIFY_SID: string;
    TWILIO_PHONE_NO: string;
    AD_LOCATION: string;
    SEVER_PORT: string;
    JWT_EXPIRE_TIME: string;
    FILE_UPLOAD_PATH: string;
    KEY_SPACE: string;
    MASTER_DATA_ROW_ID: string;
    TECH_MATCHING_PERCENTAGE: string;
    AUTH_SESSION_EXPIRE_TIME: string;
    MAIN_DOMAIN: string;
    NOTIFICATION_SOCKET_PORT: number;
}

// Load environment variables from the .env file
dotenv.config();

// Define the configuration object with default values
const config: Config = {
    DB_HOST: process.env.DB_HOST || "default_db_host",
    DB_PORT: process.env.DB_PORT || "default_db_port",
    DB_USERNAME: process.env.DB_USERNAME || "default_db_username",
    DB_PASSWORD: process.env.DB_PASSWORD || "default_db_password",
    DB_DATABASE: process.env.DB_DATABASE || "default_db_database",
    API_KEY: process.env.API_KEY || "default_api_key",
    ENABLE_CREATE_TABLE_ON_READ:
        process.env.ENABLE_CREATE_TABLE_ON_READ === "true" || false,
    ENABLE_CREATE_TABLE_ON_CREATE:
        process.env.ENABLE_CREATE_TABLE_ON_CREATE === "true" || false,
    ENABLE_CREATE_TABLE_ON_UPDATE:
        process.env.ENABLE_CREATE_TABLE_ON_UPDATE === "true" || false,
    DROP_AND_CREATE_TABLE:
        process.env.DROP_AND_CREATE_TABLE === "true" || false,
    DROP_AND_CREATE_TABLE_ON_TYPE_CHANGE:
        process.env.DROP_AND_CREATE_TABLE_ON_TYPE_CHANGE === "true" || false,
    PW_SALT: process.env.PW_SALT || "default_pw_salt",
    GOOGLE_CLIENT_ID:
        process.env.GOOGLE_CLIENT_ID || "default_GOOGLE_CLIENT_ID",
    GOOGLE_CLIENT_SECRET:
        process.env.GOOGLE_CLIENT_SECRET || "default_GOOGLE_CLIENT_SECRET",
    BACKEND_DOMAIN: process.env.BACKEND_DOMAIN || "default_BACKEND_DOMAIN",
    JWTSECKEY: process.env.JWTSECKEY || "default_JWTSECKEY",
    DEFAULT_PASSWORD:
        process.env.DEFAULT_PASSWORD || "5da8c672626snlktcbduhfladc761",
    VERIFY_EMAIL_LINK: process.env.VERIFY_EMAIL_LINK || "VERIFY_EMAIL_LINK",
    RESET_PASSWORD_EMAIL_LINK:
        process.env.RESET_PASSWORD_EMAIL_LINK || "RESET_PASSWORD_EMAIL_LINK",
    TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN || "TWILIO_AUTH_TOKEN",
    TWILIO_VERIFY_SID: process.env.TWILIO_VERIFY_SID || "TWILIO_VERIFY_SID",
    TWILIO_PHONE_NO: process.env.TWILIO_PHONE_NO || "TWILIO_PHONE_NO",
    AD_LOCATION: process.env.AD_LOCATION || "AD_LOCATION",
    SEVER_PORT: process.env.SEVER_PORT || "8080",
    JWT_EXPIRE_TIME: process.env.JWT_EXPIRE_TIME || "1h",
    FILE_UPLOAD_PATH: process.env.FILE_UPLOAD_PATH || "uploads/",
    KEY_SPACE: process.env.KEY_SPACE || "mspconnect",
    MASTER_DATA_ROW_ID: process.env.MASTER_DATA_ROW_ID || "VALUE NOT FOUND",
    TECH_MATCHING_PERCENTAGE: process.env.TECH_MATCHING_PERCENTAGE || "50",
    AUTH_SESSION_EXPIRE_TIME: process.env.AUTH_SESSION_EXPIRE_TIME || "60",
    MAIN_DOMAIN: process.env.MAIN_DOMAIN || "http://techifuze.com",
    NOTIFICATION_SOCKET_PORT:
        Number(process.env.NOTIFICATION_SOCKET_PORT) || 5001,
};

// Function to get the configuration value based on the key
function getConfig<K extends keyof Config>(key: K): Config[K] {
    return config[key];
}

export { getConfig };
