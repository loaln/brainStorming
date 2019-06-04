// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {

  // 先取出集合记录总数
  const countResult = await db.collection('todos').count()
  const total = countResult.total
  // 计算需分几次取
  const batchTimes = Math.ceil(total / 100)
  // 承载所有读操作的 promise 的数组
  const tasks = []
  for (let i = 0; i < batchTimes; i++) {
    const promise = db.collection('todos').skip(i * MAX_LIMIT).limit(MAX_LIMIT).get()
    tasks.push(promise)
  }
  // 等待所有
  return (await Promise.all(tasks)).reduce((acc, cur) => ({
    data: acc.data.concat(cur.data),
    errMsg: acc.errMsg,
  }))


  // const wxContext = cloud.getWXContext() // 这里获取到的 openId 和 appId 是可信的

  //直接通过wxcontext获取该用户的openid
  // const openid = wxContext.OPENID
  //承载所有读操作的promise的数组
  const list = []

    // .where({
    //   _id: 'c0a3987b5cea49da05e16c1e5c9bb5a3',
    //   // _openid: openid,
    //   // group_reveal: 0
    // })

  //接下来是开始查询，先根据openid获取到相关的group，这里获取的是列表
  await db.collection('themeDetailsData').where().get()
    //循环查询到的列表，对每个列表进行对应数据的查询
    for (let i = 0; i < res.data.length; i++) {
      //per1用来定义最终的我想要的对象，插入结果list中的对象，根据对应的caricd得到carMsg对象
      let per1 = db.collection('carMsg').where({
        _id: res.data[i].carMsg
      }).get().then(ce => {
        //根据carMsg对象中的openid获得user对象
        return db.collection('user').where({
          _openid: ce.data[0]._openid
        }).get().then(ue => {
          //声明对象，为下面拼接对象用
          const per = {}
          //拼接自己想要的信息
          per.groupid = res.data[i]._id
          per.openid = res.data[i]._openid
          per.carid = res.data[i].carMsg
          per.endPoint = ce.data[0].carMsg.endPoint
          per.lowNum = ce.data[0].carMsg.lowNum
          per.estimate = ce.data[0].carMsg.estimate
          per.people = ce.data[0].carMsg.people
          per.nickName = ue.data[0].nickName
          per.avatarUrl = ue.data[0].avatarUrl
          // 返回对象
          return per
        })
      })
      //加入到列表中
      list.push(per1)
    }
  })

  // return (await Promise.all(list))
}