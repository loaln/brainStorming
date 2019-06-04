// miniprogram/pages/newIdea.js
const app=getApp();
Page({

  /* 页面的初始数据 */
  data: {
    theme: '',
    remark: ''
  },

  /* 生命周期函数--监听页面加载 */
  onLoad: function(options) {

  },

  onFinished: function(event) {
    //将数据添加到数据库
    this.onAdd();
    console.log(this.data);
    //关闭所有页面,打开主题页
    wx.reLaunch({
      url: '../themes/themes',
    })
  },

  onAdd: function() {
    const db = wx.cloud.database()
    var themeId;
    db.collection('themeData').add({
      data: {
        theme: this.data.theme,
        remark: this.data.remark,
        avatarUrl: new Array()
      },
      success: res => {
        themeId = res._id;
        console.log(themeId)
        //引用云函数存用户与主题的联系themeAndPerson
        wx.cloud.callFunction({
          name: 'themeAndPerson', //这个是云函数名
          data: {
            themeId: themeId,
            openid: app.globalData.openid,
            join:0
          },
          success: res => {
            console.log('themeAndPerson用户ID~~[云函数] [login] user openid: ', res)
          },
          fail: err => {
            console.error('themeAndPerson用户ID~~[云函数] [login] 调用失败', err)
          }
        })

        // 在返回结果中会包含新创建的记录的 _id(此id为themeData的_id)
        db.collection('themeDetailsData').add({
          data: {
            themeIndex: 1,
            ideas: {},
            theme: this.data.theme,
            remark: this.data.remark,
            themeId: res._id,
            gradation: this.data.theme,
          },
          success: res => {
            
          },
          fail: err => {}
        })
        
        wx.showToast({
          title: '新建主题成功',
        })
        console.log('新建主题成功')
      },
      fail: err => {
        console.error('新建主题失败')
      }
    })
  },
  getTheme: function(e) {
    this.setData({
      theme: e.detail.value
    })
  },
  getRemark: function(e) {
    this.setData({
      remark: e.detail.value
    })
  },

})