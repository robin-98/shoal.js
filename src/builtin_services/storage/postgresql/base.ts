import { Pool } from 'pg'
import * as utils from 'sardines-utils'

export interface TableStructure {
    CONSTRAINTS?: string[]
    [column: string]: string|string[]|undefined
}

export interface DatabaseStructure {
    [table: string]: TableStructure
}

export interface PostgresSQLSettings {
    user: string
    host: string
    database: string
    password: string
    port: number
    schema?: string
}

export class DatabaseBase {
    private pool: any
    protected settings: PostgresSQLSettings
    private existingTables: {[tablename: string]: any}
    protected dbStruct: DatabaseStructure

    constructor(settings: PostgresSQLSettings, dbStruct: DatabaseStructure) {
        // Create the Pool
        this.pool = new Pool(settings)
        this.settings = settings
        this.existingTables = {}
        this.dbStruct = dbStruct
    }
    
    public query(sql:string): Promise<any> {
        return new Promise((resolve, reject) => {
            try {
                this.pool.query(sql, (err: any, res: any) => {
                    if (err) {
                        err.query = sql
                        reject(utils.unifyErrMesg(err, 'postgres', 'query'))
                    } else {
                        resolve(res)
                    }
                })
            } catch (err) {
                err.query = sql
                reject(utils.unifyErrMesg(err, 'postgres', 'database'))
            }
        })
    }

    protected async tableExists(table: string): Promise<any> {
        let exists = false
        if (typeof this.existingTables[table] === 'undefined') {
            let SQL = `SELECT EXISTS (
                SELECT 1
                FROM   information_schema.tables 
                WHERE  table_name = '${table}'`
            if (this.settings.schema) {
                SQL += ` AND table_schema = '${this.settings.schema}'`
            }
            SQL += ');'
            const res = await this.query(SQL)
            exists = res.rows[0].exists
            this.existingTables[table] = exists
        } else exists = this.existingTables[table]
        return exists
    }

    protected hasTableDefinition(table: string): boolean {
        return (typeof this.dbStruct[table] !== 'undefined')
    }

    protected async createTable(table:string): Promise<any> {
        if (!this.hasTableDefinition(table)) {
            return Promise.reject(utils.unifyErrMesg(
                `Can not create table [${table}] because of lacking table structure`,
                'postgres',
                'table structure'
            ))
        }
        const tableStruct = this.dbStruct[table]
        let SQL = `CREATE TABLE `
        if (this.settings.schema) SQL += `${this.settings.schema}.`
        SQL += `${table} (`
        for (let colName in tableStruct) {
            if (colName === 'CONSTRAINT') continue
            const colType = tableStruct[colName]
            SQL += `${colName} ${colType}, `
        }
        if (SQL[SQL.length-1] !== ' ') throw utils.unifyErrMesg(`Table structure shall not be empty`, 'postgres', 'table structure')
        if (typeof tableStruct.CONSTRAINTS !== 'undefined') {
            for (let constraint of tableStruct.CONSTRAINTS) {
                SQL += `CONSTRAINT ${constraint}, `
            }
        }
        SQL = SQL.substr(0, SQL.length-2)
        SQL += ');'
        const res = await this.query(SQL)
        if (res) {
            this.existingTables[table] = true
        }
        return res
    }
}

