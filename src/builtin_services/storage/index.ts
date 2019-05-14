import { 
    Database as PostgresSQL,
    ServerSettings as PostgresSettings
} from './postgresql'

export enum StorageType {
    Postgres = 'postgres'
}

export interface StorageSettings {
    type: StorageType|string
    settings: PostgresSettings|any
}

export {
    Database as PostgresSQL,
    ServerSettings as PostgresServerSettings,
    DatabaseStructure as PostgresDatabaseStructure,
    TableStructure as PostgresTableStructure
} from './postgresql'

export function Storage(storageSettings: StorageSettings, databaseStructure?: any):any {
    if (storageSettings.type.toLocaleLowerCase() === StorageType.Postgres && databaseStructure) {
        return new PostgresSQL(storageSettings.settings, databaseStructure)
    }
    return null
}
