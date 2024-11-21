import * as SQLite from 'expo-sqlite';

const Database = SQLite.openDatabaseSync('app.db', {
  useNewConnection: true,
});

// Type definitions
type SchemaField = 'INTEGER' | 'TEXT' | 'REAL' | 'BLOB';
export type SchemaDefinition = Record<string, `${SchemaField}${' NOT NULL' | ' PRIMARY KEY' | ''}`>;

type LogicalOperator = 'AND' | 'OR';
type WhereCondition = [string, string, any];
type WhereClause = (WhereCondition | LogicalOperator | WhereClause)[];

type JoinType = 'INNER' | 'LEFT' | 'RIGHT';

interface JoinOptions {
  type: JoinType;
  table: string;
  on: string;
}

interface QueryOptions {
  columns?: string[];
  where?: WhereClause;
  joins?: JoinOptions[];
  groupBy?: string | string[];
  orderBy?: string | string[];
  limit?: number;
  offset?: number;
  include?: string[];
}

interface HookEvent<T> {
  beforeInsert?: (data: Partial<T>) => Promise<void> | void;
  afterInsert?: (data: Partial<T>) => Promise<void> | void;
  beforeUpdate?: (data: Partial<T>) => Promise<void> | void;
  afterUpdate?: (data: Partial<T>) => Promise<void> | void;
}

// Utility type to infer model type from schema
type InferModelType<T extends SchemaDefinition> = {
  [K in keyof T]: T[K] extends `${infer Type} NOT NULL`
    ? Type extends 'TEXT' ? string : Type extends 'INTEGER' ? number : string  // Non-nullable types
    : T[K] extends `${infer Type}` ? Type extends 'TEXT' ? string | null : Type extends 'INTEGER' ? number | null : string | null : never; // Nullable types
};

// BaseModel class
export class BaseModel<T extends SchemaDefinition, I extends InferModelType<T> = InferModelType<T>> {
  tableName: string;
  schema: T;
  relations: Record<string, { model: BaseModel<any, any>; foreignKey: string }>;
  hooks: HookEvent<I>;

  constructor(tableName: string, schema: T) {
    this.tableName = tableName;
    this.schema = schema;
    this.relations = {}
    this.hooks = {};
  }

  /**
   * Create table based on the schema
   */
  async createTable(): Promise<void> {
    const columns = Object.entries(this.schema)
      .map(([key, type]) => `${key} ${type}`)
      .join(', ');
    const query = `CREATE TABLE IF NOT EXISTS ${this.tableName} (${columns})`;
    await Database.execAsync(query);
  }

  /**
   * Add validation rules for the model
   */
  private validate(data: Partial<I>): void {
    for (const [field, rules] of Object.entries(this.schema)) {
      const value = data[field as keyof I];
      const [type, ...constraints] = rules.split(' ');

      // Type validation
      if (type === 'INTEGER' && value !== undefined && typeof value !== 'number') {
        throw new Error(`${field} must be an INTEGER.`);
      }
      if (type === 'TEXT' && value !== undefined && typeof value !== 'string') {
        throw new Error(`${field} must be a TEXT.`);
      }

      // Additional constraints
      if (constraints.includes('NOT NULL') && (value === null || value === undefined)) {
        throw new Error(`${field} cannot be null.`);
      }
    }
  }

  /**
   * Add relationships to the model
   */
  addRelation<R extends string, B extends BaseModel<any, any>>(type: R, relatedModel: B, foreignKey: string): void {
    this.relations[type] = { model: relatedModel, foreignKey };
  }

  /**
   * Populate relationships when querying
   */
  private async populate(row: I, include: string[]): Promise<I> {
    // Populate relationships if specified
    for (const relationName of include) {
      const relation = this.relations[relationName];
      if (relation) {
        const relatedModel = relation.model;
        const relatedData = await relatedModel.findAll({
          where: [[relation.foreignKey, '=', row.id]],
        });
        
        // Ensure the relationship is added correctly to the row with the correct type
        // @ts-ignore
        row[relationName] = relatedData;
      }
    }
    return row;
  }

