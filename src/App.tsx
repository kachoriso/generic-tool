import React from 'react';
import { ThemeProvider, createTheme, CssBaseline, Box, Typography } from '@mui/material';

// テーマ設定
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 3
      }}>
        <Typography variant="h2" component="h1" gutterBottom>
          🎉 ビルドテスト成功！
        </Typography>
        <Typography variant="h5" color="text.secondary">
          Renderでの基本ビルドが動作しています
        </Typography>
      </Box>
    </ThemeProvider>
  );
}

export default App;
