const express = require('express');
const app = express();
const PORT = 3000;
const mongoose = require('mongoose');

require('dotenv').config();

// 連接到 MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('MongoDB is connected');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
  });

const answerSchema = new mongoose.Schema({
  answer: Number,
});

const Answer = mongoose.model('Answer', answerSchema);

const gameResultSchema = new mongoose.Schema({
  createAt: Date,
  numberOfGuesses: Number,
  answer: Number,
  isSuccess: Boolean,
});

const GameResult = mongoose.model('GameResult', gameResultSchema);

app.use(express.json());

// GET 隨機數字
app.get('/answer', async (req, res, next) => {
  try {
    const number = Math.floor(Math.random() * 100) + 1;
    const newAnswer = new Answer({ answer: number });
    await newAnswer.save();
    res.send({ answer: number });
  } catch (error) {
    next(error);
  }
});

// GET 測試路由
app.get('/test', (req, res) => {
  res.send({ msg: 'you are amazing!' });
});

// POST 路由，存儲遊戲結果
app.post('/game-result', async (req, res, next) => {
  try {
    const { createAt, numberOfGuesses, answer, isSuccess } = req.body;

    // 建立一個新的資料庫模型
    const gameResult = new GameResult({
      createAt,
      numberOfGuesses,
      answer,
      isSuccess,
    });

    // 將遊戲結果存入資料庫
    await gameResult.save();

    res.status(201).json({ message: 'Game result recorded successfully' });
  } catch (error) {
    next(error);
  }
});

// 404 錯誤處理
app.get('*', (req, res) => {
  res.status(404).json({ error: 'Page did not exist' });
});

// 錯誤處理中間件
app.use((err, req, res, next) => {
  const status = err.status || 500;
  console.error('Error:', err.message);

  res.status(status).json({
    status: status,
    message: err.message,
  });
});

// 啟動伺服器
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
