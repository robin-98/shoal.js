import * as utils from 'sardines-utils'
import * as postgres from './base'

const builtInKeywords = {
    'CURRENT_TIMESTAMP': true
}

export class Database extends postgres.DatabaseBase {

    constructor(settings: postgres.PostgresSQLSettings, dbStruct: postgres.DatabaseStructure) {
        super(settings, dbStruct)
    }

    private getColumnType(table: string, colName: string): string {
        const tableStruct = this.dbStruct[table]
        if (!tableStruct) {
            throw utils.unifyErrMesg(`Do not have table structure for table [${table}]`, 'postgres', 'database structure')
        }
        const colType = tableStruct[colName]
        if (typeof colType === 'undefined') {
            throw utils.unifyErrMesg(`Invalid column [${colName}], which is not defined in the table structure of table [${table}]`, 'postgres', 'sql statement')
        } else if (typeof colType !== 'string') {
            throw utils.unifyErrMesg(`Invalid column definition for column [${colName}] in table [${table}]`, 'postgres', 'table structure')
        } else if (colType.toUpperCase() === 'CONSTRAINTS') {
            throw utils.unifyErrMesg(`Invalid column name [${colName}] for table [${table}], which is a reserved keyword`, 'postgres', 'sql statement')
        }
        return colType.toUpperCase()
    }
    
    private parseValueForSQLStatement = (table: string, colName: string, value: any): string => {
        const colType = this.getColumnType(table, colName)
        let result = ''
        switch (typeof value) {
            case 'object':
            // result = `'${JSON.stringify(value).replace(/'/g, '"')}'`
            result = `'${JSON.stringify(value)}'`
            if (colType === 'JSONB') result += '::jsonb'
            break
    
            case 'string':
            if (value in builtInKeywords) result = value
            else result = `'${value}'`
            break
    
            default:
            result = `${value}`
            break
        }
        return result
    }

    private parseIdentities (table: string, identities: any) {
        let SQL = ''
        if (identities) {
            let cnt = 0
            for (let key in identities) {
                const value = this.parseValueForSQLStatement(table, key, identities[key])
                if (cnt === 0) SQL += ' WHERE '
                else SQL += ' AND '
                SQL += `${key} = ${value}`
                cnt++
            }
        }
        return SQL
    }

    private getFullTableName(table:string) {
        return (this.settings.schema) ? `${this.settings.schema}.${table}` : table
    }

    async get(table: string, identities?: any): Promise<any> {
        const exists = await this.tableExists(table)
        if (!exists) return null

        const fullTableName = this.getFullTableName(table)
        let SQL = `SELECT * FROM ${fullTableName}`

        if (identities) SQL += this.parseIdentities(table, identities)
        
        SQL += ';'

        const res = await this.query(SQL)
        if (res && res.rows) {
            if (res.rows.length === 0) return null
            if (res.rows.length === 1) return res.rows[0]
            else return res.rows
        }
        return res
    }

    async set(table:string, obj: any, identities?: any): Promise<any>{
        const tableStruct = this.dbStruct[table]
        if (!tableStruct) {
            throw utils.unifyErrMesg(`Do not have table structure for table [${table}]`, 'postgres', 'database structure')
        }
        let SQL = ''
        const tableExists = await this.tableExists(table)
        const fullTableName = this.getFullTableName(table)
        
        if (!identities && obj) {
            // Insert command
            // If table does not exist, create one if possible
            if (!tableExists) await this.createTable(table)

            SQL = `INSERT INTO ${fullTableName} (`
            for (let key in obj) {
                SQL += `${key}, `
            }

            if (SQL[SQL.length-1] === ' ') SQL = SQL.substr(0, SQL.length-2)
            else throw utils.unifyErrMesg(`Invalid insert command for empty object`, 'postgres', 'sql statement')

            SQL += ') VALUES ('
            for(let key in obj) {
                const value = this.parseValueForSQLStatement(table, key, obj[key])
                console.log(`${table}.${key}: ${value}`)
                SQL += `${value}, `
            }
            if (SQL[SQL.length-1] === ' ') SQL = SQL.substr(0, SQL.length-2)
            SQL += ');'
        } else if (identities && obj) {
            // Update commmand
            SQL = `UPDATE ${fullTableName} SET `
            for (let key in obj) {
                const value = obj[key]
                SQL += `${key} = ${this.parseValueForSQLStatement(table, key, value)}, `
            }
            if (SQL[SQL.length-1] === ' ') SQL = SQL.substr(0, SQL.length-2) 

            SQL += ` ${this.parseIdentities(table, identities)};`
        } else if (identities && !obj) {
            // Delete command
            SQL = `DELETE from ${fullTableName} ${this.parseIdentities(table, identities)};`
        }
        const res = await this.query(SQL)
        return res
    }
}