// 需求分析：我们要做一个聊天室，但是实时通讯功能是基于WebSocket去实现的
// 这里我们选择使用express和http结合使用开启http服务器，使用socket.io实现实时通讯的功能
// 因为socket.io包含一个加载到浏览器中的客户端：socket.io-client
// 所以这里我们的前端页面通过fs模块读出并渲染

// 1、express初始化app作为http服务器的回调函数
let app = require('express')()
let fs = require('fs')
var userNum = 0 // 定义一个全局的变量，用来记录当前在线连接人数

// 2、通过传入http创建一个服务器
let http = require('http').createServer(app)

// 3、传入http服务器对象初始化一个socket.io的一个实例
let io = require('socket.io')(http)

app.get('/', (req, res) => {
  fs.readFile('./index.html', (err, data) => {
    res.end(data)
  })
})

// 4、监听connection事件来接收socket
io.on('connection', function (socket) {
  userNum++ // 每次进来一个新用户就让userNum+1
  console.log(`${userNum} user connected`)
  io.emit('userNum', userNum) // 把当前的在线人数提交给前端

  // 接收从前端传递过来的聊天信息
  socket.on('chat', function(msg) {
    console.log(msg)
    // 把聊天事件('chat')发送给每一个用户，包括发送者本人，就是通知给聊天室的所有人
    // io.emit('chat', msg) // 只传了信息给前端

    // 把信息和发信息的人都传给前端
    io.emit('chat', {
      name: socket.nickName,
      msg: msg
    })
  })

  // 当用户进入聊天室的信息
  socket.on('join', (name) => {
    socket.nickName = name
    io.emit('join', {
      name: name,
      status: '进入'
    })
  })
  
  // 用户退出时
  socket.on('disconnect', () => {
    console.log('断开连接')
    if (userNum > 0) {
      userNum--
      io.emit('userNum', userNum) // 把当前的在线人数提交给前端
      io.emit('join', {
        name: socket.nickName,
        status: '骂骂咧咧的退出'
      })
    }
  })
})

http.listen(4000, () => {
  console.log('app start port 4000...')
})

/* 
  emit和on方法使用
  socket.emit('action'):表示发送了一个action命令，命令是字符串的
  在另一端接收的时候socket.on('action', function(){...})
*/

/**
 * 1、显示在先用户数量
 * 2、用户自己添加昵称
 * 3、当用户进入聊天室时进行播报
 * 4、当用户退出聊天室时进行播报
 * 5、在聊天室界面展示对应的发消息的人
 */
