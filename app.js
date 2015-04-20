var request = require('request')
  , cheerio = require('cheerio')
  , iconv = require('iconv-lite')
  , fs = require('fs')

var p = 1
var urls = []

requestPage(p)

function requestPage (index) {
  console.log('page: ' + index)
  request('http://sou.zhaopin.com/jobs/searchresult.ashx?jl=%E5%8C%97%E4%BA%AC&kw=java&p=' + index, function (err, res, body) {
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
            str += result[i] + '\r\n'
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