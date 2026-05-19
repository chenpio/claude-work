var cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = function () {
  return { ok: true, msg: 'ping ok' }
}
