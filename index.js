const express = require('express')
const app = express()
const fs = require('fs')

const _ = require('lodash')

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
  console.log(req.body)
  const users = JSON.parse(fs.readFileSync('./db/user.js', 'utf-8'))
  const user = _.find(users, { id: req.body.id })
  console.log('user')
  console.log(user)
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

app.listen(8090, () => {
  console.log('Server listening on port 8090')
})
