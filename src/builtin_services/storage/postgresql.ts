import { Pool } from 'pg'
import { Storage } from './base'
import * as utils from 'sardines-utils'

export interface PostgresSQLSettings {
    user: string
    host: string
    database: string
    password: string
    port: number
}

const parseValueForSQLStatement = (value: any): string => {
    let result = ''
    switch (typeof value) {
        case 'object':
        result = `'${utils.inspect(value)}'`
        break

        case 'string':
        result = `'${value}'`
        break

        default:
        result = `${value}`
        break
    }
    return result
}

export class PostgreSQL extends Storage {
    private pool: any
    constructor(settings: PostgresSQLSettings) {
        super()
        // Create the Pool
        this.pool = new Pool(settings)
    }

    async get(table: string, identity: any): Promise<any> {
        return new Promise((resolve, reject) => {
            try {
                this.pool.query(`SELECT * FROM ${table} WHERE id = '${identity}'`, (err: any, res: any) => {
                    if (err) reject(err)
                    else resolve(res)
                })
            } catch (err) {
                reject(err)
            }
        })
    }

    async set(table:string, identity: any, obj: {[key: string]: any}|null|undefined): Promise<any>{
        return new Promise((resolve, reject) => {
            try {
                let SQL = ''
                if (!identity && obj) {
                    // Insert command
                    SQL = `INSERT INTO ${table} (`
                    for (let key in obj) {
                        SQL += `${key}, `
                    }
                    if (SQL[SQL.length-1] === ' ') {
                        SQL = SQL.substr(0, SQL.length-2)
                    } else {
                        reject(`Invalid insert command for empty object`)
                    }
                    SQL += ') VALUES ('
                    for(let key in obj) {
                        const value = obj[key]
                        SQL += `${parseValueForSQLStatement(value)}, `
                    }
                    if (SQL[SQL.length-1] === ' ') {
                        SQL = SQL.substr(0, SQL.length-2)
                    }
                    SQL += ');'
                } else if (identity && obj) {
                    // Update commmand
                    SQL = `UPDATE ${table} SET `
                    for (let key in obj) {
                        const value = obj[key]
                        SQL += `${key} = ${parseValueForSQLStatement(value)}, `
                    }
                    if (SQL[SQL.length-1] === ' ') {
                        SQL = SQL.substr(0, SQL.length-2)
                    }
                    SQL += ` WHERE id = ${identity} ;`
                } else if (identity && !obj) {
                    // Delete command
                    SQL = `DELETE from ${table} WHERE id = ${identity};`
                }
                this.pool.query(`SELECT * FROM ${table} WHERE id = '${identity}'`, (err: any, res: any) => {
                    if (err) reject(err)
                    else resolve(res)
                })
            } catch (err) {
                reject(err)
            }
        })
    }
}

