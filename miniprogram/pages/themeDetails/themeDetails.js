// miniprogram/pages/themeDetails/themeDetails.js
var util = require("../../utils/utils.js");
const app = getApp();
const db = wx.cloud.database();
var elseOpenId;
var join; // 判断用户是否被邀请，1是，0不是

Page({

  /* 页面的初始数据 */
  data: {
    avatarUrl: '',    //用户头像url
    avatarUrlArr: '', //themeData中avatarUrl字段，所有参与用户的头像url
    indexThemeId: '', //themeData的_id
    themeData: {},
  },

  /* 生命周期函数--监听页面加载 */
  onLoad: function(options) {
    console.log('[themeDetails] [options]: ', options);
    join = options.join;
    this.setData({
      avatarUrl: getApp().globalData.avatarUrl,
      indexThemeId: options.indexThemeId
    })
    console.log('主题详情页数据', this.data)
    this.onQuery();
    this.getThemeDetail();
    this.onGetOpenid();
    this.checkUser(join);
    // util.onQuery("themeData", "_id", options.themeId,this.setThemeData);
  },


  /* 从数据库获取主题及备注等信息 */
  onQuery: function() {
    var that = this;
    var themeData = [];
    var indexThemeId = that.data.indexThemeId;  //获取themeData的_id

    db.collection('themeData').doc(indexThemeId).get({
      success:res=>{
        // console.log('[themeData] [indexThemeId]: ',res);
        that.setData({
          avatarUrlArr: res.data.avatarUrl
        })
        console.log('[themeData] [avatarUrl]: ', that.data.avatarUrl);
      }
    })

    wx.showNavigationBarLoading();
    db.collection('themeDetailsData').where({
      themeId: this.data.indexThemeId
    }).get({
      success: res => {
        // wx.hideNavigationBarLoading();
        console.log('[数据库] [查询记录] 成功: ', res.data);

        var subject = res.data[0];
        var theme = subject.theme; //主题名
        var remark = subject.remark;
        var themeIndex = subject.themeIndex
        var temp = {
          theme: theme,
          remark: remark,
          themeId: subject.themeId,
          _id: subject._id,
          themeIndex: themeIndex,
          gradation: subject.gradation
        }
        themeData.push(temp); //把数据push到数组里
        that.setData({
          themeData: themeData
        })
        // 嵌套查询
        db.collection('secondLevelThemeDetails').where({
          themeId: subject._id
        }).get({
          success: res => {
            //二级主题的表里查询到的数据
            for (var i = 0; i < res.data.length; i++) {
              var subject1 = res.data[i];
              var secondTheme = subject1.theme;
              var remark = subject1.remark;
              var themeIndex = subject1.themeIndex
              var temp1 = {
                theme: secondTheme,
                remark: remark,
                themeId: subject1.themeId,
                _id: subject1._id,
                themeIndex: themeIndex,
                gradation: subject1.gradation
              }
              themeData.push(temp1);
              that.setData({
                themeData: themeData
              })
              // **************************************************************
              db.collection('thirdLevelThemeDetails').where({
                themeId: subject1._id
              }).get({
                success: res => {
                  //三级主题的表里查询到的数据
                  // console.log('三级查询',res.data)
                  for (var j = 0; j < res.data.length; j++) {

                    var subject2 = res.data[j];
                    var thirdTheme = subject2.theme;
                    var remark = subject2.remark;
                    var themeIndex = subject2.themeIndex
                    var temp2 = {
                      theme: thirdTheme,
                      remark: remark,
                      themeId: subject2.themeId,
                      _id: subject2._id,
                      themeIndex: themeIndex,
                      gradation: subject2.gradation
                    }
                    themeData.push(temp2);
                    // console.log('themedata', themeData),
                    // console.log(subject1._id)
                  }
                  that.setData({
                    themeData: themeData
                  })
                },
                fail: err => {
                  console.error('themeDetails三级数据查询失败：', err)
                }
              })
              // *********************************************************
            }
            wx.hideNavigationBarLoading();
            console.log('themeData详情：', that.data.themeData);
          },
          fail: err => {
            console.error('themeDetails二级数据查询失败：', err)
          }
        })

      },
      fail: err => {
        console.error('themeDetails查询失败：', err)
      }
    })
  },

  /*  */
  onIdeaDeatails: function(e) {
    var id = e.currentTarget.dataset.id;
    var themeIndex = e.currentTarget.dataset.themeIndex;
    var gradation = e.currentTarget.dataset.gradation;
    // console.log(gradation)
    wx.navigateTo({
      url: '/pages/ideaList/ideaList?id=' + id + "&themeIndex=" + themeIndex + '&gradation=' + gradation + '&indexThemeId=' + this.data.indexThemeId
    })
  },

  /* 引用云函数getThemeDetail渲染数据 */
  //小程序端
  getThemeDetail: function(options) {
    var that = this
    wx.cloud.callFunction({
      name: 'getThemeDetail', //这个是云函数名
      success: function(e) {
        console.log('[云函数] [addOpenid] 调用成功', e)
        // that.setData({
        //   list: e.result  //设置值
        // })
      },
      fail: function(e) {
        console.log('[云函数] [addOpenid] 调用失败', e)
      }
    })
  },

  onShow: function() {
    this.onQuery();
  },

  /* 调用云函数--获取用户openid和头像地址avatarUrl */
  onGetOpenid: function() {
    var that = this;
    var avatarUrl = that.data.avatarUrl;  //用户头像地址Url
    elseOpenId = app.globalData.openid;   //页面全局变量，传递被邀请好友的openid
    var id = that.data.indexThemeId;      //themeData的id号
    // console.log('id:' + id + ',elseOpenId:' + elseOpenId)

    //调用云函数--为一级主题添加小组成员
    wx.cloud.callFunction({
      name: 'addOpenid',
      data: {
        id: that.data.indexThemeId,
        avatarUrl: avatarUrl
      },
      success: res => {
        console.log('[云函数] [addOpenid] 调用成功: ', res)
      },
      fail: err => {
        console.error('[云函数] [addOpenid] 调用失败', err)
      }
    })
  },

  /* 调用云函数--为一级主题添加小组成员 */
  //该处没有调用，可能因为异步的问题，有些数据没获取到，导致无法添加失败
  //临时处理方法：将其嵌套在onGetOpenid()函数中
  setOpenIds: function() {
    var that = this;
    var id = that.data.indexThemeId;
    console.log('id:' + id + ',elseOpenId:' + elseOpenId)
    wx.cloud.callFunction({
      name: 'addOpenid',
      data: {
        _id: that.data.indexThemeId,
        elseOpenId: elseOpenId
      },
      success: res => {
        console.log('[云函数] [addOpenid] 调用成功: ', res)
      },
      fail: err => {
        console.error('[云函数] [addOpenid] 调用失败', err)
      }
    })
  },

  /* 判断用户是否被邀请，如果是压入主题 */
  checkUser: function(join) {
    var that = this;
    var themeId = that.data.indexThemeId; //themeData主题id

    if (join == 1) {                      // 用户被邀请参与该主题
      wx.cloud.callFunction({             //引用云函数存用户与主题的联系themeAndPerson
        name: 'themeAndPerson',           //这个是云函数名
        data: {
          themeId: themeId,
          openid: app.globalData.openid,
          join: 1
        },
        success: res => {
          console.log('[云函数] [themeAndPerson] [themeDetails] 调用成功: ', res)
        },
        fail: err => {
          console.error('[云函数] [themeAndPerson] [themeDetails] 调用失败', err)
        }
      })
    }
  },

  /* 用户点击右上角分享 */
  onShareAppMessage: function() {
    // let users = wx.getStorageSync('user');
    // if (res.from === 'button') { }
    var that = this;
    var indexThemeId; //首页themeData的_id
    indexThemeId = that.data.indexThemeId;
    return {
      title: '转发',
      path: 'pages/themeDetails/themeDetails?indexThemeId=' + indexThemeId + '&join=' + 1,
      success: function(res) {}
    }
  },

  /* 页面相关事件处理函数--监听用户下拉动作 */
  onPullDownRefresh: function () {
    var that=this;
    that.onQuery();
    //当逻辑执行完后关闭刷新    
    wx.stopPullDownRefresh();
  },

  /* 跳转生成图片页面 */
  toImg:function(){
    wx.navigateTo({
      url: '../img/img',
    })
  }

})