const express = require('express')
const app = express()
const fs = require('fs')

const _ = require('lodash')
const dayjs = require('dayjs')

/* Body Parser 모듈 */
const bodyParser = require('body-parser')
const { serialize } = require('v8')
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.get('/api/phr/admin/uesr/list', (req, res) => {
  fs.readFile('./db/user.js', 'utf8', (err, data) => {
    res.send(JSON.parse(data))
  })
});

app.get('/api/menu/list', (req, res) => {
  fs.readFile('./db/menu.js', 'utf-8', (err, data) => {
    res.send(JSON.parse(data))
  })
})

app.post('/api/login', (req, res) => {
  const users = JSON.parse(fs.readFileSync('./db/user.js', 'utf-8'))
  const user = _.find(users, { id: req.body.id })
  if(user && Object.keys(user).length > 0) {
    if(user.password === req.body.password) {
      delete user.password
      const response = {
        code: '0',
        user
      }
      res.send(response)
    } else {
      const response = {
        code: '-998',
        msg: 'INCORRECT PASSWORD'
      }
      res.send(response)
    }
  } else {
    const response = {
      code: '-999',
      msg: 'USER NOT FOUND'
    }
    res.send(response)
  }
})

app.get('/api/notice/list', (req, res) => {
  setTimeout(() => {
    let noticeList = JSON.parse(fs.readFileSync('./db/notice.js', 'utf-8'))
    noticeList = _.filter(noticeList, notice => {
      return !notice.deleteYn || notice.deleteYn === 'N'
    })
    noticeList = _.orderBy(noticeList, ['noticeSeq'], ['desc'])

    if (req.query.searchTitle && req.query.searchTitle.length > 0) {
      if (req.query.searchWriter && req.query.searchWriter.length > 0) {
        if (req.query.searchDate && req.query.searchDate.length > 0) {
          noticeList = _.filter(noticeList, notice => {
            return notice.title.indexOf(req.query.searchTitle) > -1
                && notice.searchWriter.indexOf(req.query.searchWriter) > -1
                && notice.createdDate.substring(0, 8) === req.query.searchDate
          })
        }
        noticeList = _.filter(noticeList, notice => {
          return notice.title.indexOf(req.query.searchTitle) > -1
              && notice.searchWriter.indexOf(req.query.searchWriter) > -1
        })
      }
      noticeList = _.filter(noticeList, notice => {
        return notice.title.indexOf(req.query.searchTitle) > -1
      })
    }
    else if (req.query.searchWriter && req.query.searchWriter.length > 0) {
      if (req.query.searchDate && req.query.searchDate.length > 0) {
        noticeList = _.filter(noticeList, notice => {
          return notice.searchWriter.indexOf(req.query.searchWriter) > -1
              && notice.createdDate.substring(0, 8) === req.query.searchDate
        })
      }
      noticeList = _.filter(noticeList, notice => {
        return notice.searchWriter.indexOf(req.query.searchWriter) > -1
      })
    }
    else if (req.query.searchDate && req.query.searchDate.length > 0) {
      noticeList = _.filter(noticeList, notice => {
        return notice.createdDate.substring(0, 8) === req.query.searchDate
      })
    }

    const beginNum = Number(req.query.page || 1) === 1 ? 0 : (req.query.page - 1) * req.query.size
    const endNum = beginNum + 10
    const filteredList = _.slice(noticeList, beginNum, endNum)

    res.setHeader("X-Current-Page", beginNum === 0 ? 1 : beginNum)
    res.setHeader("X-Total-Count", noticeList.length)
    res.setHeader("X-Data-Per-Page", req.query.size || 10)

    res.send(filteredList)
  }, 500)
})

app.get('/api/notice/:noticeSeq', (req, res) => {
  setTimeout(() => {
    const noticeList = JSON.parse(fs.readFileSync('./db/notice.js', 'utf-8'))
    const foundNotice = _.find(noticeList, { noticeSeq: Number(req.params.noticeSeq) })

    res.send(foundNotice)
  }, 500)
})

app.post('/api/notice/write', (req, res) => {
  setTimeout(() => {
    console.log(req.body)
    const noticeList = JSON.parse(fs.readFileSync('./db/notice.js', 'utf-8'))
    const maxSeq = _.maxBy(noticeList, 'noticeSeq').noticeSeq + 1
    req.body.noticeSeq = maxSeq
    req.body.createdDate = dayjs().format('YYYYMMDDHHmmss')
    req.body.hitCount = 0
    noticeList.push(req.body)
    fs.writeFileSync('./db/notice.js', JSON.stringify(noticeList), { encoding:'utf8', flag:'w' })

    const result = {
      code: '0'
    }
    res.send(result)
  }, 500)
})

app.post('/api/notice/modify/:noticeSeq', (req, res) => {
  setTimeout(() => {
    const noticeList = JSON.parse(fs.readFileSync('./db/notice.js', 'utf-8'))
    const foundNotice = _.find(noticeList, { noticeSeq: Number(req.params.noticeSeq) })

    foundNotice.title = req.body.title
    foundNotice.content = req.body.content
    foundNotice.modifiedDate = dayjs().format('YYYYMMDDHHmmss')

    fs.writeFileSync('./db/notice.js', JSON.stringify(noticeList), { encoding:'utf8', flag:'w' })

    const result = {
      code: '0'
    }
    res.send(result)
  }, 500)
})

app.post('/api/notice/delete/:noticeSeq', (req, res) => {
  setTimeout(() => {
    const noticeList = JSON.parse(fs.readFileSync('./db/notice.js', 'utf-8'))
    const foundNotice = _.find(noticeList, { noticeSeq: Number(req.params.noticeSeq) })

    foundNotice.deleteYn = 'Y'

    fs.writeFileSync('./db/notice.js', JSON.stringify(noticeList), { encoding:'utf8', flag:'w' })

    const result = {
      code: '0'
    }
    res.send(result)
  }, 500)
})


app.get('/api/common/temp', (req, res) => {
  console.log('called')
  setTimeout(() => {
    const result = {
      code: '0'
    }
    res.send(result)
  }, 500)
})

app.listen(8090, () => {
  console.log('Server listening on port 8090')
})