  /**
   * Constructs WHERE clause with logical operators and grouping
   */
  private constructWhereClause(where?: WhereClause): { clause: string; values: any[] } {
    if (!where || where.length === 0) return { clause: '', values: [] };

    const values: any[] = [];
    const parseCondition = (condition: WhereCondition): string => {
      const [field, operator, value] = condition;
      if (value === null) return `${field} IS NULL`;
      if (Array.isArray(value)) return `${field} ${operator} (${value.map(() => '?').join(', ')})`;
      return `${field} ${operator} ?`;
    };

    const buildClause = (conditions: WhereClause): string[] =>
      conditions.map((item) => {
        if (Array.isArray(item)) {
          if (item[0] === 'AND' || item[0] === 'OR') {
            const [logicalOp, ...subConditions] = item as [LogicalOperator, ...WhereClause];
            return `(${buildClause(subConditions).join(` ${logicalOp} `)})`;
          }
          const condition = parseCondition(item as WhereCondition);
          const value = (item as WhereCondition)[2];
          if (Array.isArray(value)) values.push(...value);
          else if (value !== null) values.push(value);
          return condition;
        }
        return '';
      });

    const clause = `WHERE ${buildClause(where).join(' AND ')}`;
    return { clause, values };
  }

  /**
   * SELECT with support for WHERE, JOIN, GROUP BY, ORDER BY, LIMIT
   */
  async select(options: QueryOptions = {}): Promise<I[]> {
    const {
      columns = ['*'],
      where,
      joins = [],
      groupBy,
      orderBy,
      limit,
      offset,
      include = [],
    } = options;

    let query = `SELECT ${columns.join(', ')} FROM ${this.tableName}`;

    // Add JOINs
    for (const join of joins) {
      const { type, table, on } = join;
      query += ` ${type.toUpperCase()} JOIN ${table} ON ${on}`;
    }

    // Add WHERE clause
    const { clause, values } = this.constructWhereClause(where);
    if (clause) query += ` ${clause}`;

    // Add GROUP BY
    if (groupBy) query += ` GROUP BY ${Array.isArray(groupBy) ? groupBy.join(', ') : groupBy}`;

    // Add ORDER BY
    if (orderBy) query += ` ORDER BY ${Array.isArray(orderBy) ? orderBy.join(', ') : orderBy}`;

    // Add LIMIT and OFFSET
    if (limit !== undefined) query += ` LIMIT ${limit}`;
    if (offset !== undefined) query += ` OFFSET ${offset}`;

    const result = await Database.getAllAsync(query, values);
    const rows = result as I[];

    // Populate relationships if specified
    if (include.length > 0) {
      for (const row of rows) {
        await this.populate(row, include);
      }
    }

    return rows;
  }

  async findAll(filters: QueryOptions = {}): Promise<I[]> {
    return this.select(filters);
  }

  async findById(id: number, include: string[] = []): Promise<I | null> {
    const result = await this.select({ where: [['id', '=', id]], include });
    return result.length > 0 ? result[0] : null;
  }

  async insert(data: Partial<I>): Promise<number> {
    // Validate data
    this.validate(data);

    if (this.hooks.beforeInsert) await this.hooks.beforeInsert(data);

    const keys = Object.keys(data).join(', ');
    const placeholders = Object.keys(data).map(() => '?').join(', ');
    const values = Object.values(data);
    const query = `INSERT INTO ${this.tableName} (${keys}) VALUES (${placeholders})`;
    const result = await Database.runAsync(query, values);

    if (this.hooks.afterInsert) await this.hooks.afterInsert(data);
    return result.lastInsertRowId!;
  }

  async update(data: Partial<I>, where?: WhereClause): Promise<void> {
    // Validate data
    this.validate(data);

    if (this.hooks.beforeUpdate) await this.hooks.beforeUpdate(data);

    const updates = Object.keys(data)
      .map((key) => `${key} = ?`)
      .join(', ');
    const values = Object.values(data);

    const { clause, values: whereValues } = this.constructWhereClause(where);
    const query = `UPDATE ${this.tableName} SET ${updates} ${clause}`;
    await Database.runAsync(query, [...values, ...whereValues]);

    if (this.hooks.afterUpdate) await this.hooks.afterUpdate(data);
  }

  async delete(where?: WhereClause): Promise<void> {
    const { clause, values } = this.constructWhereClause(where);
    const query = `DELETE FROM ${this.tableName} ${clause}`;
    await Database.runAsync(query, values);
  }

  addHook<K extends keyof HookEvent<I>>(event: K, callback: HookEvent<I>[K]): void {
    this.hooks[event] = callback;
  }
}