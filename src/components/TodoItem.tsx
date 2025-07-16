import React from 'react';
import {
  Paper,
  Box,
  Checkbox,
  Typography,
  IconButton,
  Chip,
} from '@mui/material';
import { Delete, Schedule, CheckCircle } from '@mui/icons-material';
import type { TodoItem as TodoItemType } from '../types';

interface TodoItemProps {
  todo: TodoItemType;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export const TodoItem: React.FC<TodoItemProps> = ({ todo, onToggle, onDelete }) => {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  const isOverdue = todo.dueDate && new Date() > todo.dueDate && !todo.completed;
  const isDueSoon = todo.dueDate && 
    new Date() <= todo.dueDate && 
    new Date().getTime() + (24 * 60 * 60 * 1000) >= todo.dueDate.getTime() && 
    !todo.completed;

  return (
    <Paper
      elevation={1}
      sx={{
        p: 2,
        transition: 'all 0.2s ease-in-out',
        opacity: todo.completed ? 0.7 : 1,
        bgcolor: todo.completed ? 'grey.50' : 'background.paper',
        '&:hover': {
          elevation: 2,
          transform: 'translateY(-1px)',
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
        <Checkbox
          checked={todo.completed}
          onChange={() => onToggle(todo.id)}
          icon={<CheckCircle sx={{ color: 'grey.300' }} />}
          checkedIcon={<CheckCircle sx={{ color: 'success.main' }} />}
          sx={{ p: 0, mt: 0.5 }}
        />
        
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Typography
            variant="body1"
            sx={{
              textDecoration: todo.completed ? 'line-through' : 'none',
              color: todo.completed ? 'text.secondary' : 'text.primary',
              fontWeight: 500,
              wordBreak: 'break-word',
            }}
          >
            {todo.text}
          </Typography>
          
          {todo.dueDate && (
            <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Schedule sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Chip
                label={formatDate(todo.dueDate)}
                size="small"
                variant="outlined"
                sx={{
                  bgcolor: isOverdue ? 'error.light' : isDueSoon ? 'warning.light' : 'transparent',
                  color: isOverdue ? 'error.contrastText' : isDueSoon ? 'warning.contrastText' : 'text.secondary',
                  borderColor: isOverdue ? 'error.main' : isDueSoon ? 'warning.main' : 'grey.300',
                  fontSize: '0.75rem',
                  height: 24,
                }}
              />
              {isOverdue && (
                <Typography variant="caption" color="error.main" fontWeight={500}>
                  期限切れ
                </Typography>
              )}
              {isDueSoon && (
                <Typography variant="caption" color="warning.main" fontWeight={500}>
                  まもなく期限
                </Typography>
              )}
            </Box>
          )}
        </Box>
        
        <IconButton
          onClick={() => onDelete(todo.id)}
          size="small"
          sx={{
            color: 'text.secondary',
            '&:hover': {
              color: 'error.main',
              bgcolor: 'error.50',
            },
          }}
        >
          <Delete fontSize="small" />
        </IconButton>
      </Box>
    </Paper>
  );
}; 