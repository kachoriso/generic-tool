import React, { useState, useEffect } from 'react';
import { ThemeProvider, CssBaseline, AppBar, Toolbar, Typography, Container, Tabs, Tab, Box, Paper } from '@mui/material';
import { theme } from './theme';
import { TodoInput } from './components/TodoInput';
import { TodoItem } from './components/TodoItem';
import { GroupSelector } from './components/GroupSelector';
import type { TodoItem as TodoItemType, TodoGroup } from './types';
import { loadAppState, saveAppState, generateId } from './utils/storage';

function App() {
  const [todos, setTodos] = useState<TodoItemType[]>([]);
  const [groups, setGroups] = useState<TodoGroup[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>('general');

  useEffect(() => {
    const appState = loadAppState();
    setTodos(appState.todos);
    setGroups(appState.groups);
    setSelectedGroupId(appState.selectedGroupId || 'general');
  }, []);

  const saveState = (newTodos: TodoItemType[], newGroups: TodoGroup[], newSelectedGroupId: string) => {
    const appState = {
      todos: newTodos,
      groups: newGroups,
      selectedGroupId: newSelectedGroupId
    };
    saveAppState(appState);
  };

  const addTodo = (text: string, dueDate?: Date) => {
    const newTodo: TodoItemType = {
      id: generateId(),
      text,
      completed: false,
      groupId: selectedGroupId,
      dueDate,
      createdAt: new Date()
    };
    const updatedTodos = [...todos, newTodo];
    setTodos(updatedTodos);
    saveState(updatedTodos, groups, selectedGroupId);
  };

  const toggleTodo = (id: string) => {
    const updatedTodos = todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    setTodos(updatedTodos);
    saveState(updatedTodos, groups, selectedGroupId);
  };

  const deleteTodo = (id: string) => {
    const updatedTodos = todos.filter(todo => todo.id !== id);
    setTodos(updatedTodos);
    saveState(updatedTodos, groups, selectedGroupId);
  };

  const addGroup = (name: string, color: string) => {
    const newGroup: TodoGroup = {
      id: generateId(),
      name,
      color,
      createdAt: new Date()
    };
    const updatedGroups = [...groups, newGroup];
    setGroups(updatedGroups);
    saveState(todos, updatedGroups, selectedGroupId);
  };

  const deleteGroup = (groupId: string) => {
    if (groupId === 'general') return;
    
    const updatedGroups = groups.filter(group => group.id !== groupId);
    setGroups(updatedGroups);
    
    const updatedTodos = todos.map(todo =>
      todo.groupId === groupId ? { ...todo, groupId: 'general' } : todo
    );
    setTodos(updatedTodos);
    
    const newSelectedGroupId = selectedGroupId === groupId ? 'general' : selectedGroupId;
    setSelectedGroupId(newSelectedGroupId);
    
    saveState(updatedTodos, updatedGroups, newSelectedGroupId);
  };

  const selectGroup = (groupId: string) => {
    setSelectedGroupId(groupId);
    saveState(todos, groups, groupId);
  };

  const selectedGroup = groups.find(group => group.id === selectedGroupId);
  const filteredTodos = todos.filter(todo => todo.groupId === selectedGroupId);
  const incompleteTodos = filteredTodos.filter(todo => !todo.completed);
  const completedTodos = filteredTodos.filter(todo => todo.completed);

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    selectGroup(newValue);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        {/* Fixed Header */}
        <AppBar 
          position="fixed" 
          elevation={1}
          sx={{ 
            bgcolor: 'rgba(239, 246, 255, 0.9)',
            backdropFilter: 'blur(8px)',
            borderBottom: '1px solid rgba(59, 130, 246, 0.1)'
          }}
        >
          <Toolbar>
            <Typography variant="h1" component="h1" sx={{ color: 'text.primary' }}>
              generic tool
            </Typography>
          </Toolbar>
        </AppBar>

        {/* Group Management Section */}
        <Box sx={{ pt: 8, pb: 2 }}>
          <Container maxWidth="lg">
            <GroupSelector
              groups={groups}
              selectedGroupId={selectedGroupId}
              onSelectGroup={selectGroup}
              onCreateGroup={addGroup}
              onDeleteGroup={deleteGroup}
            />
          </Container>
        </Box>

        <Container maxWidth="lg" sx={{ pb: 4 }}>
          <Paper elevation={2} sx={{ overflow: 'hidden' }}>
            {/* Group Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'grey.50' }}>
              <Tabs
                value={selectedGroupId}
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons="auto"
                sx={{ minHeight: 56 }}
              >
                {groups.map((group) => (
                  <Tab
                    key={group.id}
                    value={group.id}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            bgcolor: group.color,
                          }}
                        />
                        <Typography variant="body2" fontWeight={500}>
                          {group.name}
                        </Typography>
                      </Box>
                    }
                  />
                ))}
              </Tabs>
            </Box>

            {/* Content */}
            <Box sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <TodoInput onAdd={addTodo} placeholder={`${selectedGroup?.name || 'TODO'}を追加...`} />

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {incompleteTodos.length > 0 && (
                    <Box>
                      <Typography variant="h3" gutterBottom>
                        未完了のタスク ({incompleteTodos.length})
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {incompleteTodos.map(todo => (
                          <TodoItem
                            key={todo.id}
                            todo={todo}
                            onToggle={toggleTodo}
                            onDelete={deleteTodo}
                          />
                        ))}
                      </Box>
                    </Box>
                  )}

                  {completedTodos.length > 0 && (
                    <Box>
                      <Typography variant="h3" gutterBottom>
                        完了済み ({completedTodos.length})
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {completedTodos.map(todo => (
                          <TodoItem
                            key={todo.id}
                            todo={todo}
                            onToggle={toggleTodo}
                            onDelete={deleteTodo}
                          />
                        ))}
                      </Box>
                    </Box>
                  )}

                  {filteredTodos.length === 0 && (
                    <Box sx={{ textAlign: 'center', py: 6 }}>
                      <Typography variant="h3" color="text.secondary" gutterBottom>
                        {selectedGroup?.name}グループにタスクはありません
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        上のフォームから新しいタスクを追加してください
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            </Box>
          </Paper>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
