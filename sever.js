// server.js
require('dotenv').config();
const express = require('express');
const multer = require('multer');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static(__dirname));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

app.post('/submit', upload.fields([
  { name: 'license', maxCount: 1 },
  { name: 'bankbook', maxCount: 1 }
]), (req, res) => {
  const data = req.body;
  const files = req.files;

  const mailOptions = {
    from: `디스테이션 라이더 가입 <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_TO,
    subject: '[디스테이션 라이더 가입 신청서]',
    html: `
      <h3>디스테이션 라이더 가입 신청서</h3>
      <ul>
        <li><strong>영업자:</strong> ${data.bizname}</li>
        <li><strong>성함:</strong> ${data.name}</li>
        <li><strong>휴대폰번호:</strong> ${data.phone}</li>
        <li><strong>배민비즈회원아이디:</strong> ${data.baemin}</li>
        <li><strong>쿠팡회원아이디:</strong> ${data.coupang}</li>
        <li><strong>협력사 운영여부:</strong> ${data.coop}</li>
        <li><strong>운영희망지역:</strong> ${data.region}</li>
        <li><strong>정산 방식:</strong> ${data.settlement}</li>
      </ul>
    `,
    attachments: [
      ...(files.license ? [{
        filename: files.license[0].originalname,
        path: files.license[0].path
      }] : []),
      ...(files.bankbook ? [{
        filename: files.bankbook[0].originalname,
        path: files.bankbook[0].path
      }] : [])
    ]
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.error(error);
      res.status(500).send('메일 전송 실패');
    } else {
      res.send('신청이 성공적으로 접수되었습니다.');
    }
  });
});

app.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
});
