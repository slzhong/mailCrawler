var request = require('request')

request({
  url : 'http://120.25.206.210:3000/api/user/verify',
  method : 'POST',
  body : JSON.stringify({
    'foo' : 'bar'
  })
}, function (err, res, body) {
  console.log(res)
})