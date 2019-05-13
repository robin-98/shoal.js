
export abstract class Storage {
    abstract get(type_or_table: string, obj_identity: any): any
    abstract set(type_or_table: string, obj_identity: any, obj: any): any
}