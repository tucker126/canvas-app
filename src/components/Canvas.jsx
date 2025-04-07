import React, { useContext, useRef, useState, useEffect } from 'react';
import styled from 'styled-components';
import { CanvasContext } from '../context/CanvasContext';
import ShapeElement from './elements/ShapeElement';
import ImageElement from './elements/ImageElement';
import TextElement from './elements/TextElement';
import FloatingToolbar from './FloatingToolbar';

const CanvasContainer = styled.div`
  flex: 1;
  overflow: hidden;
  position: relative;
  background-color: #f0f0f0;
  background-image: 
    linear-gradient(45deg, #e0e0e0 25%, transparent 25%),
    linear-gradient(-45deg, #e0e0e0 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #e0e0e0 75%),
    linear-gradient(-45deg, transparent 75%, #e0e0e0 75%);
  background-size: 20px 20px;
  background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
`;

const CanvasWorkspace = styled.div`
  position: absolute;
  transform-origin: 0 0;
  background-color: white;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  width: 1920px;
  height: 1080px;
`;

const SelectionRect = styled.div`
  position: absolute;
  border: 1px dashed #0078d7;
  background-color: rgba(0, 120, 215, 0.1);
  pointer-events: none;
`;

const ZoomControls = styled.div`
  position: absolute;
  bottom: 20px;
  right: 20px;
  display: flex;
  gap: 10px;
  background-color: white;
  padding: 5px;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const ZoomButton = styled.button`
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #ced4da;
  background-color: white;
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    background-color: #f1f3f5;
  }
`;

const ZoomText = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 10px;
`;

