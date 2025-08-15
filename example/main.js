console.log('Vite Plugin Meta Inject 示例应用启动')

// 检查构建信息是否已注入
if (window.BUILD_INFO) {
  console.log('构建信息已注入:', window.BUILD_INFO)

  // 显示一些关键信息
  console.log('构建时间:', window.BUILD_INFO.buildTime)
  console.log('版本:', window.BUILD_INFO.version)
  console.log('Git 分支:', window.BUILD_INFO.git?.branch)
  console.log('Node 版本:', window.BUILD_INFO.nodeVersion)
} else {
  console.warn('构建信息未找到，请确保插件正确配置')
}
