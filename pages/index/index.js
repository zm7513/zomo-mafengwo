const app = getApp()

var config = require("../../config.js");

const util = require('../../utils/util.js'); //封装wx.request  以下util.request可以用wx.request代替
Page({
  data: {
    dataList: [], //储存图片
    index: null, //当前点击位置
    text: null, //储存当前输入内容
    initialization: null,
    show: true,
    show2:true,
    controller: [
      // { pic: "/Share/image/images/bgqq_01.png", text: "可以", title:"",display: "none", color:""} //举例
    ],
    hideModal: true, //模态框的状态  true-隐藏  false-显示
    animationData: {}, //
    picarr: []
  },
  onLoad: function () {
    var that = this;
    console.log(that.data.controller);
  },

  //提交表单，事先处理图片上传，上传完图片后再调用that.submit()上传数据 参数为广本外的 title文章主标题跟describe文章描述
  formsubmit: function (e) {
    var that = this;
    var controller = that.data.controller;
    var title = e.detail.value.title;
    var describe = e.detail.value.describe;
    wx.showLoading({
      title: "发布中...",
      mask: true
    })
    for (var i = 0; i < controller.length; i++) {
      wx.uploadFile({
        url: config.config.configUrl + '/admin/user/uploadImgs',
        filePath: controller[i].pic,
        method: "post",
        name: 'file',
        header: {
          'content-type': 'multipart/form-data',
          "Authorization": app.globalData.token,
        },
        success(res) {
          var newarray = {
            pic: res.data
          }
          that.setData({
            picarr: that.data.picarr.concat(newarray)
          })
          that.submit(title, describe);
        }
      })
    }
  },

  //上传数据
  submit: function (title, describe) {
    var that = this;
    var controller = that.data.controller;
    var str = "";
    //将controller内容转字符串赋值到空字符串str中，因为图片是倒序的所以用var j来处理
    for (var i = 0; i < controller.length; i++) {
      var j = controller.length - i - 1;
      str += that.data.picarr[j].pic + ',' + controller[i].title + ',' + controller[i].color + ',' + controller[i].text + '==';
    }
    //此时的str等于 &quot;83c5e201903230829295134.jpg&quot;,,undefined,==&quot;ceb17201903230829292802.jpg&quot;,,undefined,==&quot;a12be201903230829296884.png&quot;undefined,==
    //以上用==号来作为一个数组的结束，以方便后端处理
    // util.request(
    //   "/app/Dynamics/ins", {
    //     userid: app.globalData.userid,
    //     title: title,
    //     describe: describe,
    //     content: str

    //   },
    //   function (res) {
    //     wx.hideLoading();
    //     setTimeout(function () {
    //       wx.reLaunch({
    //         url: "/pages/dynamic/index?id=" + app.globalData.userid
    //       })
    //     }, 2000)
    //   }
    // )
    console.log(str);
  },



  /* 添加图片*/
  binpic: function () {
    var that = this;
    //这里考虑到性能，对于图片张数做了限制
    if (that.data.dataList.length >= 9) { //超过四张
      wx.showModal({
        title: '温馨提示',
        content: '最多只能添加一张图片哦',
        confirmText: "我知道了",
        confirmColor: "#000000",
        showCancel: false,
        success: function (res) {
          if (res.confirm) { } else if (res.cancel) { }
        }
      })
    } else { //添加图片
      wx.showActionSheet({
        itemList: ['从相册选择', '拍照'],
        itemColor: '#000000',
        success: function (res) {

          var choseType = res.tapIndex == 0 ? "album" : res.tapIndex == 1 ? "camera" : "";
          if (choseType != "") {
            wx.chooseImage({
              sizeType: ['original'], //原图
              sourceType: [choseType],
              count: 1, //每次添加一张
              success: function (res) {
                wx.showLoading({
                  title: "上传中...",
                  mask: true
                })
                console.log(res);
                var info = {
                  pic: res.tempFilePaths[0], //存储本地地址
                  temp: true, //标记是否是临时图片
                  value: '', //存储图片下方相邻的输入框的内容
                 
                }
                that.data.dataList.splice(that.data.imgIndex, 0, info);
                var newarray = {
                  pic: res.tempFilePaths[0],
                  text: "",
                  display: "none",
                  title: "",
                  text2:'',
            show:false,
                }
                that.setData({
                  dataList: that.data.dataList,
                  controller: that.data.controller.concat(newarray),
                })
                wx.hideLoading();
              }
            })
          }
        },
        fail: function (res) {
          console.log(res.errMsg)
        }
      })
    }

  },

  //描述离开赋值
  initialization: function (e) {
    var that = this;
    that.setData({
      initialization: e.detail.value
    })
  },

  //点击插入标题显示标题
  bintitle: function (e) {
    var that = this;
    var index = that.data.index;
    console.log(that.data.controller);
    that.setData({
      show2:true,
    })
    that.showModal();
    that.setData({
      ["controller[" + index + "].display"]: "block"
    })

  },

  //标题输入离开后赋值到controller
  bindtitle: function (e) {
    var that = this;
    var index = that.data.index;
    console.log(e.detail.value);
    that.setData({
      ['controller[' + index + '].title']: e.detail.value
    })
  },

  //点击textarea获取当前index
  bintext: function (e) {
    var that = this;
    console.log(e);
    that.setData({
      index: e.target.dataset.index
    })
  },

  //文本内容离开时触发
  bindblur: function (e) {
    var that = this;
    var index = that.data.index;
    
    console.log(e.detail.value);
    that.setData({
      ["controller[" + index + "].text"]: e.detail.value,
      ["controller[" + index + "].show"]: true,
      text: e.detail.value
    })
  },
  bindblur2: function (e) {
    var that = this;
    var index = that.data.index;
    console.log(e.detail.value);
    console.log(that.data.controller)

    that.setData({
      ["controller[" + index + "].text2"]: e.detail.value,
      ["controller[" + index + "].show"]: true,
      text2: e.detail.value
    })
    // console.log(that.data.controller)
  },
  //删除当前图片
  del: function (e) {

    var that = this;
    var index = e.currentTarget.dataset.index
    console.log(index);
    console.log(e);
    wx.showModal({
      title: '提示',
      content: '是否删除该记录',
      success: function (res) {
        if (res.confirm) {
          var text = that.data.controller[index].text;
          var controller = that.data.controller;
          controller.splice(index);
          //删除图片把当前的文本内容添加到上面文本内容中，如果index=0代表上面没有文本内容，则加到描述中
          if (index == 0) {
            that.setData({
              initialization: that.data.initialization + '\n' + that.data.text
            })
          } else {
            index = index - 1;
            that.setData({
              ["controller[" + index + "].text"]: that.data.controller[index].text + '\n' + that.data.text
            })
          }
          //End
          that.setData({
            controller: controller
          })
          console.log("删除成功");
          console.log(that.data.controller);
        }
      }
    })
    // console.log(that.data.controller);


  },
  // 显示遮罩层
  showModal: function () {
    var that = this;
    that.setData({
      hideModal: false,
      show: false
    })
    var animation = wx.createAnimation({
      duration: 600, //动画的持续时间 默认400ms   数值越大，动画越慢   数值越小，动画越快
      timingFunction: 'ease', //动画的效果 默认值是linear
    })
    this.animation = animation
    setTimeout(function () {
      that.fadeIn(); //调用显示动画
    }, 200)
  },

  // 隐藏遮罩层
  hideModal: function () {
    var that = this;
    var animation = wx.createAnimation({
      duration: 800, //动画的持续时间 默认400ms   数值越大，动画越慢   数值越小，动画越快
      timingFunction: 'ease', //动画的效果 默认值是linear
    })
    this.animation = animation
    that.fadeDown(); //调用隐藏动画   
    setTimeout(function () {
      that.setData({
        hideModal: true,
        show: true
      })
    }, 720) //先执行下滑动画，再隐藏模块

  },

  //动画集
  fadeIn: function () {
    this.animation.translateY(0).step()
    this.setData({
      animationData: this.animation.export() //动画实例的export方法导出动画数据传递给组件的animation属性
    })
  },
  fadeDown: function () {
    this.animation.translateY(300).step()
    this.setData({
      animationData: this.animation.export(),
    })
  },

  //颜色选择
  bincolor: function (e) {
    var that = this;
    var color = e.currentTarget.dataset.color
    var index = that.data.index
    console.log(that.data.index);
    console.log(color);
    that.setData({
      ["controller[" + index + "].color"]: color,
      hideModal: true,
      show: true
    })
  }
});