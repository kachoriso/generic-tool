import React from 'react';
import { Container, Typography, Box, Card, CardContent, CardActions, Button } from '@mui/material';
import { Assignment as TodoIcon, SportsEsports as PvpIcon, Calculate as CalcIcon, Home as HomeIcon } from '@mui/icons-material';

export default function HomePage() {
  const handleNavigation = (path: string) => {
    window.location.href = path;
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      {/* ページタイトル */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, justifyContent: 'center' }}>
        <HomeIcon sx={{ fontSize: { xs: 32, sm: 40 }, color: 'primary.main' }} />
        <Typography 
          variant="h5"
          component="h1" 
          sx={{ fontWeight: 600, color: 'primary.main', textAlign: 'center' }}
        >
          Generic Tools
        </Typography>
      </Box>
      
      <Typography variant="h6" component="p" align="center" color="text.secondary" sx={{ mb: 6 }}>
        使用する機能を選択してください
      </Typography>

      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', md: 'row' }, 
        gap: 3, 
        justifyContent: 'center',
        alignItems: 'stretch',
        flexWrap: 'wrap'
      }}>
        <Box sx={{ flex: { md: 1 }, minWidth: { xs: '100%', sm: '280px' }, maxWidth: { md: '300px' } }}>
          <Card elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1, textAlign: 'center', py: 4 }}>
              <TodoIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
              <Typography variant="h5" component="h2" gutterBottom>
                TODOリスト
              </Typography>
              <Typography variant="body1" color="text.secondary">
                日々のタスクを管理できます。期限設定や完了チェックなどの基本的な機能を備えています。
              </Typography>
            </CardContent>
            <CardActions sx={{ justifyContent: 'center', pb: 3 }}>
              <Button 
                variant="contained" 
                size="large"
                onClick={() => handleNavigation('/todos')}
                sx={{ minWidth: 120 }}
              >
                開始
              </Button>
            </CardActions>
          </Card>
        </Box>

        <Box sx={{ flex: { md: 1 }, minWidth: { xs: '100%', sm: '280px' }, maxWidth: { md: '300px' } }}>
          <Card elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1, textAlign: 'center', py: 4 }}>
              <PvpIcon sx={{ fontSize: 80, color: 'secondary.main', mb: 2 }} />
              <Typography variant="h5" component="h2" gutterBottom>
                PvPパーティ管理
              </Typography>
              <Typography variant="body1" color="text.secondary">
                ポケモンGO PvP用のパーティを管理できます。画像切り抜き機能やデータベース連携を備えています。
              </Typography>
            </CardContent>
            <CardActions sx={{ justifyContent: 'center', pb: 3 }}>
              <Button 
                variant="contained" 
                size="large"
                color="secondary"
                onClick={() => handleNavigation('/parties')}
                sx={{ minWidth: 120 }}
              >
                開始
              </Button>
            </CardActions>
          </Card>
        </Box>

        <Box sx={{ flex: { md: 1 }, minWidth: { xs: '100%', sm: '280px' }, maxWidth: { md: '300px' } }}>
          <Card elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1, textAlign: 'center', py: 4 }}>
              <CalcIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
              <Typography variant="h5" component="h2" gutterBottom>
                価格計算機
              </Typography>
              <Typography variant="body1" color="text.secondary">
                容量・価格から単位あたりの価格を計算できます。お買い物の際の比較に便利です。
              </Typography>
            </CardContent>
            <CardActions sx={{ justifyContent: 'center', pb: 3 }}>
              <Button 
                variant="contained" 
                size="large"
                color="success"
                onClick={() => handleNavigation('/calculator')}
                sx={{ minWidth: 120 }}
              >
                開始
              </Button>
            </CardActions>
          </Card>
        </Box>
      </Box>
    </Container>
  );
} 