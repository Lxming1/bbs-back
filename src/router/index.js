const fs = require('fs')

// 配置router不需要一条一条写
const useRoutes = function () {
  fs.readdirSync(__dirname).forEach((file) => {
    if (file === 'index.js') return
    const router = require(`./${file}`)
    this.use(router.routes())
    this.use(router.allowedMethods())
  })
}

module.exports = useRoutes
