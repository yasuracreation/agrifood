import { Client, errors, types } from "cassandra-driver";

class CassandraClient {
    private client: Client;

    constructor(contactPoints: string[], localDataCenter: string) {
        this.client = new Client({
            contactPoints,
            localDataCenter,
        });
    }

    connect() {
        this.client
            .connect()
            .then(() => {
                console.log("Connected to Cassandra");
                // Any other logic or operations you want to perform after the connection is established
            })
            .catch(this.HandleErrors);
    }

    async execute(query: string): Promise<types.ResultSet> {
        return await this.client.execute(query).catch(this.HandleErrors);
    }
    async executeOptions(query: string, options: any) {
        return this.client
            .execute(query, options, { prepare: true })
            .catch(this.HandleErrors);
    }

    shutdown() {
        this.client.shutdown();
    }

    private HandleErrors = (error: any) => {
        if (error instanceof errors.ResponseError) {
            console.error("Cassandra ResponseError:", error.message);
        } else if (error instanceof errors.NoHostAvailableError) {
            console.error("No Cassandra hosts are available:", error.message);
        } else if (error instanceof errors.DriverError) {
            console.error("Cassandra DriverError:", error.message);
        } else if (error instanceof errors.OperationTimedOutError) {
            console.error("Operation timed out:", error.message);
        } else if (error instanceof errors.ArgumentError) {
            console.error("Cassandra ArgumentError:", error.message);
        } else if (error instanceof errors.AuthenticationError) {
            console.error("Cassandra AuthenticationError:", error.message);
        } else if (error instanceof errors.BusyConnectionError) {
            console.error("Cassandra BusyConnectionError:", error.message);
        } else if (error instanceof errors.DriverInternalError) {
            console.error("Cassandra DriverInternalError:", error.message);
        } else if (error instanceof errors.NotSupportedError) {
            console.error("Cassandra NotSupportedError:", error.message);
        } else {
            console.error("Other error:", error);
            throw error;
        }
        throw error.message;
    };
}

export default CassandraClient;
