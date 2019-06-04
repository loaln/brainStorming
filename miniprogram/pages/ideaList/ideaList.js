const db = wx.cloud.database();
Page({

  /* 页面的初始数据 */
  data: {
    showAddIdeaInput: false,
    themeIndex: '',
    //记录该条记录的父级主题id号
    // themeId: '',
    ideaData: [],
    // 记录该讨论主题的id号
    id: '',
    getInput: '',
    theme: '',
    remark: '',
    gradation: '',
    indexThemeId: ''
  },

  /* 生命周期函数--监听页面加载 */
  onLoad: function(options) {
    console.log('11111', options)
    this.setData({
      themeIndex: options.themeIndex,
      id: options.id,
      gradation: options.gradation,
      indexThemeId: options.indexThemeId
    })
    if (this.data.themeIndex == 1) {
      this.onQuery('themeDetailsData');
    }
    if (this.data.themeIndex == 2) {
      this.onQuery('secondLevelThemeDetails');
    }
    if (this.data.themeIndex == 3) {
      this.onQuery('thirdLevelThemeDetails');
    }
console.log(this.data);
  },
  onQuery: function(tableName) {
    var that = this;
    wx.showNavigationBarLoading();
    db.collection(tableName).where({
      _openid: this.data.openid,
      _id: this.data.id
      // themeId: this.data.themeId
    }).get({
      success: res => {
        wx.hideNavigationBarLoading();
        that.setData({
          theme: res.data[0].theme,
          remark: res.data[0].remark
        })
        //查到有数据才给ideaData赋值，以防给ideaData赋undefined
        if (res.data[0].ideas) {
          that.setData({
            ideaData: res.data[0].ideas,
            // theme: res.data[0].theme,
            // remark: res.data[0].remark
          })
        }
        // console.log(this.data);
      },
      fail: err => {
        console.error('ideaList查询失败：', err)
      }
    })
  },

  toIdeaDetails: function(e) {
    var ideaData = JSON.stringify(this.data.ideaData)
    wx.navigateTo({
      url: 'ideaDetails/ideaDetails?theme=' + this.data.theme + '&id=' + this.data.id + '&idx=' + e.currentTarget.dataset.index + '&themeIndex=' + this.data.themeIndex + '&gradation=' + this.data.gradation + '&indexThemeId=' + this.data.indexThemeId,
      success: function(res) {},
      fail: function(res) {},
      complete: function(res) {},
    })
  },

  onMore: function(e) {
    var that = this;
    var ideaData = that.data.ideaData;
    console.log(that.data)
    wx.showActionSheet({
      itemList: ['支持', '不支持', '删除'],
      success: function(res) {
        if (res.tapIndex == 0) {
          ideaData[e.currentTarget.dataset.index].supportNum++;
          wx.showToast({
            title: '成功支持',
          })
          ideaData.sort(that.compare("supportNum"));
          that.setData({
            ideaData: ideaData
          })
          // console.log(ideaData[e.currentTarget.dataset.index])
        } else if (res.tapIndex == 1) {
          ideaData[e.currentTarget.dataset.index].supportNum--;
          wx.showToast({
            title: '表态成功',
          })
          ideaData.sort(that.compare("supportNum"));
          that.setData({
            ideaData: ideaData
          })
        } else if (res.tapIndex == 2) {
          wx.showModal({
            title: '提示',
            content: '确定删除灵感？',
            success: function(res) {
              if (res.confirm) {
                ideaData.splice(e.currentTarget.dataset.index, 1);
                // 本来可以直接数组删，但是必须调用一次setData才能重新渲染页面
                that.setData({
                  ideaData: ideaData
                })
                // this.updataIdeas('thirdLevelThemeDetails')
                console.log('ideaList122',ideaData)
                if (that.data.themeIndex == 1) {
                  // 更新数据库
                  db.collection('themeDetailsData').doc(that.data.id).update({
                    data: {
                      // data 传入需要局部更新的数据
                      ideas: ideaData
                    },
                    success(res) {
                      console.log("更新灵感成功")
                    }
                  })
                }
                if (that.data.themeIndex == 2) {
                  db.collection('secondLevelThemeDetails').doc(that.data.id).update({
                    data: {
                      ideas: ideaData
                    },
                    success(res) {
                      console.log("更新灵感成功")
                    }
                  })
                }
                if (that.data.themeIndex == 3) {
                  db.collection('thirdLevelThemeDetails').doc(that.data.id).update({
                    data: {
                      ideas: ideaData
                    },
                    success(res) {
                      console.log("更新灵感成功")
                    }
                  })
                }
              }
            }
          })
        }
        console.log(that.data.themeIndex)
        if (that.data.themeIndex == 1) {
          // 更新数据库
          db.collection('themeDetailsData').doc(that.data.id).update({
            data: {
              // data 传入需要局部更新的数据
              ideas: ideaData
            },
            success(res) {
              console.log("更新灵感成功")
            }
          })
        }
        if (that.data.themeIndex == 2) {
          db.collection('secondLevelThemeDetails').doc(that.data.id).update({
            data: {
              ideas: ideaData
            },
            success(res) {
              console.log("更新灵感成功")
            }
          })
        }
        if (that.data.themeIndex == 3) {
          db.collection('thirdLevelThemeDetails').doc(that.data.id).update({
            data: {
              ideas: ideaData
            },
            success(res) {
              console.log("更新灵感成功")
            }
          })
        }

      }
    });
  },

  compare: function(property) {
    return function(a, b) {
      var value1 = a[property];
      var value2 = b[property];
      return value2 - value1;
    }

  },

  onShowAddIdeaInput: function(e) {
    this.setData({
      showAddIdeaInput: !(this.data.showAddIdeaInput)
    })
  },

  /* 往数据库添加记录 */
  onAddIdea: function(e) {
    if (this.data.themeIndex == 1) {
      this.addIdea('themeDetailsData')
    }
    if (this.data.themeIndex == 2) {
      this.addIdea('secondLevelThemeDetails')
    }
    if (this.data.themeIndex == 3) {
      this.addIdea('thirdLevelThemeDetails')
    }
  },
  addIdea: function(tableName) {
    var ideaData;
    if (this.data.ideaData.length) {
      ideaData = this.data.ideaData;
      var newIdea = {
        idea: this.data.getInput,
        supportNum: 0
      };
      ideaData.push(newIdea);
      // console.log(this.data.ideaData)
    } else {
      ideaData = [{
        idea: this.data.getInput,
        supportNum: 0
      }];
    }
    this.setData({
      ideaData: ideaData,
      getInput: '',
      showAddIdeaInput: !(this.data.showAddIdeaInput)
    })

    //小程序端添加数据
    // db.collection(tableName).doc(this.data.id).update({
    //   data: {
    //     ideas: ideaData
    //   },
    //   success(res) {
    //     console.log("添加灵感成功")
    //   }
    // })

    /* 服务端添加数据--云端添加灵感 */
    wx.cloud.callFunction({
      name: 'addIdeas',
      data: {
        ideas: ideaData,      //用户填写的灵感对象，包括value和support
        tableName: tableName, //查询表的名称
        id: this.data.id
      },
      success: res => {
        console.log('[云函数] [addIdeas] [ideaList] 调用成功: ', res)
      },
      fail: err => {
        console.error('[云函数] [addIdeas] [ideaList] 调用失败', err)
      }
    })

  },
  onGetInput: function(e) {
    this.setData({
      getInput: e.detail.value
    })
  },

  /* 页面相关事件处理函数--监听用户下拉动作 */
  onPullDownRefresh: function() {
    if (this.data.themeIndex == 1) {
      this.onQuery('themeDetailsData');
    }
    if (this.data.themeIndex == 2) {
      this.onQuery('secondLevelThemeDetails');
    }
    if (this.data.themeIndex == 3) {
      this.onQuery('thirdLevelThemeDetails');
    }
    wx.stopPullDownRefresh();
  },

})