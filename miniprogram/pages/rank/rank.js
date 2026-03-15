const app = getApp();

Page({
  data: {
    rankList: []
  },
  onLoad() {
    wx.request({
      url: `${app.globalData.apiBase}/rank?limit=20`,
      success: (res) => {
        if (res.data && res.data.data) {
          this.setData({ rankList: res.data.data });
        }
      }
    });
  }
});
