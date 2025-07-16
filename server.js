const express = require('express');
const path = require('path');
const app = express();

const port = process.env.PORT || 3000;

// 静的ファイルを配信
app.use(express.static(path.join(__dirname, 'dist')));

// すべてのルートでindex.htmlを返す（SPA対応）
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 