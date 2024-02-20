type SQLOperator = 'OR' | 'AND';
type Operator = '=' | '>' | '<' | '<>' | 'CONTAINS' | 'IN';

interface Condition {
    column: string,
    operator: Operator,
    value: string
}

export class CassandraQueryBuilder {
    private _table: string;
    private _columns: string[];
    private _conditions: Array<Condition | SQLOperator>;
    constructor(table: string) {
        this._table = table;
        this._columns = [];
        this._conditions = [];
    }

    get tableName() {
        return this._table;
    }

    get columnCount() {
        return this._columns.length;
    }

    selectAll() {
        this._columns = [];
        return {
            where: this._where,
            ...this
        };
    }

    select(...columns: string[]) {
        this._columns = columns;
        return {
            where: this._where,
            ...this
        };
    }

    selectMany(columns: string[]) {
        this._columns = [...this._columns, ...columns];
        return {
            where: this._where,
            ...this
        };
    }

    private _where = (column: string, operator: Operator, value: string) => {
        this._conditions.push({ column, operator, value });
        return {
            ...this,
            and: this._and,
            or: this._or,
        };
    }

    private _and = (column: string, operator: Operator, value: string) => {
        this._conditions.push('AND');
        return this._where(column, operator, value);
    }

    private _or = (column: string, operator: Operator, value: string) => {
        this._conditions.push('OR');
        return this._where(column, operator, value);
    }

    build = () => {
        if (this._columns.length === 0) {
            throw new Error('No columns selected.');
        }

        let query = `SELECT ${this._columns.join(', ')} FROM mspconnect.${this._table}`;

        if (this._conditions.length > 0) {
            query += ' WHERE ';

            this._conditions.forEach((condition, index) => {
                if (index !== 0 && (condition === 'AND' || condition === 'OR')) {
                    query += ` ${condition} `;
                } else {
                    const { column, operator, value } = condition as Condition;
                    query += `${column} ${operator} ${value}`;
                }
            });
        }

        return query + ' ALLOW FILTERING';
    }
}