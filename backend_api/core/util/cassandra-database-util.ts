/*
 *author Yasura Dissanayake
 * Created on Sat Jul 01 2023
 *
 */

import { TableColumn, TableSchema, usersSchema } from "../model/table-schema";
import { condition } from "./condition-interface";
import { executeQuery, executeQueryOptions } from "./database";

import { CassandraQueryBuilder } from "./query-builder";
import { areDataTypesEqual, mapInsertParams } from "./utility-service";

const Uuid = require("cassandra-driver").types.Uuid;
class CassandraDatabaseUtil {
  /**
   * load table schemas to specify tables structure
   */

  private tableSchemas: { [key: string]: TableSchema } | undefined;

  constructor() {
    this.tableSchemas = {
      users: usersSchema,
    };
  }

  /**
   *
   * @param tableName
   * @param schema
   */
  async createTableIfNotExists(
    tableName: string,
    schema: TableSchema,
    ttl?: number
  ): Promise<void> {
    if (!schema) {
      console.error(`Table schema not provided for table: ${tableName}`);
      return;
    }
    let existingColumns = await this.getTableColumns(tableName);
    const schemaCol = schema.columns.sort((a, b) =>
      a.name.localeCompare(b.name)
    );
    const newColumns = schemaCol.filter((column) => {
      return !existingColumns.some(
        (existing) => existing.name.trim() === column.name.trim()
      );
    });

    if (newColumns.length > 0) {
      const columnsList: string[] = [];
      newColumns.forEach((colu) => {
        columnsList.push(` ${colu.name} ${colu.type}`);
      });
      await this.dropAndCreateTable(tableName, schema.columnsSchema);
    }

    existingColumns = await this.getTableColumns(tableName);
    const newColType = schemaCol.filter((column) => {
      return !existingColumns.some(
        (existing) =>
          !areDataTypesEqual(existing.type, column.type) &&
          existing.name === column.name &&
          existing.type.trim().toLowerCase() ===
            column.type.trim().toLowerCase()
      );
    });

    if (newColType.length > 0) {
      const columnsList: string[] = [];
      newColType.forEach((colu) => {
        columnsList.push(` ${colu.name} ${colu.type}`);
      });
      await this.dropAndCreateTable(tableName, schema.columnsSchema);
    }

    const ttlClause = ttl ? `WITH default_time_to_live = ${ttl}` : "";
    const query = `CREATE TABLE  IF NOT EXISTS mspconnect.${tableName} (${schema.columnsSchema.join(
      ", "
    )}) ${ttlClause}`;

    await executeQuery(query);
  }
  /**
   * get column names by table name
   * @param tableName
   * @returns
   */
  async getTableColumns(tableName: string): Promise<TableColumn[]> {
    const query = `SELECT column_name, type FROM system_schema.columns WHERE keyspace_name = 'mspconnect' AND table_name = '${tableName}'`;
    const tableColumns: TableColumn[] = [];
    return await executeQuery(query)
      .then((result) => {
        if (Array.isArray(result.rows)) {
          result.rows.forEach((row: any) => {
            const col = {} as TableColumn;
            col.name = row.get("column_name");
            col.type = row.get("type");
            tableColumns.push(col);
          });
        }
        return tableColumns;
      })
      .catch(() => {
        return [];
      });
  }

  getColumnDefinition(column: TableColumn): string {
    return `${column.name} ${column.type}`;
  }

  /**
   * drop and create table if changes found in the schema
   * @param tableName
   * @param columnsToAdd
   * @returns
   */
  async dropAndCreateTable(
    tableName: string,
    columnsToAdd: string[]
  ): Promise<void> {
    if (columnsToAdd.length === 0) {
      return;
    }

    try {
      const tempTableName = `${tableName}_temp`;

      await this.dropTable(tempTableName);
      await this.createTable(tempTableName, columnsToAdd);
      await this.cloneData(tempTableName, tableName);
      await this.dropTable(tableName);
      // await this.renameTable(tempTableName, tableName);
      await this.createTable(tableName, columnsToAdd);
      await this.cloneData(tableName, tempTableName);
      await this.dropTable(tempTableName);
      console.log(`Table ${tableName} dropped and created successfully.`);
    } catch (error) {
      console.error(`Failed to drop and create table ${tableName}:`, error);
    }
  }
  async alterTableColumnType(
    tableName: string,
    columnsToUpdate: TableColumn[]
  ): Promise<void> {
    if (!(tableName && this.tableSchemas)) {
      throw new Error(`Table schema not initialized`);
    }
    const schema = this.tableSchemas[tableName];
    if (!schema) {
      throw new Error(`Table schema not found: ${tableName}`);
    }

    columnsToUpdate.forEach(async (col) => {
      const query = `ALTER TABLE mspconnect.${tableName} ALTER ${col.name} TYPE ${col.type}`;
      await executeQuery(query);
    });
  }
  /**
   * read customized Query
   * @param query
   * @param id
   * @returns
   */
  async execute(query: string, id?: string): Promise<any> {
    // Execute a query with optional parameters
    try {
      const result = await (id
        ? executeQuery(query)
        : executeQueryOptions(query, [id]));
      if (result.rows.length > 0) {
        return result.rows;
      } else {
        throw new Error(`Query read error `);
      }
    } catch (error) {
      // Handle query execution errors
      throw new Error(`Failed to execute query: ${error}`);
    }
  }
  getObjectValues<T>(obj: any): Array<T[keyof T]> {
    return Object.keys(obj).map((key) => obj[key as keyof T]);
  }
  /**
   * insert data in to define table schema column
   * @param tableName // table name is table that need do the change
   * @param data // values that going to insert
   * @returns
   */

