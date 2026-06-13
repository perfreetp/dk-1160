export default defineAppConfig({
  pages: [
    'pages/columns/index',
    'pages/proposals/index',
    'pages/questions/index',
    'pages/schedule/index',
    'pages/archive/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#2563eb',
    navigationBarTitleText: '选题共创',
    navigationBarTextStyle: 'white'
  },
  tabBar: {
    color: '#6b7280',
    selectedColor: '#2563eb',
    backgroundColor: '#ffffff',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/columns/index',
        text: '栏目管理'
      },
      {
        pagePath: 'pages/proposals/index',
        text: '选题提案'
      },
      {
        pagePath: 'pages/questions/index',
        text: '读者问题'
      },
      {
        pagePath: 'pages/schedule/index',
        text: '排期看板'
      },
      {
        pagePath: 'pages/archive/index',
        text: '效果归档'
      }
    ]
  }
})