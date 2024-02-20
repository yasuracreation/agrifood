// Define the TableSchema interface
interface TableSchema {
    tableName: string;
    columns: TableColumn[];
    primaryKey: string;
    columnsSchema: string[];
}

// Define the TableColumn interface
interface TableColumn {
    name: string;
    type: string;
}

// Define the schema for the "users" table
const usersSchema: TableSchema = {
    tableName: "users",
    columns: [
        { name: "id", type: "uuid" },
        { name: "name", type: "text" },
        { name: "email", type: "text" },
        { name: "age", type: "int" },
    ],
    primaryKey: "id",
    columnsSchema: [
        "id uuid PRIMARY KEY",
        "name text",
        "email text",
        "age int",
    ],
};

// Define the schema for the "msp" table
const mspSchema: TableSchema = {
    tableName: "msp",
    columns: [
        { name: "id", type: "uuid" },
        { name: "user_id", type: "uuid" },
        { name: "msp_id", type: "text" },
    ],
    primaryKey: "id",
    columnsSchema: ["id uuid PRIMARY KEY", "user_id uuid", "msp_id text"],
};

export { TableSchema, TableColumn, usersSchema, mspSchema };
