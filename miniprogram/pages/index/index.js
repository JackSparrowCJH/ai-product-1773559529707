const app = getApp();

Page({
  data: {
    merit: 0,
    combo: 0,
    comboLevel: '',
    skinImage: '/images/fish_default.png',
    showFloat: false,
    floatAnim: false,
    floatX: 180,
    tapAnim: false
  },

  comboTimer: null,
  pendingDelta: 0,
  syncTimer: null,

  onLoad() {
    const merit = wx.getStorageSync('merit') || 0;
    this.setData({ merit });
  },

  onTap() {
    // 音效
    this.playSound();

    // 功德 +1
    const merit = this.data.merit + 1;
    const combo = this.data.combo + 1;

    // 连击等级
    let comboLevel = '';
    if (combo >= 100) comboLevel = 'combo100';
    else if (combo >= 50) comboLevel = 'combo50';
    else if (combo >= 10) comboLevel = 'combo10';

    // 浮字位置随机偏移
    const floatX = 140 + Math.random() * 120;

    this.setData({
      merit, combo, comboLevel,
      tapAnim: true,
      showFloat: true,
      floatAnim: true,
      floatX
    });

    // 重置动画
    setTimeout(() => this.setData({ tapAnim: false }), 80);
    setTimeout(() => this.setData({ showFloat: false, floatAnim: false }), 800);

    // 连击超时重置（1.5秒无操作）
    clearTimeout(this.comboTimer);
    this.comboTimer = setTimeout(() => {
      this.setData({ combo: 0, comboLevel: '' });
    }, 1500);

    // 本地持久化
    wx.setStorageSync('merit', merit);

    // 批量同步到云端（每30次或5秒）
    this.pendingDelta++;
    if (this.pendingDelta >= 30) {
      this.syncToCloud();
    } else {
      clearTimeout(this.syncTimer);
      this.syncTimer = setTimeout(() => this.syncToCloud(), 5000);
    }
  },

  syncToCloud() {
    if (this.pendingDelta <= 0) return;
    const delta = this.pendingDelta;
    this.pendingDelta = 0;

    wx.request({
      url: `${app.globalData.apiBase}/merit/sync`,
      method: 'POST',
      data: { openid: app.globalData.openid, delta }
    });
  },

  playSound() {
    if (!this._audio) {
      this._audio = wx.createInnerAudioContext();
      this._audio.src = '/audio/knock_default.mp3';
    }
    this._audio.stop();
    this._audio.play();
  },

  goRank() {
    wx.navigateTo({ url: '/pages/rank/rank' });
  },

  goSkin() {
    // 简单皮肤切换示例
    const skins = [
      { id: 'default', img: '/images/fish_default.png' },
      { id: 'cyberpunk', img: '/images/fish_cyberpunk.png' },
      { id: 'jade', img: '/images/fish_jade.png' },
      { id: 'gold', img: '/images/fish_gold.png' }
    ];
    wx.showActionSheet({
      itemList: skins.map(s => s.id),
      success: (res) => {
        this.setData({ skinImage: skins[res.tapIndex].img });
      }
    });
  },

  onShareAppMessage() {
    return {
      title: `我已积累${this.data.merit}功德，来敲木鱼！`,
      path: '/pages/index/index'
    };
  },

  onHide() { this.syncToCloud(); },
  onUnload() { this.syncToCloud(); }
});
