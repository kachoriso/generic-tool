import React, { useState, useEffect } from 'react';
import { 
  ThemeProvider, 
  CssBaseline, 
  AppBar, 
  Toolbar, 
  Typography, 
  Container, 
  Tabs, 
  Tab, 
  Box, 
  Paper,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Popover
} from '@mui/material';
import { 
  Menu as MenuIcon,
  CheckBox as TodoIcon,
  Calculate as CalculatorIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { theme } from './theme';
import { TodoInput } from './components/TodoInput';
import { TodoItem } from './components/TodoItem';
import { GroupSelector } from './components/GroupSelector';
import { PriceCalculator } from './components/PriceCalculator';
import type { TodoItem as TodoItemType, TodoGroup } from './types';
import { loadAppState, saveAppState, generateId } from './utils/storage';

type Page = 'todo' | 'calculator';

function App() {
  const [todos, setTodos] = useState<TodoItemType[]>([]);
  const [groups, setGroups] = useState<TodoGroup[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>('general');
  const [currentPage, setCurrentPage] = useState<Page>('todo');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [settingsAnchorEl, setSettingsAnchorEl] = useState<HTMLButtonElement | null>(null);

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

  const deleteGroup = (id: string) => {
    if (id === 'general') return;
    
    const updatedGroups = groups.filter(group => group.id !== id);
    const updatedTodos = todos.map(todo =>
      todo.groupId === id ? { ...todo, groupId: 'general' } : todo
    );
    
    const newSelectedGroupId = selectedGroupId === id ? 'general' : selectedGroupId;
    
    setGroups(updatedGroups);
    setTodos(updatedTodos);
    setSelectedGroupId(newSelectedGroupId);
    saveState(updatedTodos, updatedGroups, newSelectedGroupId);
  };

  const currentGroupTodos = todos.filter(todo => todo.groupId === selectedGroupId);
  const allGroups = [
    { id: 'general', name: 'General', color: '#2196f3', createdAt: new Date() },
    ...groups
  ];

  const handlePageChange = (page: Page) => {
    setCurrentPage(page);
    setDrawerOpen(false);
  };

  const handleSettingsClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setSettingsAnchorEl(event.currentTarget);
  };

  const handleSettingsClose = () => {
    setSettingsAnchorEl(null);
  };

  const settingsOpen = Boolean(settingsAnchorEl);

  const menuItems = [
    { id: 'todo' as Page, label: 'TODOリスト', icon: <TodoIcon /> },
    { id: 'calculator' as Page, label: '容量あたりの値段計算機', icon: <CalculatorIcon /> }
  ];

  const drawer = (
    <Box sx={{ width: 280 }} role="presentation">
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>
          generic tool
        </Typography>
      </Box>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.id} disablePadding>
            <ListItemButton 
              selected={currentPage === item.id}
              onClick={() => handlePageChange(item.id)}
            >
              <ListItemIcon>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      
      <AppBar position="static" elevation={0} sx={{ backgroundColor: 'white', borderBottom: '1px solid #e0e0e0' }}>
        <Toolbar>
          <IconButton
            edge="start"
            color="primary"
            aria-label="menu"
            onClick={() => setDrawerOpen(true)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: 'primary.main', fontWeight: 600 }}>
            generic tool
          </Typography>
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        {drawer}
      </Drawer>

      {currentPage === 'todo' && (
        <Container maxWidth="md" sx={{ pb: 4, pt: 3 }}>
          <Paper elevation={0} sx={{ p: 4, backgroundColor: '#f8f9fa', border: '1px solid #e0e0e0' }}>
            {/* 歯車アイコンを右上に配置 */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
              <IconButton
                onClick={handleSettingsClick}
                sx={{ 
                  color: '#666',
                  '&:hover': {
                    backgroundColor: '#f0f0f0'
                  }
                }}
              >
                <SettingsIcon />
              </IconButton>
            </Box>

            {/* タブを中央配置 */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
              <Tabs
                value={selectedGroupId}
                onChange={(_, newValue) => setSelectedGroupId(newValue)}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  '& .MuiTab-root': {
                    color: '#666',
                    '&.Mui-selected': {
                      color: 'primary.main',
                    },
                  },
                }}
              >
                {allGroups.map((group) => (
                  <Tab
                    key={group.id}
                    label={group.name}
                    value={group.id}
                    sx={{
                      borderBottom: `3px solid ${group.color}`,
                      '&.Mui-selected': {
                        borderBottom: `3px solid ${group.color}`,
                      },
                    }}
                  />
                ))}
              </Tabs>
            </Box>

            <Popover
              open={settingsOpen}
              anchorEl={settingsAnchorEl}
              onClose={handleSettingsClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
            >
              <Box sx={{ 
                p: { xs: 1, sm: 2 }, 
                minWidth: { xs: 320, sm: 400 },
                maxWidth: { xs: '90vw', sm: 500 },
                maxHeight: { xs: '80vh', sm: 600 },
                overflow: 'auto'
              }}>
                <GroupSelector
                  groups={allGroups}
                  selectedGroupId={selectedGroupId}
                  onSelectGroup={setSelectedGroupId}
                  onCreateGroup={addGroup}
                  onDeleteGroup={deleteGroup}
                />
              </Box>
            </Popover>

            <TodoInput onAdd={addTodo} />

            <Box sx={{ mt: 3 }}>
              {currentGroupTodos.map(todo => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onToggle={toggleTodo}
                  onDelete={deleteTodo}
                />
              ))}
              {currentGroupTodos.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    まだTODOがありません。上記から新しいTODOを追加してください。
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Container>
      )}

      {currentPage === 'calculator' && (
        <PriceCalculator />
      )}
    </ThemeProvider>
  );
}

export default App;
