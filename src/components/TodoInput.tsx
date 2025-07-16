import React, { useState } from 'react';
import {
  Paper,
  TextField,
  Button,
  Box,
} from '@mui/material';
import { Add, CalendarToday } from '@mui/icons-material';

interface TodoInputProps {
  onAdd: (text: string, dueDate?: Date) => void;
  placeholder?: string;
}

export const TodoInput: React.FC<TodoInputProps> = ({ onAdd, placeholder = 'TODOを入力...' }) => {
  const [text, setText] = useState('');
  const [dueDate, setDueDate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      const dueDateObj = dueDate ? new Date(dueDate) : undefined;
      onAdd(text.trim(), dueDateObj);
      setText('');
      setDueDate('');
    }
  };

  const formatDateForInput = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const today = formatDateForInput(new Date());

  return (
    <Paper elevation={1} sx={{ p: 3 }}>
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <TextField
            fullWidth
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={placeholder}
            variant="outlined"
            size="medium"
            InputProps={{
              sx: { 
                height: 48,
                fontSize: '1rem',
                fontWeight: 500,
              }
            }}
          />
          <Button
            type="submit"
            variant="contained"
            disabled={!text.trim()}
            sx={{
              minWidth: 120,
              height: 48,
              fontWeight: 600,
              ...(text.trim() ? {
                background: 'linear-gradient(45deg, #3b82f6 30%, #1d4ed8 90%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #1d4ed8 30%, #1e40af 90%)',
                },
              } : {
                bgcolor: 'grey.300',
                color: 'grey.600',
                '&:hover': {
                  bgcolor: 'grey.400',
                },
              }),
            }}
            startIcon={<Add />}
          >
            追加
          </Button>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <CalendarToday sx={{ color: 'text.secondary', fontSize: 20 }} />
          <TextField
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            inputProps={{ min: today }}
            size="small"
            sx={{ 
              width: 200,
            }}
          />
        </Box>
      </Box>
    </Paper>
  );
}; 