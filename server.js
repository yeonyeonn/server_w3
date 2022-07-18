const app = require('express')();
const server = require('http').createServer(app);

//const express = require('express');

const io = require('socket.io')(server)
const mysql = require('mysql');
//const dbconfig = require('./main.js');
//const connection = mysql.createConnection(dbconfig);
const port = 443

const game_info = mysql.createConnection({
   host : 'localhost',
   user : 'root',
   // password: '',
   database : "game_info" 
 });

//const app = express()

console.log("hh")

io.on('connection', socket => {
    console.log("here");
    const req = socket.request; // 웹소켓과는 달리 req객체를 따로 뽑아야함
 
      //* ip 정보 얻기
      const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      console.log('새로운 클라이언트 접속!', ip, socket.id, req.ip);

      // socketid DB에 socket id 저장
      game_info.query(`insert into socketid (socket) values("${socket.id}")`)
      // socket.id 는 소켓 연결된 고유한 클라이언트 식별자라고 보면된다. 채팅방의 입장한 고유한 사람


      // socket.on('connect user', function(user){

      //    console.log("state : ",socket.adapter.rooms);
      //    socket.join(user)
      //    io.emit('connect user', "hihi");
      //  });

      //socket.on('ready')
      

      socket.on('message', function(msg){
         console.log("message")
         console.log(msg)
         var temp = "kiki"
         io.emit('message', temp);
       });

       // (웹 -> 서버 -> 앱) 게임 시작 포지션 완료 시 앱에서 게임 진행 액티비티로 전환
      socket.on('startgame', function(msg) {
         console.log("startgame")
         io.emit('startgame', "startgame")
      })

      // (웹 -> 서버 -> 앱) 토마토 + 1
      // 웹에서는 토마토 종류만 보내주면 됨
      socket.on('gettomato', function(msg) {
         console.log("gettomato")
         game_info.query(`insert into tomato (sort) values("${msg}")`)
         //io.emit()
      })
 
      //* 연결 종료 시
      socket.on('disconnect', () => {
         console.log('클라이언트 접속 해제', ip, socket.id);
         clearInterval(socket.interval);
      });
 
      //* 에러 시
      socket.on('error', (error) => {
         console.error(error);
      });
})

server.listen(443, () => {
    console.log('Node app is running on port', 443);
  });