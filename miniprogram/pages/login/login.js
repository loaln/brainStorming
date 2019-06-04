const app = getApp();
const db = wx.cloud.database();
Page({
  data: {
    //判断小程序的API，回调，参数，组件等是否在当前版本可用。
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    avatarUrl: '',
    // userInfo: {},
  },
  onLoad: function() {
    var that = this;
    that.onGetOpenid(); //同步问题待解决?

    that.setData({
      avatarUrl: getApp().globalData.avatarUrl
    })

    // 查看是否授权
    wx.getSetting({
      success: function(res) {
        //如果授权了，就调用接口获取信息，然后跳转页面
        if (res.authSetting['scope.userInfo']) {
          wx.getUserInfo({
            success: function(res) {
              //从数据库获取用户信息
              // that.queryUsreInfo();
              //将获取到的用户头像链接保存下来
              that.setData({
                avatarUrl: res.userInfo.avatarUrl
              })
              //修改用户头像链接
              getApp().globalData.avatarUrl = res.userInfo.avatarUrl
              wx.redirectTo({
                url: '../themes/themes',
              })
              //打印用户信息
              console.log(res.userInfo);
            }
          });
        }
      }
    })
  },
  bindGetUserInfo: function(e) {
    // console.log(e.detail.userInfo);
    // console.log('111');
    if (e.detail.userInfo) {
      //用户按了允许授权按钮
      var that = this;

      that.setData({
        avatarUrl: getApp().globalData.avatarUrl
      })
      //插入登录的用户的相关信息到数据库
      // wx.request({
      //   url: getApp().globalData.urlPath + 'hstc_interface/insert_user',
      //   data: {
      //     openid: getApp().globalData.openid,
      //     nickName: e.detail.userInfo.nickName,
      //     avatarUrl: e.detail.userInfo.avatarUrl,
      //     province: e.detail.userInfo.province,
      //     city: e.detail.userInfo.city
      //   },
      // header: {
      // 'content-type': 'application/json'
      // },
      // success: function(res) {
      //从数据库获取用户信息
      // that.queryUsreInfo();
      // console.log("插入小程序登录用户信息成功！");
      // }
      // });
      // that.onGetOpenid();

      //授权成功后，跳转进入小程序首页
      wx.redirectTo({
        url: '../themes/themes',
      })
    } else {
      //用户按了拒绝按钮
      wx.showModal({
        title: '警告',
        // content: '您点击了拒绝授权，将无法进入小程序，请授权之后再进入!!!',
        content: '您点击了拒绝授权，将无法进入小程序，为确保您的使用体验，请授权之后再进入哦!',
        showCancel: false,
        confirmText: '返回授权',
        success: function(res) {
          if (res.confirm) {
            console.log('用户点击了“返回授权”')
          }
        }
      })
    }
  },
  //获取用户信息接口
  // queryUsreInfo: function () {
  //   wx.request({
  //     url: getApp().globalData.urlPath + 'hstc_interface/queryByOpenid',
  //     data: {
  //       openid: getApp().globalData.openid
  //     },
  //     header: {
  //       'content-type': 'application/json'
  //     },
  //     success: function (res) {
  //       console.log(res.data);
  //       getApp().globalData.userInfo = res.data;
  //     }
  //   });
  // }

  //获取openId
  onGetOpenid: function() {
    // 调用云函数
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        console.log('[云函数] [login] user openid: ', res.result.openid)
        app.globalData.openid = res.result.openid;

        db.collection('themeAndPerson').where({
          _openid: res.result.openid
        }).get({
          success: res => {
            if (res.data.length == 0) {
              console.log(res.data.length)
              db.collection('themeAndPerson').add({
                data: {
                  theme: []
                },
                success: res => {
                  console.log('success')
                  },
                fail: err => {}
              })
            }
          }
        })


      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
      }
    })
  }

})