import React, { useContext, useRef, useState } from 'react';
import styled from 'styled-components';
import { CanvasContext } from '../../context/CanvasContext';

const ElementContainer = styled.div`
  position: absolute;
  cursor: move;
  user-select: none;
`;

const Image = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
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

const ImageElement = ({ element, isSelected }) => {
  const { selectElement, updateElement } = useContext(CanvasContext);
  const elementRef = useRef(null);
  
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState('');
  
  const handleMouseDown = (e) => {
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
      newWidth = Math.max(20, newWidth);
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
  
  React.useEffect(() => {
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
    >
      <Image src={element.src} alt="Element" />
      
      {isSelected && (
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

export default ImageElement;