const Canvas = () => {
  const {
    scale,
    setScale,
    position,
    setPosition,
    elements,
    selectedElements,
    selectElement,
    clearSelection,
    currentTool,
    activeToolbar,
    deleteSelectedElements
  } = useContext(CanvasContext);
  
  const containerRef = useRef(null);
  const workspaceRef = useRef(null);
  
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectionRect, setSelectionRect] = useState(null);
  const [isSelecting, setIsSelecting] = useState(false);

  // 是否可拖拽画布
  const isDraggable = currentTool === 'hand';
  
  // 处理画布缩放
  const handleWheel = (e) => {
    if (e.ctrlKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      const newScale = Math.max(0.1, Math.min(3, scale + delta));
      setScale(newScale);
    }
  };

  // 处理缩放按钮点击
  const handleZoomIn = () => {
    setScale(Math.min(3, scale + 0.1));
  };

  const handleZoomOut = () => {
    setScale(Math.max(0.1, scale - 0.1));
  };

  const handleResetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // 处理画布拖拽
  const handleMouseDown = (e) => {
    // 如果当前是手型工具或者按住了Alt键或者是中键
    if (isDraggable || e.button === 1 || (e.button === 0 && e.altKey)) {
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      // 设置抓取状态的光标
      if (containerRef.current) {
        containerRef.current.style.cursor = 'grabbing';
      }
      e.preventDefault();
    } 
    // 如果点击的是画布背景而不是元素
    else if ((e.target === workspaceRef.current || e.target === containerRef.current) && currentTool === 'select') {
      // 框选开始
      if (!e.ctrlKey && !e.shiftKey) {
        clearSelection();
      }
      
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - position.x) / scale;
      const y = (e.clientY - rect.top - position.y) / scale;
      
      setSelectionRect({
        startX: x,
        startY: y,
        width: 0,
        height: 0
      });
      
      setIsSelecting(true);
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      setPosition({
        x: position.x + dx,
        y: position.y + dy
      });
      setDragStart({ x: e.clientX, y: e.clientY });
    } else if (isSelecting && selectionRect) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - position.x) / scale;
      const y = (e.clientY - rect.top - position.y) / scale;
      
      setSelectionRect({
        ...selectionRect,
        width: x - selectionRect.startX,
        height: y - selectionRect.startY
      });
    }
  };

  const handleMouseUp = (e) => {
    if (isDragging) {
      setIsDragging(false);
      // 恢复光标
      if (containerRef.current) {
        containerRef.current.style.cursor = isDraggable ? 'grab' : 'default';
      }
    }
    
    if (isSelecting && selectionRect) {
      // 计算框选区域
      const normalizedRect = {
        left: selectionRect.width > 0 ? selectionRect.startX : selectionRect.startX + selectionRect.width,
        top: selectionRect.height > 0 ? selectionRect.startY : selectionRect.startY + selectionRect.height,
        width: Math.abs(selectionRect.width),
        height: Math.abs(selectionRect.height)
      };
      
      // 选择在框选区域内的元素
      const selectedIds = elements.filter(element => {
        return (
          element.x >= normalizedRect.left &&
          element.x + element.width <= normalizedRect.left + normalizedRect.width &&
          element.y >= normalizedRect.top &&
          element.y + element.height <= normalizedRect.top + normalizedRect.height
        );
      }).map(el => el.id);
      
      if (selectedIds.length > 0) {
        selectedIds.forEach(id => selectElement(id, true));
      }
      
      setIsSelecting(false);
      setSelectionRect(null);
    }
  };

  // 处理按键事件
  const handleKeyDown = (e) => {
    if ((e.key === 'Delete' || e.key === 'Backspace') && !e.target.isContentEditable) {
      if (selectedElements.length > 0) {
        e.preventDefault();
        deleteSelectedElements();
      }
    }
    
    // 空格键临时切换到手型工具
    if (e.code === 'Space' && !e.repeat && currentTool !== 'hand') {
      e.preventDefault();
      document.body.dataset.previousTool = currentTool;
      setCurrentTool('hand');
    }
  };

  const handleKeyUp = (e) => {
    // 释放空格键恢复之前的工具
    if (e.code === 'Space' && currentTool === 'hand') {
      const previousTool = document.body.dataset.previousTool || 'select';
      setCurrentTool(previousTool);
      delete document.body.dataset.previousTool;
    }
  };

  // 阻止默认的缩放行为
  useEffect(() => {
    const preventDefaultZoom = (e) => {
      if (e.ctrlKey) {
        e.preventDefault();
      }
    };
    
    window.addEventListener('wheel', preventDefaultZoom, { passive: false });
    return () => window.removeEventListener('wheel', preventDefaultZoom);
  }, []);

  // 添加键盘事件监听
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [currentTool, selectedElements]);

  return (
    <CanvasContainer
      ref={containerRef}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      isDraggable={isDraggable}
      isDragging={isDragging}
    >
      <CanvasWorkspace
        ref={workspaceRef}
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
        }}
      >
        {elements.map((element) => {
          const isSelected = selectedElements.includes(element.id);
          
          switch (element.type) {
            case 'shape':
              return (
                <ShapeElement
                  key={element.id}
                  element={element}
                  isSelected={isSelected}
                />
              );
            case 'image':
              return (
                <ImageElement
                  key={element.id}
                  element={element}
                  isSelected={isSelected}
                />
              );
            case 'text':
              return (
                <TextElement
                  key={element.id}
                  element={element}
                  isSelected={isSelected}
                />
              );
            default:
              return null;
          }
        })}
        
        {selectionRect && (
          <SelectionRect
            style={{
              left: `${Math.min(selectionRect.startX, selectionRect.startX + selectionRect.width)}px`,
              top: `${Math.min(selectionRect.startY, selectionRect.startY + selectionRect.height)}px`,
              width: `${Math.abs(selectionRect.width)}px`,
              height: `${Math.abs(selectionRect.height)}px`
            }}
          />
        )}
      </CanvasWorkspace>
      
      {/* 浮动工具栏 */}
      {selectedElements.length > 0 && activeToolbar && (
        <FloatingToolbar type={activeToolbar} />
      )}

      {/* 缩放控制 */}
      <ZoomControls>
        <ZoomButton onClick={handleZoomOut} title="缩小">-</ZoomButton>
        <ZoomText>{Math.round(scale * 100)}%</ZoomText>
        <ZoomButton onClick={handleZoomIn} title="放大">+</ZoomButton>
        <ZoomButton onClick={handleResetZoom} title="重置视图">↺</ZoomButton>
      </ZoomControls>
    </CanvasContainer>
  );
};

export default Canvas;