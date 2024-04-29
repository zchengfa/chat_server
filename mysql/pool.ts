const mysql = require('mysql')

const TABLE_NAME_NORMAL = 'users'

type table = string
type confident = string

function mysql_query() {
    return {
        /**
         * 查询表中的所有字段的数据，提供条件则查询符合条件的数据,未提供条件则返回所有数据
         * @param table_name { string } 表名
         * @param confident { string } 查询条件
         * @return { string } 返回可供MySQL操作数据库的语句
         */
        selectAll(table_name:table, confident:confident=''): string {
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
        selectCount(table_name:table, confident:confident=''):string {
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
        selectFields(table_name:table, fields:string, confident:confident=''):string{
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
        selectAllWithLimit(table_name:table,number:number,confident:confident):string{
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
        selectAllOrderByFields(table_name:table,confident:confident,orderByFields:string,descOrAsc:string):string{
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
        selectFieldsOrderByFields(table_name:table,fields:string,confident:confident,orderByFields:string,descOrAsc:string):string{
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
        selectAllByLike(table_name:table,fields:string,keyword:string):string{
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
        selectWithInnerJoin(tableOne:table,tableTwo:table,fields:string,aliasOne:string,aliasTwo:string,confident:confident): string{
            return `SELECT ${fields} FROM ${tableOne} as ${aliasOne} INNER JOIN ${tableTwo} as ${aliasTwo} ON ${confident}`
        },
        /**
         * 数据库增加数据操作
         * 当multi为true时，说明需要一次性插入多条数据
         * values的值需要传入一个数组,数组中的对象属性，以及属性个数，都需要与传入fields个数、名字一致
         * 例如：fields = 'field1,field2'
         * values = [{
         *   field1:'x',
         *   field2:'x
         * }]
         * @param table_name { string } 表名
         * @param fields { string } 字段
         * @param values { any } 数据
         * @param multi {true | false} 是否一次性插入多条数据
         * @return { string } 返回可供MySQL操作数据库的语句
         */
        insert(table_name:table,fields:string,values:any,multi:boolean = false): string{
            let statement:string = ''
            if(!multi){
                statement = `INSERT INTO ${table_name} (${fields}) VALUES (${values})`
            }
            else{
                let fieldArr = fields.split(','),realValues = ''
                values.forEach((item:any)=>{
                    let childValue = ''
                    fieldArr.forEach((field:any)=>{
                        childValue +=  "'"+item[field] + "',"
                    })
                    childValue = '(' + childValue.substring(0,childValue.length - 1) + '),'
                    realValues += childValue
                })
                realValues = realValues.substring(0,realValues.length -1)
                statement = `INSERT INTO ${table_name} (${fields}) VALUES ${realValues}`
            }
            return  statement
        },
        /**
         * 更新数据库数据
         * @param table_name { string } 表名
         * @param values { any } 数据
         * @param confident { string } 更新条件
         * @return { string } 返回可供MySQL操作数据库的语句
         */
        update(table_name:table,values:any,confident:confident): string {
            return `UPDATE ${table_name} SET ${values} WHERE ${confident}`
        },
        /**
         * 数据库删除操作
         * @param table_name { string } 表名
         * @param confident { string } 删除条件
         * @return { string } 返回可供MySQL操作数据库的语句
         */
        deleteOperation(table_name:table,confident:confident):string{
            return `DELETE FROM ${table_name} WHERE ${confident}`
        },
        /**
         * 使用IN一次性查询多条数据
         * @param table_name {string} 表名
         * @param fields {string} 字段，字段为空时默认查询全部字段
         * @param where {string} 条件字段
         * @param inValues {string} 条件字段可选择的范围
         * @return {string} 返回可供MySQL操作数据库的语句
         */
        selectMultipleAtOnceWithIn(table_name:string,fields:string,where:string,inValues:string):string{
            return `SELECT ${fields ? fields : '*'} FROM ${table_name} WHERE ${where} IN (${inValues})`
        }
    }
}

export function connect(callback:Function){
    let pool = mysql.createPool({
        host: process.env.SQL_HOST,
        user: process.env.SQL_USER,
        password: process.env.SQL_PASS,
        database: process.env.SQL_DATABASE,
        multipleStatements: true
    })
    pool.self_query = mysql_query()
    pool.query(`select * from ${TABLE_NAME_NORMAL}`,(err:any,res:any)=>{
        if(err) callback('MySQL出现错误，请检查是否开启该服务或测试表名是否正确',undefined)
        if(res) callback(undefined,'MySQL服务运行中')
    })

    return pool

}