  async create(tableName: string, data: any, ttl?: number): Promise<any> {
    if (this.tableSchemas == undefined) {
      throw new Error(`Table schema not findable: ${tableName}`);
    }

    // Create a new object in the specified table
    const schema = this.tableSchemas[tableName];
    if (!schema) {
      console.error("Table not found");
      throw new Error(`Table schema not found: ${tableName}`);
    }

    await this.createTableIfNotExists(tableName, schema, ttl);

    const columns = schema.columns
      .filter(
        (column) =>
          data.hasOwnProperty(column.name) && column.name != schema.primaryKey
      )
      .map((column) => column.name)
      .join(", ");

    const values = schema.columns
      .filter(
        (column) =>
          data.hasOwnProperty(column.name) && column.name != schema.primaryKey
      )
      .map((column) => {
        if (data[column.name] === null || data[column.name] === undefined) {
          return "";
        } else if (typeof data[column.name] === "string") {
          return `${data[column.name]}`;
        }
        return data[column.name];
      });

    const placeholders = Array(values.length).fill("?").join(", ");
    const _uuid = !data?.[schema.primaryKey]
      ? Uuid.random()
      : data[schema.primaryKey];
    const query = `INSERT INTO mspconnect.${tableName} (${schema.primaryKey}, ${columns}) VALUES (${_uuid}, ${placeholders}) IF NOT EXISTS`;
    console.log(query);
    const comData = [...values];

    try {
      await executeQueryOptions(query, comData);
      console.log("Insertion successful", _uuid);
      return _uuid;
    } catch (error) {
      console.error("Insertion failed:", error);
      throw new Error("Failed to insert data");
    }
  }

  
  /**
   * read table data according to request table name  can be customize the table columns as per need
   * @param tableName // required table name
   * @param id // Id is the primary key of the table
   * @param columnsList // required columns that need to specify
   * @returns
   */
  async read(
    tableName: string,
    id?: string | null,
    columnsList?: string[] | null,
    conditions?: condition[] | null,
    contains?: boolean | null,
    limit?: number | null
  ): Promise<any> {
    console.log(`read ${tableName}`);
    // Read an object from the specified table by ID
    if (this.tableSchemas == undefined) {
      return null;
    }
    const schema = this.tableSchemas[tableName];
    let columns = "";
    if (columnsList && columnsList.length > 0) {
      columns = columnsList.join(", ");
    } else {
      const tempColumns: string[] = [];
      schema.columns.forEach((col) => {
        tempColumns.push(col.name);
      });
      columns = tempColumns.join(", ");
    }

    await this.createTableIfNotExists(tableName, schema);

    // console.log(createNewTable);
    let query = id
      ? `SELECT  ${columns} FROM mspconnect.${tableName} WHERE ${schema.primaryKey} = ${id}`
      : `SELECT  ${columns} FROM mspconnect.${tableName}`;

    if (conditions) {
      query += id ? " AND" : " WHERE";
      const conditionClauses = conditions.map(
        contains
          ? (con) => `${con.key} CONTAINS ${con.value}`
          : (con) => `${con.key} = ${con.value}`
      );
      query += ` ${conditionClauses.join(" AND ")}`;
    }

    limit ? (query += ` limit ${limit}`) : "";
    query += " ALLOW FILTERING";

    //console.log(query)
    const result = await executeQuery(query);
    console.log("executed the query." + query);
    if (result.rows) {
      return result.rows.length > 0 ? result.rows : [];
    } else {
      throw new Error(
        `Object with ID ${id} not found in table ${schema.tableName}`
      );
    }
  }

