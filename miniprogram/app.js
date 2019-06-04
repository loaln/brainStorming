//app.js
App({
  onLaunch: function() {

    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        traceUser: true,
      })
    }
    // wx.login({
    //   success: function(res) {
    //     if (res.code) {
    //       //TODO
    //     } else {
    //       console.log('获取用户登录态失败！' + res.errMsg)
    //     }
    //   }
    // })

    // this.globalData = {}

  },

  globalData: {
    avatarUrl: '/images/user-unlogin.png',
  }
})