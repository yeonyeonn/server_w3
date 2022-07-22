const express = require('express');
const app = express();

// const app = require('express')();
const server = require('http').createServer(app);
const io = require('socket.io')(server)
const mysql = require('mysql');
const { emit } = require('process');
const port = 443

const game_info = mysql.createConnection({
   host : 'localhost',
   user : 'root',
   //password:
   database : "game_info" 
 });

//const app = express()

console.log("hh")

//for image loading
// const path = require('path');
// const serveIndex = require('serve-index'); 
// app.use('/images', serveIndex(path.join(__dirname, '/images')));

// app.use('/images', express.static('images'));

io.on('connection', socket => {
    console.log("here");
    const req = socket.request; // 웹소켓과는 달리 req객체를 따로 뽑아야함
 
      //* ip 정보 얻기
      const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      console.log('새로운 클라이언트 접속!', ip, socket.id, req.ip);

      // socketid DB에 socket id 저장
      game_info.query(`insert into socketid (socket) values("${socket.id}")`)
      // socket.id 는 소켓 연결된 고유한 클라이언트 식별자라고 보면된다. 채팅방의 입장한 고유한 사람

      // (웹 -> 서버) 로그인
      socket.on("password", (arg1) => {
         console.log(arg1.password); 
         game_info.query(`delete from users`);
         game_info.query(`insert into users (pw, connected) values("${arg1.password}", 0)`)
      });

      // (앱 -> 서버) 로그인
      socket.on("passwordReq", (enteredPw) => {
         game_info.query(`select pw from users`, function (err, result) {
            // if (err) { }
            console.log(enteredPw); 
            console.log(result[0].pw); 
            if (result[0].pw == enteredPw) {
               //change into successful one for connected value in users
               game_info.query(`update users set connected = 1 where pw = ${result[0].pw}`);
               //emit both app and web to notify that app is connected
               io.emit('appConnected', 1);
               //delete the password record
               game_info.query(`delete from users`);
            }
         });
      });
      

       // (웹 -> 서버 -> 앱) 게임 시작 포지션 완료 시 앱에서 게임 진행 액티비티로 전환
      socket.on("startGame", function(msg) {
         console.log(msg)
         io.emit("startGame", "startGame")
      })

      // (웹 -> 서버 -> 앱) 토마토 + 1
      // 웹에서는 토마토 종류만 보내주면 됨 (int 형태)
      socket.on('getTomato', function(msg) {
         console.log("getTomato")
         game_info.query(`insert into tomato (sort) values(${msg})`)
         console.log(msg)
         io.emit('getTomato', msg)
      })

      // (앱 -> 서버 -> 웹)
      socket.on('countTomato', function(msg) {
         console.log("countTomato")
         var temp = Object();
         temp.good = msg.good
         temp.bad = msg.bad
         console.log(temp.good)
         console.log(temp.bad)
         io.emit('countTomato', temp)
      })

      // (웹 -> 서버 -> 앱) 게임 끝
      socket.on('endGameWeb', function(msg) {
         console.log("endGameWeb")
         io.emit('endGame', 'endGame')
         io.emit('timeRequest', 'timeRequest')
      })
// (앱 -> 서버 -> 웹) 게임 끝
      socket.on('endGame', function(msg) {
         console.log("endGame")
         io.emit('endGameApp', 'endGameApp')
         io.emit('timeRequest', 'timeRequest')
      })

      // (웹 -> 서버 -> 앱) 걸린 시간 요청
   socket.on('timeReport', function (hr, min, sec) {
         console.log('timeReport')
         console.log(hr)
         console.log(min)
         console.log(sec)
         var temp = Object();
         temp.hr = hr;
         temp.min = min;
         temp.sec = sec;
         io.emit('timeBroadcast', temp)
      })

      // (웹 -> 서버 -> 앱) restart
      socket.on('restart', function(msg) {
         console.log("restart")
         io.emit('restart', 'restart')
      })
   
      // 연결 종료 시
      socket.on('disconnect', () => {
         console.log('클라이언트 접속 해제', ip, socket.id);
         clearInterval(socket.interval);
      });
 
      // 에러 시
      socket.on('error', (error) => {
         console.error(error);
      });
})

server.listen(443, () => {
    console.log('Node app is running on port', 443);
  });