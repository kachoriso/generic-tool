import React, { useState } from 'react';
import {
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  TextField,
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  ExpandMore,
  Add,
  Delete,
  Circle,
  Settings,
} from '@mui/icons-material';
import type { TodoGroup } from '../types';

interface GroupSelectorProps {
  groups: TodoGroup[];
  selectedGroupId: string;
  onSelectGroup: (groupId: string) => void;
  onCreateGroup: (name: string, color: string) => void;
  onDeleteGroup: (groupId: string) => void;
}

const groupColors = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', 
  '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6b7280'
];

const generateGroupName = (existingGroups: TodoGroup[]): string => {
  const animalNames = [
    'パンダ', 'ライオン', 'トラ', 'ゾウ', 'キリン',
    'ペンギン', 'コアラ', 'カンガルー', 'ウサギ', 'ネコ',
    'イヌ', 'ハムスター', 'フクロウ', 'イルカ', 'クジラ',
    'シマウマ', 'サル', 'クマ', 'オオカミ', 'キツネ',
    'リス', 'ハリネズミ', 'カメ', 'フラミンゴ', 'ペリカン'
  ];
  
  const flowerNames = [
    'サクラ', 'バラ', 'ヒマワリ', 'コスモス', 'チューリップ',
    'アジサイ', 'スイセン', 'カーネーション', 'ガーベラ', 'ユリ'
  ];
  
  const colorNames = [
    '赤', '青', '緑', '黄', '紫', '橙', '桃', '白', '黒', '灰'
  ];
  
  const existingNames = new Set(existingGroups.map(g => g.name.toLowerCase()));
  
  // Try combinations
  for (let i = 0; i < 100; i++) {
    const animal = animalNames[Math.floor(Math.random() * animalNames.length)];
    const flower = flowerNames[Math.floor(Math.random() * flowerNames.length)];
    const color = colorNames[Math.floor(Math.random() * colorNames.length)];
    
    const candidates = [
      `${color}${animal}`,
      `${animal}${flower}`,
      `${flower}グループ`,
      `${color}チーム`,
      animal,
      flower
    ];
    
    for (const candidate of candidates) {
      if (!existingNames.has(candidate.toLowerCase())) {
        return candidate;
      }
    }
  }
  
  // Fallback to numbered groups
  let counter = 1;
  while (existingNames.has(`グループ${counter}`)) {
    counter++;
  }
  return `グループ${counter}`;
};

