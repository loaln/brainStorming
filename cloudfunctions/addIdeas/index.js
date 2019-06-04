// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()
// const _ = db.command

// 云函数入口函数
// 该函数用于添加灵感
exports.main = async (event, context) => {

  var id = event.id;
  var tableName = event.tableName;  //获取查询集合的名称
  var ideas = event.ideas;          //获取用户填写的灵感数据
  
  try {
    await db.collection(tableName).where({
      _id: id
    })
      .update({
        data: {
          ideas: ideas
        },
      })
  } catch (e) {
    console.error(e)
  }

  // const wxContext = cloud.getWXContext()
  return {
    sum: event,
  }
}