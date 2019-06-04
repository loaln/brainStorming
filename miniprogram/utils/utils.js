//从数据库获取集合信息(函数未封装好)
function onQuery(dataset, _id, thisId,callback) {
  // var that = this;
  // var data = new Array();
  // var data = {};
  const db = wx.cloud.database()
  // 查询当前用户所有的 counters
  db.collection(dataset).where({
    _id: thisId
  }).get({
    success: res => {
      console.log('[数据库] [查询记录] 成功: ', res.data);

      // console.log(that.data);
      callback(res.data);
      console.log("该主题的数据:", res.data);
    },
    fail: err => {
      // wx.showToast({
      //   icon: 'none',
      //   title: '查询记录失败'
      // })
      console.error('[数据库] [查询记录] 失败：', err)
    }

  })
}

// 通过export这个出口输出到别的脚本文件里去,在别的js文件中引用
module.exports = {
  onQuery: onQuery
  
}