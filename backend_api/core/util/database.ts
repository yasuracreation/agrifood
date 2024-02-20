import CassandraClient from "./cassandra-client";
import { getConfig } from "./config-service.util.service";

const dbHost: string = getConfig("DB_HOST") as string;
const port: string = getConfig("DB_PORT") as string;
const database: string = getConfig("DB_DATABASE") as string;

const cassandraClient = new CassandraClient(
    [`${dbHost}:${port}`],
    `${database}`
);

cassandraClient.connect();

export const executeQuery = async (query: string) => {
    return await cassandraClient.execute(query);
};
export const executeQueryOptions = async (query: string, option: any[]) => {
    return await cassandraClient.executeOptions(query, option);
};
cassandraClient.shutdown();
