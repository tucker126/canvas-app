import React, { useContext, useRef, useState, useEffect } from 'react';
import styled from 'styled-components';
import { CanvasContext } from '../../context/CanvasContext';

const ElementContainer = styled.div`
  position: absolute;
  cursor: move;
  user-select: none;
  transform-origin: center center;
  will-change: transform; 
`;

const TextArea = styled.div`
  width: 100%;
  height: 100%;
  outline: none;
  overflow: auto;
  padding: 5px;
  box-sizing: border-box;
`;

const ResizeHandle = styled.div`
  position: absolute;
  width: 8px;
  height: 8px;
  background-color: white;
  border: 1px solid #0078d7;
  z-index: 1;
`;

const TopLeftHandle = styled(ResizeHandle)`
  top: -4px;
  left: -4px;
  cursor: nwse-resize;
`;

const TopRightHandle = styled(ResizeHandle)`
  top: -4px;
  right: -4px;
  cursor: nesw-resize;
`;

const BottomLeftHandle = styled(ResizeHandle)`
  bottom: -4px;
  left: -4px;
  cursor: nesw-resize;
`;

const BottomRightHandle = styled(ResizeHandle)`
  bottom: -4px;
  right: -4px;
  cursor: nwse-resize;
`;

const TextElement = ({ element, isSelected }) => {
  const { selectElement, updateElement } = useContext(CanvasContext);
  const elementRef = useRef(null);
  const textRef = useRef(null);
  
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [textContent, setTextContent] = useState(element.content);
  // 保存当前元素位置的引用，避免闭包问题
  const positionRef = useRef({ x: element.x, y: element.y });


  // 当元素位置变化时更新引用
  useEffect(() => {
    positionRef.current = { x: element.x, y: element.y };
  }, [element.x, element.y]);


  

  // 当element.content变化时更新本地状态
  useEffect(() => {
    setTextContent(element.content);
  }, [element.content]);
  
  const handleMouseDown = (e) => {
    if (isEditing) return;
    
    e.stopPropagation();
    
    if (!isSelected) {
      selectElement(element.id, e.shiftKey);
    }
    
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };
  
  const handleResizeStart = (handle, e) => {
    e.stopPropagation();
    
    setIsResizing(true);
    setResizeHandle(handle);
    setDragStart({ x: e.clientX, y: e.clientY });
  };
  
  const handleMouseMove = (e) => {
    if (isDragging && !isResizing) {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      
      updateElement(element.id, {
        x: element.x + dx,
        y: element.y + dy
      });
      
      setDragStart({ x: e.clientX, y: e.clientY });
    } else if (isResizing) {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      
      let newWidth = element.width;
      let newHeight = element.height;
      let newX = element.x;
      let newY = element.y;
      
      switch (resizeHandle) {
        case 'topLeft':
          newWidth = element.width - dx;
          newHeight = element.height - dy;
          newX = element.x + dx;
          newY = element.y + dy;
          break;
        case 'topRight':
          newWidth = element.width + dx;
          newHeight = element.height - dy;
          newY = element.y + dy;
          break;
        case 'bottomLeft':
          newWidth = element.width - dx;
          newHeight = element.height + dy;
          newX = element.x + dx;
          break;
        case 'bottomRight':
          newWidth = element.width + dx;
          newHeight = element.height + dy;
          break;
        default:
          break;
      }
      
      // 限制最小尺寸
      newWidth = Math.max(50, newWidth);
      newHeight = Math.max(20, newHeight);
      
      updateElement(element.id, {
        x: newX,
        y: newY,
        width: newWidth,
        height: newHeight
      });
      
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };
  
  const handleDoubleClick = (e) => {
    e.stopPropagation();
    setIsEditing(true);
  };
  
  // 保存文本内容到元素
  const saveTextContent = () => {
    if (textRef.current) {
      const newContent = textRef.current.innerText || textRef.current.textContent;
      if (newContent !== element.content) {
        updateElement(element.id, {
          content: newContent
        });
      }
    }
  };
  
  const handleTextChange = (e) => {
    // 不再设置状态，直接让DOM元素显示内容
    // 这样可以保持光标位置
  };
  
  const handleBlur = () => {
    setIsEditing(false);
    saveTextContent();
  };
  
  const handleKeyDown = (e) => {
    // 按下Enter键且不是按住Shift时完成编辑
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      textRef.current.blur();
    }
  };
  
  // 添加点击文档其他地方自动保存的功能
  useEffect(() => {
    if (isEditing) {
      const handleClickOutside = (e) => {
        if (textRef.current && !textRef.current.contains(e.target)) {
          setIsEditing(false);
          saveTextContent();
        }
      };
      
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isEditing]);
  
  useEffect(() => {
    if (isEditing && textRef.current) {
      textRef.current.focus();
      
      // 将光标放在末尾
      const range = document.createRange();
      const selection = window.getSelection();
      range.selectNodeContents(textRef.current);
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }, [isEditing]);
  
  useEffect(() => {
    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing]);

  return (
    <ElementContainer
      ref={elementRef}
      style={{
        left: `${element.x}px`,
        top: `${element.y}px`,
        width: `${element.width}px`,
        height: `${element.height}px`,
        outline: isSelected ? '2px solid #0078d7' : 'none',
      }}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
    >
      <TextArea
        ref={textRef}
        contentEditable={isEditing}
        suppressContentEditableWarning={true}
        onInput={handleTextChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        style={{
          fontFamily: element.fontFamily,
          fontSize: `${element.fontSize}px`,
          color: element.color,
          backgroundColor: element.backgroundColor,
          fontWeight: element.bold ? 'bold' : 'normal',
          fontStyle: element.italic ? 'italic' : 'normal',
          textDecoration: `${element.underline ? 'underline' : ''} ${element.strikethrough ? 'line-through' : ''}`.trim(),
          cursor: isEditing ? 'text' : 'move',
          userSelect: isEditing ? 'text' : 'none',
        }}
      >
        {element.content}
      </TextArea>
      
      {isSelected && !isEditing && (
        <>
          <TopLeftHandle
            onMouseDown={(e) => handleResizeStart('topLeft', e)}
          />
          <TopRightHandle
            onMouseDown={(e) => handleResizeStart('topRight', e)}
          />
          <BottomLeftHandle
            onMouseDown={(e) => handleResizeStart('bottomLeft', e)}
          />
          <BottomRightHandle
            onMouseDown={(e) => handleResizeStart('bottomRight', e)}
          />
        </>
      )}
    </ElementContainer>
  );
};

export default TextElement;