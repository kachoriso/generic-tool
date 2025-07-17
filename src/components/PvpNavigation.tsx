import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Add as AddIcon,
  List as ListIcon,
  Home as HomeIcon,
  Assignment as TodoIcon,
} from '@mui/icons-material';

interface PvpNavigationProps {
  currentPath: string;
}

export const PvpNavigation: React.FC<PvpNavigationProps> = ({ currentPath }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const navItems = [
    {
      label: 'ホーム',
      path: '/',
      icon: <HomeIcon />,
    },
    {
      label: 'パーティ一覧',
      path: '/parties',
      icon: <ListIcon />,
    },
    {
      label: '新規作成',
      path: '/parties/new',
      icon: <AddIcon />,
    },
    {
      label: 'TODO',
      path: '/todos',
      icon: <TodoIcon />,
    },
  ];

  const handleNavigation = (path: string) => {
    window.location.href = path;
  };

  return (
    <AppBar position="fixed" elevation={2}>
      <Toolbar>
        {/* ロゴ/タイトル */}
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          <Typography
            variant="h6"
            component="div"
            sx={{
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
            onClick={() => handleNavigation('/parties')}
          >
            🎮 PvP パーティ管理
          </Typography>
        </Box>

        {/* ナビゲーションメニュー */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          {navItems.map((item) => (
            <Button
              key={item.path}
              color="inherit"
              startIcon={!isMobile ? item.icon : undefined}
              onClick={() => handleNavigation(item.path)}
              sx={{
                fontWeight: currentPath === item.path ? 'bold' : 'normal',
                backgroundColor: currentPath === item.path ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
                minWidth: isMobile ? 'auto' : undefined,
                px: isMobile ? 1 : 2,
              }}
            >
              {isMobile ? item.icon : item.label}
            </Button>
          ))}
        </Box>
      </Toolbar>
    </AppBar>
  );
}; 