  async readByBuilder(queryBuilder: CassandraQueryBuilder): Promise<any> {
    console.log(`read ${queryBuilder.tableName}`);
    // Read an object from the specified table by ID
    if (this.tableSchemas == undefined) {
      return null;
    }
    const schema = this.tableSchemas[queryBuilder.tableName];
    if (queryBuilder.columnCount === 0) {
      queryBuilder.selectMany(schema.columns.map((c) => c.name));
    }

    await this.createTableIfNotExists(queryBuilder.tableName, schema);

    // console.log(createNewTable);
    let query = queryBuilder.build();

    console.log(query);
    const result = await executeQuery(query);
    console.log("executed the query." + query);
    console.log("executed the result ", result.rows);
    if (result.rows) {
      return result.rows.length > 0 ? result.rows : [];
    } else {
      throw new Error(`Object not found in table ${schema.tableName}`);
    }
  }

  /**
   * update table data according to selected table name
   * should enter valid table schema data
   * @param tableName
   * @param id
   * @param data
   * @returns
   */

  async update(
    tableName: string,
    id: string,
    data: any,
    conditions?: condition[]
  ): Promise<any> {
    console.log(`Update ${tableName}`);
    if (!this.tableSchemas) {
      throw new Error(`Table schemas not available for ${tableName}`);
    }

    const schema = this.tableSchemas[tableName];

    await this.createTableIfNotExists(tableName, schema);

    const columns = schema.columns
      .filter(
        (column) =>
          column.name !== schema.primaryKey && data.hasOwnProperty(column.name)
      )
      .map((column) => column.name);

    const values: any[] = [];
    const placeholders: string[] = [];

    columns.forEach((column) => {
      values.push(data[column]);
      placeholders.push("?");
    });

    const setClause = columns.map((column) => `${column} = ?`).join(", ");

    let query = `UPDATE mspconnect.${schema.tableName} SET ${setClause} WHERE ${schema.primaryKey} = ?`;
    let _values: any = [];
    if (conditions) {
      const keys = conditions.map((c) => `${c.key} = ?`);
      _values = conditions.map((c) => c.value);
      query = `UPDATE mspconnect.${
        schema.tableName
      } SET ${setClause} WHERE ${keys.join(" AND ")}`;
    } else {
      _values = [Uuid.fromString(id)];
    }
    console.log(query);
    try {
      return await executeQueryOptions(query, [...values, ..._values]);
    } catch (error) {
      console.error("Update failed:", error);
      throw error;
    }
  }

  /**
   *
   * @param tableName
   * @param id
   * @returns
   */
  async delete(
    tableName: string,
    id: string,
    primaryKey: string
  ): Promise<any> {
    // Delete an object from the specified table by ID
    if (this.tableSchemas == undefined) {
      return null;
    }
    const schema = this.tableSchemas[tableName];
    const query = `DELETE FROM mspconnect.${schema.tableName} WHERE ${primaryKey} = ?`;
    return await executeQueryOptions(query, [id]);
  }

  /**
   * drop given table by name
   * @param tableName
   */
  async dropTable(tableName: string): Promise<void> {
    const dropTableQuery = `DROP TABLE IF EXISTS mspconnect.${tableName}`;
    await executeQuery(dropTableQuery);
  }

  /**
   * create table according to provided column list
   * @param tableName
   * @param columns
   */
  async createTable(
    tableName: string,
    columns: string[],
    ttl?: number
  ): Promise<void> {
    const ttlClause = ttl ? `WITH default_time_to_live = ${ttl}` : "";
    const createTableQuery = `CREATE TABLE  IF NOT EXISTS mspconnect.${tableName} (${columns.join(
      ", "
    )}) ${ttlClause}`;
    await executeQuery(createTableQuery);
  }

  /**
   * clone data from table - to table
   * @param fromTable
   * @param toTable
   */
  async cloneData(fromTable: string, toTable: string): Promise<void> {
    const selectDataQuery = `SELECT * FROM mspconnect.${fromTable}`;
    const existingTableData = await executeQuery(selectDataQuery);

    if (
      existingTableData &&
      existingTableData.rows &&
      existingTableData.rows.length > 0
    ) {
      const insertDataQuery = `INSERT INTO mspconnect.${toTable} (${Object.keys(
        existingTableData.first()
      )}) VALUES (${Object.keys(existingTableData.first()).map(
        (_, i) => `?`
      )})`;
      const insertDataParams = existingTableData.rows.map((row) =>
        mapInsertParams(Object.values(row))
      );

      for (const params of insertDataParams) {
        await executeQueryOptions(insertDataQuery, params);
      }
    }
  }
  /**
   * rename table name
   * @param fromTable
   * @param toTable
   */
  async renameTable(fromTable: string, toTable: string): Promise<void> {
    const renameTableQuery = `ALTER TABLE mspconnect.${fromTable} RENAME TO mspconnect.${toTable.toLowerCase()}`;
    await executeQuery(renameTableQuery);
  }
}

export default CassandraDatabaseUtil;
