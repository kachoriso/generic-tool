import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';
import { Assignment } from '@mui/icons-material';
import { TodoInput } from './TodoInput';
import { TodoItem } from './TodoItem';
import type { TodoItem as TodoItemType } from '../types';

export default function TodoList() {
  const [todos, setTodos] = useState<TodoItemType[]>([]);

  // ローカルストレージからTODOを読み込み
  useEffect(() => {
    const savedTodos = localStorage.getItem('todos');
    if (savedTodos) {
      setTodos(JSON.parse(savedTodos, (key, value) => {
        // Date型の復元
        if (key === 'createdAt' || key === 'dueDate') {
          return value ? new Date(value) : value;
        }
        return value;
      }));
    }
  }, []);

  // TODOが変更されたらローカルストレージに保存
  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  const addTodo = (text: string, dueDate?: Date) => {
    const newTodo: TodoItemType = {
      id: Date.now().toString(),
      text,
      completed: false,
      createdAt: new Date(),
      dueDate,
      groupId: 'default', // デフォルトグループ
    };
    setTodos([...todos, newTodo]);
  };

  const toggleTodo = (id: string) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      {/* ページタイトル */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, justifyContent: 'center' }}>
        <Assignment sx={{ fontSize: { xs: 32, sm: 40 }, color: 'primary.main' }} />
        <Typography 
          variant="h5"
          component="h1" 
          sx={{ fontWeight: 600, color: 'primary.main', textAlign: 'center' }}
        >
          TODOリスト
        </Typography>
      </Box>
      
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <TodoInput onAdd={addTodo} />
      </Paper>

      <Box>
        {todos.length === 0 ? (
          <Paper elevation={1} sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              TODOがありません。新しいTODOを追加してみましょう！
            </Typography>
          </Paper>
        ) : (
          todos.map(todo => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggle={toggleTodo}
              onDelete={deleteTodo}
            />
          ))
        )}
      </Box>
    </Container>
  );
} 