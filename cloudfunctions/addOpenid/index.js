// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()
const _ = db.command

// 云函数入口函数
// 该函数用于将被邀请进来的成员加入小组
exports.main = async(event, context) => {

  var id = event.id;                 //一级主题id号
  var avatarUrl = event.avatarUrl;  //传递被邀请好友的openid

  const arr = await db.collection('themeData').where({
    _id: id
  }).get();

  arrOpenids = arr.data[0].avatarUrl;

  //判断用户是否已经加入
  for (var i = 0; i <= arrOpenids.length; i++) {
    if(i==arrOpenids.length){
      if (arrOpenids[i] === avatarUrl) {
        break;
      } else {
        try {
          await db.collection('themeData').where({
            _id: id
          })
            .update({
              data: {
                avatarUrl: _.push(avatarUrl)
              }
            })
        } catch (e) {
          console.error(e);
        }
        break;
      }
    }else{
      if (arrOpenids[i] === avatarUrl) {
        break;
      } else {
        continue;
      }
    }
  }

  // const wxContext = cloud.getWXContext()
  return {
    sum: event,
    arr: arr,
    arrOpenids: arrOpenids,
    avatarUrl: avatarUrl,
    // openid: wxContext.OPENID,
    // appid: wxContext.APPID,
    // unionid: wxContext.UNIONID,
  }
}