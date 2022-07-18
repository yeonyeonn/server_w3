const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const mysql = require('mysql');

const app = express();
app.use(bodyParser.json());
app.use(express.json({
    limit : "50mb"
}));
app.use(express.urlencoded({
    limit:"50mb",
    extended: false
}));
//app.use(cors())

// mysql
const login = mysql.createConnection({
    host : 'localhost',
    user : 'root',
    // password: '',
    database : "login_info" 
});

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())


// 앱에 보내줄 옳은 4자리 코드 (앱 안에서 사용자 입력과 동일한지 체크)
app.get('/login', async (req, res) => { // 비동기 함수

    // select * from []: 모든 정보 가져오기
    // rows: 데이터베이스 행
    login.query(`SELECT * from users`, (error, rows, fields) => {
        var success = 0; // 로그인 성공여부 확인 -> 성공하면 1
        if (error) throw error;
        res.send(`${rows[rows.length - 1].pw}`); // 서버로 전송해 줌
        console.log("success")
      });
});

// 웹에서 4자리 수 보냄
app.post('/sign_up', (req, res) => {
    const pw = req.body.password;
    console.log("inserting pw value of", pw);
    login.query(`insert into users values("${pw}")`);
    console.log("success");
});


app.listen(80, () => {
    console.log("!23123")
})