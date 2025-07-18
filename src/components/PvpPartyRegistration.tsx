import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Stack,
  Autocomplete,
  useTheme,
  useMediaQuery,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  PhotoCamera,
  Save,
  Clear,
  Crop as CropIcon,
  CheckCircle,
  List as ListIcon
} from '@mui/icons-material';
// import ReactCrop, { type Crop, type PixelCrop } from 'react-image-crop';
// import 'react-image-crop/dist/ReactCrop.css';
import type { PvpParty, Pokemon, PokemonMove } from '../types';
import { allMoves, normalMoves, specialMoves } from '../data/pokemonMoves';

interface PvpPartyRegistrationProps {
  party?: PvpParty;
  onSave: (party: Omit<PvpParty, 'id' | 'createdAt'>) => void;
  onNavigateToList?: () => void;
}

const initialPokemon: Pokemon = {
  id: '',
  normalMove: '',
  specialMove1: '',
  specialMove2: ''
};

const presetLeagues = [
  'スーパーリーグ',
  'ハイパーリーグ', 
  'マスターリーグ',
  'マスタークラシック',
  'プレミアカップ',
  'エレメントカップ',
  'カントーカップ',
  'ジョウトカップ',
  'シンオウカップ',
  'ホウエンカップ',
  'ガラルカップ',
  'アローラカップ',
  '陽光カップ',
  'ホリデーカップ',
  'ラブカップ',
  'リトルカップ',
  'ファンタジーカップ',
  'ナイトメアカップ',
  'フェアリーカップ',
  'ゴーストカップ',
  'ジャングルカップ',
  'サンダーカップ',
  'クロスカップ',
  'その他'
];

