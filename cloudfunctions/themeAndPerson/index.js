// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()
const _ = db.command

// 云函数入口函数
// 存储用户与他加入的主题的关系表
exports.main = async (event, context) => {

  var id = event.themeId;       //themeData的id号
  var openid = event.openid;    //登陆用户的openid号
  var join = event.join;        //获取用户是否为邀请，0否，1是

  const check = await db.collection('themeAndPerson').where({
    _openid: openid
  }).get();
  var checkArr = check.data[0].theme;

  if(join==1){
    
    for (var i = 0; i <= checkArr.length; i++) {
      if (i == checkArr.length) {
        if (checkArr[i] === id) {
          break;
        } else {
          try {
            await db.collection('themeAndPerson').where({
              _openid: openid
            })
              .update({
                data: {
                  theme: _.push(id)
                }
              })
          } catch (e) {
            console.error(e);
          }
          break;
        }
      } else {
        if (checkArr[i] === id) {
          break;
        } else {
          continue;
        }
      }
    }
  }else{
    try {
      await db.collection('themeAndPerson').where({
        _openid: openid
      })
        .update({
          data: {
            theme: _.push(id)
          }
        })
    } catch (e) {
      console.error(e);
    }
  }
  
  return {
    sum:event,
    check: check,
    checkArr: checkArr,
    join: join
  }
}