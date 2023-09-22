
const mysql = require('mysql')

type table = string
type confident = string

export const mysql_query = {
    /**
     * 查询表中的所有字段的数据，提供条件则查询符合条件的数据,未提供条件则返回所有数据
     * @param table_name { string } 表名
     * @param confident { string } 查询条件
     * @return { string } 返回可供MySQL操作数据库的语句
     */
    selectAll(table_name:table, confident:confident='') {
        if (confident === '') {
            return `SELECT * FROM ${table_name}`
        }
        else {
            return `SELECT * FROM ${table_name} WHERE ${confident}`
        }
    },
    /**
     * 查询表中数据数量，提供条件则查询符合条件的数据的数量,未提供条件则返回所有数据的数量
     * @param table_name { string } 表名
     * @param confident { string } 查询条件
     * @return { string } 返回可供MySQL操作数据库的语句
     */
    selectCount(table_name:table, confident:confident='') {
        if (confident === '') {
            return `SELECT COUNT(1) FROM ${table_name}`
        }
        else {
            return `SELECT COUNT(1) FROM ${table_name} WHERE ${confident}`
        }
    },
    /**
     * 查询数据库中的字段数据，提供条件则查询符合条件与所给字段的数据，未提供则查询所给字段的所有数据
     * @param table_name { string } 表名
     * @param fields { string } 查询字段
     * @param confident { string } 查询条件
     * @return { string } 返回可供MySQL操作数据库的语句
     */
    selectFields(table_name:table, fields:string, confident:confident=''){
        if (confident === '') {
            return `SELECT ${fields} FROM ${table_name}`
        }
        else {
            return `SELECT ${fields} FROM ${table_name} WHERE ${confident}`
        }
    },
    /**
     * 查询表中给定数量的数据，提供条件则查询给定数量并符合条件的数据，未提供则查询表中给定数量的数据
     * @param table_name { string } 表名
     * @param number { string } 数量
     * @param confident { string } 查询条件
     * @return { string } 返回可供MySQL操作数据库的语句
     */
    selectAllWithLimit(table_name:table,number:number,confident:confident){
        if (!confident){
            return `SELECT * FROM ${table_name} LIMIT ${number}`
        }
        else {
            return `SELECT * FROM ${table_name} WHERE ${confident} LIMIT ${number}`
        }
    },
    /**
     * 查询表中数据结果集并排序
     * @param table_name { string } 表名
     * @param confident { string } 查询条件
     * @param orderByFields { string } 结果集字段
     * @param descOrAsc { string } 升序/降序
     * @return { string } 返回可供MySQL操作数据库的语句
     */
    selectAllOrderByFields(table_name:table,confident:confident,orderByFields:string,descOrAsc:string){
        if (!confident){
            return `SELECT * FROM ${table_name} ORDER BY ${orderByFields} ${descOrAsc}`
        }
        else{
            return `SELECT * FROM ${table_name} WHERE ${confident}  ORDER BY ${orderByFields} ${descOrAsc}`
        }
    },
    /**
     * 查询表中字段数据结果集并排序
     * @param table_name { string } 表名
     * @param fields { string } 字段
     * @param confident { string } 查询条件
     * @param orderByFields { string } 结果集字段
     * @param descOrAsc { string } 升序/降序
     * @return { string } 返回可供MySQL操作数据库的语句
     */
    selectFieldsOrderByFields(table_name:table,fields:string,confident:confident,orderByFields:string,descOrAsc:string){
        if (!confident){
            return `SELECT ${fields} FROM ${table_name} ORDER BY ${orderByFields} ${descOrAsc}`
        }
        else{
            return `SELECT ${fields} FROM ${table_name} WHERE ${confident}  ORDER BY ${orderByFields} ${descOrAsc}`
        }
    },
    /**
     * 模糊查询
     * @param table_name { string } 表名
     * @param fields { string } 查询字段
     * @param keyword { string } 模糊词
     * @return { string } 返回可供MySQL操作数据库的语句
     */
    selectAllByLike(table_name:table,fields:string,keyword:string){
        return `SELECT * FROM ${table_name} WHERE CONCAT(${fields}) Like ${keyword}`
    },
    /**
     * 内连接查询
     * @param tableOne { string } 表1
     * @param tableTwo { string } 表2
     * @param fields { string } 字段
     * @param aliasOne { string } 别名1
     * @param aliasTwo { string } 别名2
     * @param confident { string } 查询条件
     * @return { string } 返回可供MySQL操作数据库的语句
     */
    selectWithInnerJoin(tableOne:table,tableTwo:table,fields:string,aliasOne:string,aliasTwo:string,confident:confident){
        return `SELECT ${fields} FROM ${tableOne} as ${aliasOne} INNER JOIN ${tableTwo} as ${aliasTwo} ON ${confident}`
    },
    /**
     * 数据库增加数据操作
     * @param table_name { string } 表名
     * @param fields { string } 字段
     * @param values { any } 数据
     * @return { string } 返回可供MySQL操作数据库的语句
     */
    insert(table_name:table,fields:string,values:any){
        return `INSERT INTO ${table_name} (${fields}) VALUES (${values})`
    },
    /**
     * 更新数据库数据
     * @param table_name { string } 表名
     * @param values { any } 数据
     * @param confident { string } 更新条件
     * @return { string } 返回可供MySQL操作数据库的语句
     */
    update(table_name:table,values:any,confident:confident) {
        return `UPDATE ${table_name} SET ${values} WHERE ${confident}`
    },
    /**
     * 数据库删除操作
     * @param table_name { string } 表名
     * @param confident { string } 删除条件
     * @return { string } 返回可供MySQL操作数据库的语句
     */
    deleteOperation(table_name:table,confident:confident){
        return `DELETE FROM ${table_name} WHERE ${confident}`
    }
}

export function connect(){
    return mysql.createPool({
        host: 'localhost',
        user: 'root',
        password: '19961212',
        database: 'chat',
        multipleStatements: true
    })
}