export const GroupSelector: React.FC<GroupSelectorProps> = ({ 
  groups, 
  selectedGroupId, 
  onSelectGroup, 
  onCreateGroup, 
  onDeleteGroup 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [expanded, setExpanded] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedColor, setSelectedColor] = useState(groupColors[0]);
  const [suggestedName, setSuggestedName] = useState('');
  const [showWarning, setShowWarning] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const groupName = newGroupName.trim() || suggestedName;
    
    if (groupName.length > 10) {
      setShowWarning(true);
      return;
    }
    
    if (!groupName) return;
    
    onCreateGroup(groupName, selectedColor);
    setNewGroupName('');
    setSelectedColor(groupColors[0]);
    setShowCreateForm(false);
    setSuggestedName('');
    setShowWarning(false);
  };

  const handleExpandChange = (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded);
  };

  const handleCreateFormToggle = () => {
    const newShowCreateForm = !showCreateForm;
    setShowCreateForm(newShowCreateForm);
    if (newShowCreateForm) {
      setSuggestedName(generateGroupName(groups));
    } else {
      setNewGroupName('');
      setSelectedColor(groupColors[0]);
      setSuggestedName('');
      setShowWarning(false);
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // 10文字まで制限
    if (value.length <= 10) {
      setNewGroupName(value);
      setShowWarning(false);
    } else {
      // 11文字目を入力しようとした場合の警告
      setShowWarning(true);
    }
  };

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        mb: 2, 
        bgcolor: 'grey.50',
        border: '1px solid',
        borderColor: 'grey.200',
        width: '100%',
        maxWidth: { xs: '100%', sm: 'none' }
      }}
    >
      <Accordion
        expanded={expanded}
        onChange={handleExpandChange}
        elevation={0}
        sx={{
          '&:before': {
            display: 'none',
          },
          '& .MuiAccordionSummary-root': {
            minHeight: 48,
          },
          bgcolor: 'transparent',
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMore sx={{ color: 'grey.600' }} />}
          sx={{ 
            px: { xs: 1, sm: 2 },
            '& .MuiAccordionSummary-content': {
              margin: '8px 0',
            }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Settings sx={{ color: 'grey.600', fontSize: { xs: 18, sm: 20 } }} />
            <Typography 
              variant={isMobile ? "body2" : "body1"} 
              sx={{ fontWeight: 500, color: 'grey.700' }}
            >
              グループ設定
            </Typography>
          </Box>
        </AccordionSummary>
        
        <AccordionDetails sx={{ px: { xs: 1, sm: 2 }, pb: { xs: 1, sm: 2 } }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            
            {/* Group List */}
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                既存のグループ:
              </Typography>
              <List dense sx={{ py: 0 }}>
                {groups.filter(group => group.id !== 'general').map((group) => (
                  <ListItem 
                    key={group.id} 
                    sx={{ 
                      px: 0, 
                      py: 0.5,
                      borderRadius: 1,
                      '&:hover': {
                        bgcolor: 'grey.100',
                      }
                    }}
                  >
                    <ListItemButton
                      selected={selectedGroupId === group.id}
                      onClick={() => onSelectGroup(group.id)}
                      sx={{ 
                        py: 0.5, 
                        px: 1,
                        borderRadius: 1,
                        minHeight: 32,
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 28 }}>
                        <Circle sx={{ color: group.color, fontSize: { xs: 12, sm: 16 } }} />
                      </ListItemIcon>
                      <ListItemText 
                        primary={group.name} 
                        sx={{ 
                          '& .MuiListItemText-primary': {
                            fontSize: { xs: '0.875rem', sm: '1rem' },
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }
                        }}
                      />
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteGroup(group.id);
                        }}
                        sx={{ 
                          color: 'error.main',
                          '&:hover': {
                            bgcolor: 'error.light',
                            color: 'error.dark',
                          },
                          ml: 1,
                          fontSize: { xs: 16, sm: 20 }
                        }}
                      >
                        <Delete fontSize="inherit" />
                      </IconButton>
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Box>

            {/* Create Group Button */}
            {!showCreateForm && (
              <Button
                variant="outlined"
                startIcon={<Add />}
                onClick={handleCreateFormToggle}
                size={isMobile ? "small" : "medium"}
                sx={{ 
                  alignSelf: 'flex-start',
                  fontSize: { xs: '0.875rem', sm: '1rem' }
                }}
              >
                新しいグループを作成
              </Button>
            )}

            {/* Create Group Form */}
            {showCreateForm && (
              <Paper 
                elevation={1} 
                sx={{ 
                  p: { xs: 1.5, sm: 2 }, 
                  bgcolor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'grey.200'
                }}
              >
                <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    size="small"
                    value={newGroupName}
                    onChange={handleNameChange}
                    placeholder={suggestedName}
                    label="グループ名（省略可）"
                    variant="outlined"
                    error={showWarning}
                    helperText={showWarning ? "グループ名は10文字以内で入力してください" : `${newGroupName.length}/10文字`}
                    sx={{
                      '& .MuiInputBase-input::placeholder': {
                        opacity: 0.6,
                        fontStyle: 'italic',
                      },
                      '& .MuiFormHelperText-root': {
                        fontSize: { xs: '0.75rem', sm: '0.875rem' }
                      }
                    }}
                  />
                  
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      カラーを選択:
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {groupColors.map((color) => (
                        <IconButton
                          key={color}
                          size="small"
                          onClick={() => setSelectedColor(color)}
                          sx={{
                            width: { xs: 24, sm: 28 },
                            height: { xs: 24, sm: 28 },
                            border: selectedColor === color ? 2 : 1,
                            borderColor: selectedColor === color ? 'primary.main' : 'grey.300',
                            bgcolor: color,
                            '&:hover': {
                              bgcolor: color,
                              opacity: 0.8,
                            },
                          }}
                        >
                          {selectedColor === color && (
                            <Box sx={{ 
                              width: { xs: 4, sm: 6 }, 
                              height: { xs: 4, sm: 6 }, 
                              bgcolor: 'white', 
                              borderRadius: '50%' 
                            }} />
                          )}
                        </IconButton>
                      ))}
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', gap: 1, flexDirection: { xs: 'column', sm: 'row' } }}>
                    <Button
                      type="submit"
                      variant="contained"
                      size="small"
                      sx={{ 
                        flex: { xs: 'none', sm: 1 },
                        bgcolor: 'primary.main',
                        '&:hover': {
                          bgcolor: 'primary.dark',
                        }
                      }}
                    >
                      作成
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={handleCreateFormToggle}
                      sx={{ 
                        flex: { xs: 'none', sm: 1 },
                        color: 'text.secondary',
                        borderColor: 'grey.300',
                        '&:hover': {
                          borderColor: 'grey.400',
                          bgcolor: 'grey.50',
                        }
                      }}
                    >
                      キャンセル
                    </Button>
                  </Box>
                </Box>
              </Paper>
            )}
          </Box>
        </AccordionDetails>
      </Accordion>
    </Paper>
  );
}; 