var request = require('request')
  , cheerio = require('cheerio')
  , iconv = require('iconv-lite')
  , fs = require('fs')

var p = 1
var urls = []

requestPage(p)

function requestPage (index) {
  console.log('page: ' + index)
  request('http://sou.zhaopin.com/jobs/searchresult.ashx?jl=%E5%B9%BF%E5%B7%9E&kw=java&p=' + index, function (err, res, body) {
    if (!err && res.statusCode == 200) {
      var $ = cheerio.load(body)
      var list = $('.gsmc')
      for (var i in list) {
        if (list[i].name == 'td' ) {
          urls.push($(list[i]).find('a').attr('href'))
        }
      }
      requestDetail(0)
    }
  })
}

function requestDetail (index) {
  request(urls[index], function (err, res, body) {
    var result = (body && body.match) ? body.match(/\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/g) : null
    if (!err && res.statusCode == 200 && result) {
      fs.readFile('result.txt', 'utf-8', function (err, data) {
        var str = ''
        for (var i in result) {
          if (str.indexOf(result[i]) < 0 && data.indexOf(result[i]) < 0) {
            var name = body.match(/([\u4e00-\u9fa5]+)集团/g) || body.match(/([\u4e00-\u9fa5]+)公司/g)
            var phone = body.match(/电话：*\:*\s*\d{0,2}–*\-*\d{0,3}–*\-*\d{7,11}/g)
            str += '名称：' + (name ? name[0] : '无') + '\r\n'
            str += '邮箱：' + result[i] + '\r\n'
            str += (phone ? phone[0] : '电话：无') + '\r\n'
            str += '\r\n'
          }
        }
        fs.appendFile('result.txt', str, function (err) {
          requestNext(index)
        })
      })
    } else {
      requestNext(index)
    }
  })
}

function requestNext (index) {
  if (urls[++index]) {
    requestDetail(index)
  } else {
    requestPage(++p)
  }
}