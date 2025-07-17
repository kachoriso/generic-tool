import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Divider,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  Assignment as TodoIcon,
  SportsEsports as PvpIcon,
  Calculate as CalcIcon,
  List as ListIcon,
  Add as AddIcon,
} from '@mui/icons-material';

interface NavigationProps {
  currentPath?: string;
}

export const Navigation: React.FC<NavigationProps> = ({ currentPath = '/' }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleNavigation = (path: string) => {
    window.location.href = path;
    setDrawerOpen(false);
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const menuItems = [
    { label: 'ホーム', path: '/', icon: <HomeIcon /> },
    { divider: true },
    { label: 'TODOリスト', path: '/todos', icon: <TodoIcon /> },
    { divider: true },
    { label: 'パーティ一覧', path: '/parties', icon: <ListIcon /> },
    { label: '新規パーティ作成', path: '/parties/new', icon: <AddIcon /> },
    { divider: true },
    { label: '価格計算機', path: '/calculator', icon: <CalcIcon /> },
  ];

  return (
    <>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={toggleDrawer}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Generic Tools
          </Typography>
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{
          '& .MuiDrawer-paper': {
            width: 280,
            boxSizing: 'border-box',
          },
        }}
      >
        <Toolbar /> {/* ツールバーの高さ分のスペース */}
        
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {menuItems.map((item, index) => {
              if (item.divider) {
                return <Divider key={`divider-${index}`} />;
              }
              
              const isActive = currentPath === item.path;
              
              return (
                <ListItem
                  key={item.path}
                  onClick={() => handleNavigation(item.path!)}
                  sx={{
                    cursor: 'pointer',
                    backgroundColor: isActive ? 'action.selected' : 'transparent',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: isActive ? 'primary.main' : 'inherit' }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.label} 
                    sx={{ 
                      color: isActive ? 'primary.main' : 'inherit',
                      fontWeight: isActive ? 'bold' : 'normal',
                    }} 
                  />
                </ListItem>
              );
            })}
          </List>
        </Box>
      </Drawer>
    </>
  );
}; 