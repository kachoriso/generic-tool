import React, { useState } from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { Add, Remove, Refresh, Add as CounterIcon } from '@mui/icons-material';

const Counter: React.FC = () => {
  const [count, setCount] = useState(0);

  const increment = () => {
    setCount(prev => prev + 1);
  };

  const decrement = () => {
    if (count > 0) {
      setCount(prev => prev - 1);
    }
  };

  const reset = () => {
    setCount(0);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      {/* 統一されたタイトルフォーマット */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, justifyContent: 'center' }}>
        <CounterIcon sx={{ fontSize: { xs: 32, sm: 40 }, color: 'primary.main' }} />
        <Typography variant="h5" component="h1" sx={{ fontWeight: 600, color: 'primary.main' }}>
          カウンター
        </Typography>
      </Box>

      {/* メインカウンター表示エリア */}
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          textAlign: 'center',
          borderRadius: 2,
          background: 'linear-gradient(145deg, #ffffff 0%, #f5f5f5 100%)',
          border: '1px solid #e0e0e0'
        }}
      >
        {/* 大きなカウント表示 */}
        <Typography 
          variant="h1" 
          component="div" 
          sx={{ 
            fontSize: { xs: '4rem', sm: '6rem' },
            fontWeight: 'bold',
            color: 'primary.main',
            mb: 3,
            textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
          }}
        >
          {count}
        </Typography>

        {/* 大きな追加ボタン */}
        <Button
          variant="contained"
          size="large"
          onClick={increment}
          startIcon={<Add />}
          sx={{
            fontSize: '1.5rem',
            py: 2,
            px: 4,
            mb: 3,
            minWidth: 200,
            borderRadius: 3,
            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
            boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
            '&:hover': {
              background: 'linear-gradient(45deg, #1976D2 30%, #1E88E5 90%)',
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 10px 2px rgba(33, 203, 243, .3)',
            }
          }}
        >
          カウントアップ
        </Button>

        {/* 小さなボタン群 */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            size="medium"
            onClick={decrement}
            disabled={count === 0}
            sx={{
              minWidth: 60,
              borderRadius: 2,
              fontSize: '1.2rem',
              fontWeight: 'bold',
              '&:hover': {
                transform: 'translateY(-1px)',
              }
            }}
          >
            -
          </Button>
          <Button
            variant="outlined"
            size="medium"
            onClick={reset}
            startIcon={<Refresh />}
            color="secondary"
            sx={{
              minWidth: 120,
              borderRadius: 2,
              '&:hover': {
                transform: 'translateY(-1px)',
              }
            }}
          >
            リセット
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default Counter; 