export const PvpPartyRegistration: React.FC<PvpPartyRegistrationProps> = ({ party, onSave, onNavigateToList }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // 編集モードの場合は初期値を設定
  const [title, setTitle] = useState(party?.title || '');
  const [selectedLeague, setSelectedLeague] = useState(() => {
    if (party?.league && presetLeagues.includes(party.league)) {
      return party.league;
    }
    return party?.league ? 'その他' : 'スーパーリーグ';
  });
  const [customLeague, setCustomLeague] = useState(() => {
    if (party?.league && !presetLeagues.includes(party.league)) {
      return party.league;
    }
    return '';
  });
  const [pokemon1, setPokemon1] = useState<Pokemon>(party?.pokemon1 || { ...initialPokemon, id: '1' });
  const [pokemon2, setPokemon2] = useState<Pokemon>(party?.pokemon2 || { ...initialPokemon, id: '2' });
  const [pokemon3, setPokemon3] = useState<Pokemon>(party?.pokemon3 || { ...initialPokemon, id: '3' });
  const [image, setImage] = useState<string>(party?.image || '');
  const [croppedImage, setCroppedImage] = useState<string>(party?.croppedImage || '');
  const [showSuccess, setShowSuccess] = useState(false);
  
  // 編集モードでpartyプロパティが変更されたときにフォームを更新
  useEffect(() => {
    if (party) {
      console.log('📝 編集データをフォームに設定:', party);
      setTitle(party.title || '');
      
      // リーグ設定
      if (party.league && presetLeagues.includes(party.league)) {
        setSelectedLeague(party.league);
        setCustomLeague('');
      } else if (party.league) {
        setSelectedLeague('その他');
        setCustomLeague(party.league);
      }
      
      // ポケモンデータ設定
      setPokemon1(party.pokemon1 || { ...initialPokemon, id: '1' });
      setPokemon2(party.pokemon2 || { ...initialPokemon, id: '2' });
      setPokemon3(party.pokemon3 || { ...initialPokemon, id: '3' });
      
      // 画像データ設定
      setImage(party.image || '');
      setCroppedImage(party.croppedImage || '');
      
      console.log('✅ フォームデータ設定完了:', {
        title: party.title,
        league: party.league,
        pokemon1: party.pokemon1,
        pokemon2: party.pokemon2,
        pokemon3: party.pokemon3,
        hasImage: !!party.image,
        hasCroppedImage: !!party.croppedImage
      });
    }
  }, [party]);
  
  // 画像切り抜き関連
  const [showCropDialog, setShowCropDialog] = useState(false);
  const [cropArea, setCropArea] = useState({
    startX: 0,
    startY: 0,
    endX: 0,
    endY: 0,
    isSelecting: false,
    isDragging: false,
    isResizing: false,
    resizeHandle: '',
    dragStartX: 0,
    dragStartY: 0
  });

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log('Image file selected:', file.name, file.size);
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImage(result);
        setCroppedImage(result); // そのまま元画像を使用
        // 前回の切り抜き画像をクリア
        // setCroppedImage('');
      };
      reader.readAsDataURL(file);
    }
  };

  // 切り抜き機能は一時的に無効化

  // 簡単な範囲選択機能
  const handleCropComplete = async () => {
    if (imgRef.current && cropArea.endX > cropArea.startX && cropArea.endY > cropArea.startY) {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = imgRef.current;
        
        if (!ctx) return;
        
        // 切り抜きサイズ計算
        const rect = img.getBoundingClientRect();
        const scaleX = img.naturalWidth / rect.width;
        const scaleY = img.naturalHeight / rect.height;
        
        const cropWidth = (cropArea.endX - cropArea.startX) * scaleX;
        const cropHeight = (cropArea.endY - cropArea.startY) * scaleY;
        const cropX = cropArea.startX * scaleX;
        const cropY = cropArea.startY * scaleY;
        
        canvas.width = cropWidth;
        canvas.height = cropHeight;
        
        // 白背景
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, cropWidth, cropHeight);
        
        // 画像を切り抜いて描画
        ctx.drawImage(
          img,
          cropX, cropY, cropWidth, cropHeight,
          0, 0, cropWidth, cropHeight
        );
        
        const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.9);
        setCroppedImage(croppedDataUrl);
        console.log('Cropped image created successfully');
      } catch (error) {
        console.error('Crop error:', error);
      }
    }
    setShowCropDialog(false);
  };

  // 画像の実際の位置とサイズを取得
  const getImageBounds = () => {
    if (!imgRef.current) return null;
    
    const img = imgRef.current;
    const container = img.parentElement;
    if (!container) return null;
    
    const containerRect = container.getBoundingClientRect();
    const imgRect = img.getBoundingClientRect();
    
    return {
      left: imgRect.left - containerRect.left,
      top: imgRect.top - containerRect.top,
      width: img.offsetWidth,
      height: img.offsetHeight
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const bounds = getImageBounds();
    if (!bounds) return;
    
    const container = imgRef.current?.parentElement;
    if (!container) return;
    
    const containerRect = container.getBoundingClientRect();
    const x = e.clientX - containerRect.left - bounds.left;
    const y = e.clientY - containerRect.top - bounds.top;
    
    // 既存の選択範囲があるかチェック
    const hasSelection = cropArea.endX > cropArea.startX && cropArea.endY > cropArea.startY;
    
    if (hasSelection) {
      const selectionLeft = Math.min(cropArea.startX, cropArea.endX);
      const selectionTop = Math.min(cropArea.startY, cropArea.endY);
      const selectionWidth = Math.abs(cropArea.endX - cropArea.startX);
      const selectionHeight = Math.abs(cropArea.endY - cropArea.startY);
      
      // クリックがリサイズハンドル上かチェック
      const handleSize = 8;
      const tolerance = 4;
      
      // 四隅のハンドル判定
      if (Math.abs(x - selectionLeft) <= tolerance + handleSize/2 && Math.abs(y - selectionTop) <= tolerance + handleSize/2) {
        // 左上
        setCropArea(prev => ({ ...prev, isResizing: true, resizeHandle: 'nw', dragStartX: x, dragStartY: y }));
        return;
      } else if (Math.abs(x - (selectionLeft + selectionWidth)) <= tolerance + handleSize/2 && Math.abs(y - selectionTop) <= tolerance + handleSize/2) {
        // 右上
        setCropArea(prev => ({ ...prev, isResizing: true, resizeHandle: 'ne', dragStartX: x, dragStartY: y }));
        return;
      } else if (Math.abs(x - selectionLeft) <= tolerance + handleSize/2 && Math.abs(y - (selectionTop + selectionHeight)) <= tolerance + handleSize/2) {
        // 左下
        setCropArea(prev => ({ ...prev, isResizing: true, resizeHandle: 'sw', dragStartX: x, dragStartY: y }));
        return;
      } else if (Math.abs(x - (selectionLeft + selectionWidth)) <= tolerance + handleSize/2 && Math.abs(y - (selectionTop + selectionHeight)) <= tolerance + handleSize/2) {
        // 右下
        setCropArea(prev => ({ ...prev, isResizing: true, resizeHandle: 'se', dragStartX: x, dragStartY: y }));
        return;
      }
      
      // 選択範囲内でのドラッグ移動判定
      if (x >= selectionLeft && x <= selectionLeft + selectionWidth && 
          y >= selectionTop && y <= selectionTop + selectionHeight) {
        setCropArea(prev => ({ 
          ...prev, 
          isDragging: true, 
          dragStartX: x, 
          dragStartY: y 
        }));
        return;
      }
    }
    
    // 画像の境界内で新しい選択を開始
    if (x >= 0 && x <= bounds.width && y >= 0 && y <= bounds.height) {
      setCropArea({
        startX: x,
        startY: y,
        endX: x,
        endY: y,
        isSelecting: true,
        isDragging: false,
        isResizing: false,
        resizeHandle: '',
        dragStartX: 0,
        dragStartY: 0
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const bounds = getImageBounds();
    if (!bounds) return;
    
    const container = imgRef.current?.parentElement;
    if (!container) return;
    
    const containerRect = container.getBoundingClientRect();
    const x = Math.max(0, Math.min(bounds.width, e.clientX - containerRect.left - bounds.left));
    const y = Math.max(0, Math.min(bounds.height, e.clientY - containerRect.top - bounds.top));
    
    if (cropArea.isSelecting) {
      // 新しい選択範囲の作成
      setCropArea(prev => ({
        ...prev,
        endX: x,
        endY: y
      }));
    } else if (cropArea.isDragging) {
      // ドラッグ移動
      const deltaX = x - cropArea.dragStartX;
      const deltaY = y - cropArea.dragStartY;
      
      const currentWidth = Math.abs(cropArea.endX - cropArea.startX);
      const currentHeight = Math.abs(cropArea.endY - cropArea.startY);
      
      const newStartX = Math.max(0, Math.min(bounds.width - currentWidth, cropArea.startX + deltaX));
      const newStartY = Math.max(0, Math.min(bounds.height - currentHeight, cropArea.startY + deltaY));
      
      setCropArea(prev => ({
        ...prev,
        startX: newStartX,
        startY: newStartY,
        endX: newStartX + currentWidth,
        endY: newStartY + currentHeight,
        dragStartX: x,
        dragStartY: y
      }));
    } else if (cropArea.isResizing) {
      // リサイズ処理
      const handle = cropArea.resizeHandle;
      
      setCropArea(prev => {
        let newStartX = prev.startX;
        let newStartY = prev.startY;
        let newEndX = prev.endX;
        let newEndY = prev.endY;
        
        switch (handle) {
          case 'nw': // 左上
            newStartX = Math.max(0, Math.min(x, prev.endX - 10));
            newStartY = Math.max(0, Math.min(y, prev.endY - 10));
            break;
          case 'ne': // 右上
            newEndX = Math.max(prev.startX + 10, Math.min(bounds.width, x));
            newStartY = Math.max(0, Math.min(y, prev.endY - 10));
            break;
          case 'sw': // 左下
            newStartX = Math.max(0, Math.min(x, prev.endX - 10));
            newEndY = Math.max(prev.startY + 10, Math.min(bounds.height, y));
            break;
          case 'se': // 右下
            newEndX = Math.max(prev.startX + 10, Math.min(bounds.width, x));
            newEndY = Math.max(prev.startY + 10, Math.min(bounds.height, y));
            break;
        }
        
        return {
          ...prev,
          startX: newStartX,
          startY: newStartY,
          endX: newEndX,
          endY: newEndY
        };
      });
    }
  };

  const handleMouseUp = () => {
    setCropArea(prev => ({
      ...prev,
      isSelecting: false,
      isDragging: false,
      isResizing: false,
      resizeHandle: ''
    }));
  };

  // タッチイベント対応
  const handleTouchStart = (e: React.TouchEvent) => {
    const bounds = getImageBounds();
    if (!bounds) return;
    
    const touch = e.touches[0];
    const container = imgRef.current?.parentElement;
    if (!container) return;
    
    const containerRect = container.getBoundingClientRect();
    const x = touch.clientX - containerRect.left - bounds.left;
    const y = touch.clientY - containerRect.top - bounds.top;
    
    // 既存の選択範囲があるかチェック
    const hasSelection = cropArea.endX > cropArea.startX && cropArea.endY > cropArea.startY;
    
    if (hasSelection) {
      const selectionLeft = Math.min(cropArea.startX, cropArea.endX);
      const selectionTop = Math.min(cropArea.startY, cropArea.endY);
      const selectionWidth = Math.abs(cropArea.endX - cropArea.startX);
      const selectionHeight = Math.abs(cropArea.endY - cropArea.startY);
      
      // タッチがリサイズハンドル上かチェック（タッチ用により大きなタップエリア）
      const handleSize = 12;
      const tolerance = 8;
      
      // 四隅のハンドル判定
      if (Math.abs(x - selectionLeft) <= tolerance + handleSize/2 && Math.abs(y - selectionTop) <= tolerance + handleSize/2) {
        setCropArea(prev => ({ ...prev, isResizing: true, resizeHandle: 'nw', dragStartX: x, dragStartY: y }));
        e.preventDefault();
        return;
      } else if (Math.abs(x - (selectionLeft + selectionWidth)) <= tolerance + handleSize/2 && Math.abs(y - selectionTop) <= tolerance + handleSize/2) {
        setCropArea(prev => ({ ...prev, isResizing: true, resizeHandle: 'ne', dragStartX: x, dragStartY: y }));
        e.preventDefault();
        return;
      } else if (Math.abs(x - selectionLeft) <= tolerance + handleSize/2 && Math.abs(y - (selectionTop + selectionHeight)) <= tolerance + handleSize/2) {
        setCropArea(prev => ({ ...prev, isResizing: true, resizeHandle: 'sw', dragStartX: x, dragStartY: y }));
        e.preventDefault();
        return;
      } else if (Math.abs(x - (selectionLeft + selectionWidth)) <= tolerance + handleSize/2 && Math.abs(y - (selectionTop + selectionHeight)) <= tolerance + handleSize/2) {
        setCropArea(prev => ({ ...prev, isResizing: true, resizeHandle: 'se', dragStartX: x, dragStartY: y }));
        e.preventDefault();
        return;
      }
      
      // 選択範囲内でのドラッグ移動判定
      if (x >= selectionLeft && x <= selectionLeft + selectionWidth && 
          y >= selectionTop && y <= selectionTop + selectionHeight) {
        setCropArea(prev => ({ 
          ...prev, 
          isDragging: true, 
          dragStartX: x, 
          dragStartY: y 
        }));
        e.preventDefault();
        return;
      }
    }
    
    // 画像の境界内で新しい選択を開始
    if (x >= 0 && x <= bounds.width && y >= 0 && y <= bounds.height) {
      setCropArea({
        startX: x,
        startY: y,
        endX: x,
        endY: y,
        isSelecting: true,
        isDragging: false,
        isResizing: false,
        resizeHandle: '',
        dragStartX: 0,
        dragStartY: 0
      });
    }
    
    e.preventDefault();
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const bounds = getImageBounds();
    if (!bounds) return;
    
    const touch = e.touches[0];
    const container = imgRef.current?.parentElement;
    if (!container) return;
    
    const containerRect = container.getBoundingClientRect();
    const x = Math.max(0, Math.min(bounds.width, touch.clientX - containerRect.left - bounds.left));
    const y = Math.max(0, Math.min(bounds.height, touch.clientY - containerRect.top - bounds.top));

    if (cropArea.isSelecting) {
      // 新しい選択範囲の作成
      setCropArea(prev => ({
        ...prev,
        endX: x,
        endY: y
      }));
    } else if (cropArea.isDragging) {
      // ドラッグ移動
      const deltaX = x - cropArea.dragStartX;
      const deltaY = y - cropArea.dragStartY;
      
      const currentWidth = Math.abs(cropArea.endX - cropArea.startX);
      const currentHeight = Math.abs(cropArea.endY - cropArea.startY);
      
      const newStartX = Math.max(0, Math.min(bounds.width - currentWidth, cropArea.startX + deltaX));
      const newStartY = Math.max(0, Math.min(bounds.height - currentHeight, cropArea.startY + deltaY));
      
      setCropArea(prev => ({
        ...prev,
        startX: newStartX,
        startY: newStartY,
        endX: newStartX + currentWidth,
        endY: newStartY + currentHeight,
        dragStartX: x,
        dragStartY: y
      }));
    } else if (cropArea.isResizing) {
      // リサイズ処理
      const handle = cropArea.resizeHandle;
      
      setCropArea(prev => {
        let newStartX = prev.startX;
        let newStartY = prev.startY;
        let newEndX = prev.endX;
        let newEndY = prev.endY;
        
        switch (handle) {
          case 'nw':
            newStartX = Math.max(0, Math.min(x, prev.endX - 10));
            newStartY = Math.max(0, Math.min(y, prev.endY - 10));
            break;
          case 'ne':
            newEndX = Math.max(prev.startX + 10, Math.min(bounds.width, x));
            newStartY = Math.max(0, Math.min(y, prev.endY - 10));
            break;
          case 'sw':
            newStartX = Math.max(0, Math.min(x, prev.endX - 10));
            newEndY = Math.max(prev.startY + 10, Math.min(bounds.height, y));
            break;
          case 'se':
            newEndX = Math.max(prev.startX + 10, Math.min(bounds.width, x));
            newEndY = Math.max(prev.startY + 10, Math.min(bounds.height, y));
            break;
        }
        
        return {
          ...prev,
          startX: newStartX,
          startY: newStartY,
          endX: newEndX,
          endY: newEndY
        };
      });
    }
    
    e.preventDefault();
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setCropArea(prev => ({
      ...prev,
      isSelecting: false,
      isDragging: false,
      isResizing: false,
      resizeHandle: ''
    }));
    
    e.preventDefault();
  };

  const updatePokemon = (
    pokemonNumber: 1 | 2 | 3,
    field: keyof Pokemon,
    value: string
  ) => {
    const updateFunction = pokemonNumber === 1 ? setPokemon1 : pokemonNumber === 2 ? setPokemon2 : setPokemon3;
    const currentPokemon = pokemonNumber === 1 ? pokemon1 : pokemonNumber === 2 ? pokemon2 : pokemon3;
    
    updateFunction({
      ...currentPokemon,
      [field]: value
    });
  };

  // 画像データを圧縮・リサイズする関数
  const compressImage = (base64String: string, maxWidth: number = 400, quality: number = 0.3): Promise<string> => {
    return new Promise((resolve) => {
      if (!base64String || !base64String.startsWith('data:image/')) {
        resolve(base64String);
        return;
      }

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // 比率を保ったままリサイズ
        const aspectRatio = img.height / img.width;
        const newWidth = Math.min(img.width, maxWidth);
        const newHeight = newWidth * aspectRatio;
        
        canvas.width = newWidth;
        canvas.height = newHeight;
        
        ctx?.drawImage(img, 0, 0, newWidth, newHeight);
        
        // JPEG形式で品質を下げて圧縮
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        const originalSizeKB = Math.round(base64String.length / 1024);
        const compressedSizeKB = Math.round(compressedBase64.length / 1024);
        console.log(`🗜️ 画像圧縮: ${originalSizeKB}KB → ${compressedSizeKB}KB (${Math.round((1 - compressedSizeKB/originalSizeKB) * 100)}% 削減)`);
        resolve(compressedBase64);
      };
      
      img.src = base64String;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const finalLeague = selectedLeague === 'その他' 
      ? (customLeague.trim() || 'その他')
      : selectedLeague;

    const finalTitle = title.trim() || '無題のパーティ';

    // 画像データを圧縮（画像がある場合のみ）
    console.log('🗜️ 画像圧縮開始...');
    const compressedImage = image ? await compressImage(image, 400, 0.3) : '';
    const compressedCroppedImage = croppedImage ? await compressImage(croppedImage, 400, 0.3) : '';

    // 送信前のデータ詳細ログ
    console.log('📤 フロントエンドから送信するデータ:');
    console.log('  📝 タイトル:', finalTitle);
    console.log('  🏆 リーグ:', finalLeague);
    console.log('  🐾 ポケモン1詳細:', {
      id: pokemon1.id,
      normalMove: pokemon1.normalMove,
      specialMove1: pokemon1.specialMove1,
      specialMove2: pokemon1.specialMove2,
      hasNormalMove: !!pokemon1.normalMove,
      normalMoveLength: pokemon1.normalMove?.length || 0
    });
    console.log('  🐾 ポケモン2詳細:', {
      id: pokemon2.id,
      normalMove: pokemon2.normalMove,
      specialMove1: pokemon2.specialMove1,
      specialMove2: pokemon2.specialMove2,
      hasNormalMove: !!pokemon2.normalMove,
      normalMoveLength: pokemon2.normalMove?.length || 0
    });
    console.log('  🐾 ポケモン3詳細:', {
      id: pokemon3.id,
      normalMove: pokemon3.normalMove,
      specialMove1: pokemon3.specialMove1,
      specialMove2: pokemon3.specialMove2,
      hasNormalMove: !!pokemon3.normalMove,
      normalMoveLength: pokemon3.normalMove?.length || 0
    });
    console.log('  🖼️ 画像データ:', {
      hasOriginal: !!compressedImage,
      hasCropped: !!compressedCroppedImage,
      originalSize: compressedImage ? Math.round(compressedImage.length / 1024) + 'KB' : '0KB',
      croppedSize: compressedCroppedImage ? Math.round(compressedCroppedImage.length / 1024) + 'KB' : '0KB'
    });

    const party: Omit<PvpParty, 'id' | 'createdAt'> = {
      title: finalTitle,
      league: finalLeague,
      pokemon1,
      pokemon2,
      pokemon3,
      image: compressedImage,
      croppedImage: compressedCroppedImage
    };

    console.log('📦 最終パーティデータサイズ:', Math.round(JSON.stringify(party).length / 1024), 'KB');
    console.log('📊 最終パーティオブジェクト詳細:', {
      title: party.title,
      league: party.league,
      pokemon1Keys: Object.keys(party.pokemon1),
      pokemon2Keys: Object.keys(party.pokemon2),
      pokemon3Keys: Object.keys(party.pokemon3),
      hasImage: !!party.image,
      hasCroppedImage: !!party.croppedImage
    });

    onSave(party);
    
    // フォームをリセット
    setTitle('');
    setSelectedLeague('スーパーリーグ');
    setCustomLeague('');
    setPokemon1({ ...initialPokemon, id: '1' });
    setPokemon2({ ...initialPokemon, id: '2' });
    setPokemon3({ ...initialPokemon, id: '3' });
    setImage('');
    setCroppedImage('');
    
    // 成功ダイアログはPvpPartyRegistrationWithApiで管理するため、ここでは表示しない
    // setShowSuccess(true);
  };

  const handleClear = () => {
    setTitle('');
    setSelectedLeague('スーパーリーグ');
    setCustomLeague('');
    setPokemon1({ ...initialPokemon, id: '1' });
    setPokemon2({ ...initialPokemon, id: '2' });
    setPokemon3({ ...initialPokemon, id: '3' });
    setImage('');
    setCroppedImage('');
  };

  const renderPokemonForm = (pokemon: Pokemon, pokemonNumber: 1 | 2 | 3) => (
    <Card key={pokemonNumber} sx={{ mb: 2, border: '1px solid', borderColor: 'grey.200' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom color="primary">
          ポケモン {pokemonNumber}
        </Typography>
        <Stack spacing={2}>
          <Autocomplete
            options={normalMoves}
            value={pokemon.normalMove}
            onChange={(_, value) => updatePokemon(pokemonNumber, 'normalMove', value || '')}
            renderInput={(params) => (
              <TextField
                {...params}
                size="small"
                label="通常ワザ"
                placeholder="例: マッドショット"
              />
            )}
            freeSolo
            disableClearable
          />
          <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
            <Autocomplete
              options={specialMoves}
              value={pokemon.specialMove1}
              onChange={(_, value) => updatePokemon(pokemonNumber, 'specialMove1', value || '')}
              renderInput={(params) => (
                <TextField
                  {...params}
                  size="small"
                  label="SPワザ1"
                  placeholder="例: じしん"
                />
              )}
              freeSolo
              disableClearable
              sx={{ flex: 1 }}
            />
            <Autocomplete
              options={specialMoves}
              value={pokemon.specialMove2}
              onChange={(_, value) => updatePokemon(pokemonNumber, 'specialMove2', value || '')}
              renderInput={(params) => (
                <TextField
                  {...params}
                  size="small"
                  label="SPワザ2"
                  placeholder="例: ドラゴンクロー"
                />
              )}
              freeSolo
              disableClearable
              sx={{ flex: 1 }}
            />
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ p: { xs: 1, sm: 2 }, maxWidth: 800, mx: 'auto' }}>
      <Paper elevation={1} sx={{ p: { xs: 2, sm: 3 }, border: '1px solid', borderColor: 'grey.200' }}>
        <Typography 
          variant="h6" 
          gutterBottom 
          color="primary" 
          sx={{ 
            fontWeight: 600,
            fontSize: { xs: '1.1rem', sm: '1.25rem' }
          }}
        >
          {party ? '編集' : '新規登録'}
        </Typography>
        
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          {/* 基本情報 */}
          <Stack spacing={2} sx={{ mb: 3 }}>
            <TextField
              fullWidth
              size="small"
              label="パーティ名（任意）"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例: スーパーリーグ最強パーティ"
            />
            
            <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
              <FormControl fullWidth size="small">
                <InputLabel>リーグ</InputLabel>
                <Select
                  value={selectedLeague}
                  label="リーグ"
                  onChange={(e) => setSelectedLeague(e.target.value)}
                >
                  {presetLeagues.map((league) => (
                    <MenuItem key={league} value={league}>{league}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              {selectedLeague === 'その他' && (
                <TextField
                  fullWidth
                  size="small"
                  label="カスタムリーグ名"
                  value={customLeague}
                  onChange={(e) => setCustomLeague(e.target.value)}
                  placeholder="例: 特別カップ、イベントカップ、独自ルール"
                  helperText="オリジナルのリーグ名を入力してください"
                  required
                />
              )}
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ flex: 1 }}>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="image-upload"
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                />
                <label htmlFor="image-upload" style={{ width: '100%' }}>
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<PhotoCamera />}
                    fullWidth
                    size="small"
                  >
                    パーティ画像を選択
                  </Button>
                </label>
              </Box>
              
              {croppedImage && (
                <Button
                  variant="outlined"
                  startIcon={<CropIcon />}
                  onClick={() => {
                    setShowCropDialog(true);
                    // ファイル入力をクリアして再選択を可能にする
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                  size="small"
                >
                  画像を再選択
                </Button>
              )}
            </Box>
          </Stack>

          {/* 切り抜き後画像プレビュー */}
          {croppedImage && (
            <Box sx={{ mb: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                切り抜き後プレビュー
              </Typography>
              <img
                src={croppedImage}
                alt="切り抜きパーティ画像"
                style={{
                  maxWidth: '100%',
                  maxHeight: 200,
                  borderRadius: 8,
                  border: '1px solid #ddd'
                }}
                onLoad={() => {
                  console.log('Preview image loaded successfully');
                }}
                onError={(e) => {
                  console.error('Preview image load error:', e);
                }}
              />
            </Box>
          )}

          {/* ポケモン情報 */}
          <Typography variant="h6" gutterBottom sx={{ mt: 3, mb: 2 }}>
            パーティ構成
          </Typography>
          
          {renderPokemonForm(pokemon1, 1)}
          {renderPokemonForm(pokemon2, 2)}
          {renderPokemonForm(pokemon3, 3)}

          {/* アクションボタン */}
          <Box sx={{ 
            display: 'flex', 
            gap: 2, 
            flexDirection: { xs: 'column', sm: 'row' },
            mt: 4 
          }}>
            <Button
              type="submit"
              variant="contained"
              startIcon={<Save />}
              size={isMobile ? "medium" : "large"}
              sx={{ flex: 1 }}
            >
              パーティを登録
            </Button>
            <Button
              variant="outlined"
              startIcon={<Clear />}
              onClick={handleClear}
              size={isMobile ? "medium" : "large"}
              sx={{ flex: { xs: 1, sm: 'none' } }}
            >
              クリア
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* 画像切り抜きダイアログ */}
      <Dialog
        open={showCropDialog}
        onClose={() => setShowCropDialog(false)}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
        scroll="body"
        PaperProps={{
          sx: isMobile ? {
            height: '100vh',
            width: '100vw',
            maxHeight: '100vh',
            maxWidth: '100vw',
            margin: 0,
            borderRadius: 0,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            zIndex: 1300,
            position: 'relative'
          } : {
            maxHeight: '90vh'
          }
        }}
      >
        <DialogTitle 
          sx={{ 
            flexShrink: 0,
            zIndex: 1301,
            position: 'relative',
            bgcolor: 'background.paper'
          }}
        >
          パーティ画像プレビュー
        </DialogTitle>
        <DialogContent
          sx={{
            flex: 1,
            overflow: 'auto',
            p: isMobile ? 1 : 3,
            WebkitOverflowScrolling: 'touch',
            touchAction: 'auto',
            minHeight: 0,
            maxHeight: isMobile ? 'calc(100vh - 100px)' : 'auto'
          }}
        >
          <Typography variant="body2" color="text.secondary" gutterBottom>
            ✂️ 切り抜きたい範囲を{isMobile ? 'タッチ' : 'マウス'}ドラッグで選択してください
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
            • {isMobile ? '指で画像を' : 'マウスを'}ドラッグして四角い範囲を選択<br/>
            • 選択した部分だけが切り抜かれます<br/>
            • 範囲を選択しないと元画像がそのまま使用されます
          </Typography>
                    {image && (
            <Box
              sx={{
                width: '100%',
                height: isMobile ? '55vh' : '65vh',
                border: '2px dashed #ccc',
                borderRadius: 2,
                p: 1,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#f5f5f5',
                position: 'relative',
                cursor: 'crosshair',
                overflow: 'hidden'
              }}
            >
              <Box
                sx={{
                  position: 'relative',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: '100%',
                  height: '100%',
                  touchAction: 'none'
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <img
                  ref={imgRef}
                  src={image}
                  alt="アップロード画像"
                  style={{ 
                    maxWidth: 'calc(100% - 16px)',
                    maxHeight: 'calc(100% - 16px)',
                    width: 'auto',
                    height: 'auto',
                    display: 'block',
                    borderRadius: '8px',
                    objectFit: 'contain',
                    objectPosition: 'center',
                    userSelect: 'none'
                  }}
                  onLoad={(e) => {
                    const img = e.currentTarget;
                    const container = img.parentElement?.parentElement;
                    console.log('Image loaded:', {
                      naturalWidth: img.naturalWidth,
                      naturalHeight: img.naturalHeight,
                      displayWidth: img.width,
                      displayHeight: img.height,
                      containerWidth: container?.clientWidth,
                      containerHeight: container?.clientHeight,
                      aspectRatio: img.naturalWidth / img.naturalHeight,
                      src: img.src.substring(0, 50) + '...',
                      isMobile: isMobile
                    });
                  }}
                  onError={(e) => {
                    console.error('Image load error:', e);
                  }}
                />
                
                {/* 選択範囲表示 */}
                {(cropArea.isSelecting || (cropArea.endX > cropArea.startX && cropArea.endY > cropArea.startY)) && (() => {
                  const bounds = getImageBounds();
                  if (!bounds) return null;
                  
                  const left = Math.min(cropArea.startX, cropArea.endX) + bounds.left;
                  const top = Math.min(cropArea.startY, cropArea.endY) + bounds.top;
                  const width = Math.abs(cropArea.endX - cropArea.startX);
                  const height = Math.abs(cropArea.endY - cropArea.startY);
                  
                  return (
                    <Box
                      sx={{
                        position: 'absolute',
                        left: left,
                        top: top,
                        width: width,
                        height: height,
                        border: '2px solid #2196f3',
                        backgroundColor: 'rgba(33, 150, 243, 0.1)',
                        cursor: cropArea.isSelecting ? 'crosshair' : 'move',
                        pointerEvents: 'auto'
                      }}
                    >
                      {/* 中央のドラッグエリア */}
                      {!cropArea.isSelecting && (
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 8,
                            left: 8,
                            right: 8,
                            bottom: 8,
                            cursor: 'move',
                            '&:hover': {
                              backgroundColor: 'rgba(33, 150, 243, 0.2)'
                            }
                          }}
                        />
                      )}
                      
                      {/* 四隅のリサイズハンドル */}
                      {!cropArea.isSelecting && (
                        <>
                          <Box
                            sx={{
                              position: 'absolute',
                              top: -4,
                              left: -4,
                              width: 8,
                              height: 8,
                              backgroundColor: '#2196f3',
                              borderRadius: '50%',
                              cursor: 'nw-resize'
                            }}
                          />
                          <Box
                            sx={{
                              position: 'absolute',
                              top: -4,
                              right: -4,
                              width: 8,
                              height: 8,
                              backgroundColor: '#2196f3',
                              borderRadius: '50%',
                              cursor: 'ne-resize'
                            }}
                          />
                          <Box
                            sx={{
                              position: 'absolute',
                              bottom: -4,
                              left: -4,
                              width: 8,
                              height: 8,
                              backgroundColor: '#2196f3',
                              borderRadius: '50%',
                              cursor: 'sw-resize'
                            }}
                          />
                          <Box
                            sx={{
                              position: 'absolute',
                              bottom: -4,
                              right: -4,
                              width: 8,
                              height: 8,
                              backgroundColor: '#2196f3',
                              borderRadius: '50%',
                              cursor: 'se-resize'
                            }}
                          />
                        </>
                      )}
                    </Box>
                  );
                })()}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions
          sx={{
            p: isMobile ? 2 : 1,
            gap: isMobile ? 1 : 0,
            flexDirection: isMobile ? 'column' : 'row',
            flexShrink: 0,
            zIndex: 1301,
            position: 'relative',
            bgcolor: 'background.paper'
          }}
        >
          <Button 
            onClick={() => {
              setShowCropDialog(false);
              // ファイル入力をクリアして再選択を可能にする
              if (fileInputRef.current) {
                fileInputRef.current.value = '';
              }
            }}
            fullWidth={isMobile}
          >
            キャンセル
          </Button>
          <Button 
            onClick={handleCropComplete}
            variant="contained"
            startIcon={<CropIcon />}
            fullWidth={isMobile}
          >
            切り抜き実行
          </Button>
        </DialogActions>
      </Dialog>

      {/* 成功メッセージ */}
      <Dialog
        open={showSuccess}
        onClose={() => setShowSuccess(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CheckCircle sx={{ color: 'success.main', fontSize: 28 }} />
            登録完了
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            パーティが正常に{party ? '更新' : '登録'}されました！
          </Typography>
          <Typography variant="body2" color="text.secondary">
            続けて他のパーティを登録するか、一覧で確認することができます。
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button 
            onClick={() => setShowSuccess(false)}
            variant="outlined"
          >
            続けて登録
          </Button>
          {onNavigateToList && (
            <Button 
              onClick={() => {
                setShowSuccess(false);
                onNavigateToList();
              }}
              variant="contained"
              color="primary"
              startIcon={<ListIcon />}
            >
              一覧を見る
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}; 