import React, { useContext, useRef, useState } from 'react';
import styled from 'styled-components';
import { CanvasContext } from '../../context/CanvasContext';

const ElementContainer = styled.div`
  position: absolute;
  cursor: move;
  user-select: none;
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

// 绘制不同类型的图形
const renderShape = (type, width, height, backgroundColor, borderWidth, borderColor) => {
  const styles = {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor,
    border: `${borderWidth}px solid ${borderColor}`,
  };
  
  switch (type) {
    case 'rectangle':
      return <div style={styles}></div>;
      
    case 'roundedRectangle':
      return <div style={{...styles, borderRadius: '10px'}}></div>;
      
    case 'circle':
      return <div style={{...styles, borderRadius: '50%'}}></div>;
      
    case 'ellipse':
      return <div style={{...styles, borderRadius: '50%'}}></div>;
      
    case 'triangle':
      return (
        <div style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          overflow: 'hidden',
        }}>
          <div style={{
            width: 0,
            height: 0,
            borderLeft: `${width / 2}px solid transparent`,
            borderRight: `${width / 2}px solid transparent`,
            borderBottom: `${height}px solid ${backgroundColor}`,
            position: 'absolute',
            top: 0,
            left: 0,
          }}></div>
        </div>
      );
      
    case 'diamond':
      return (
        <div style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          transform: 'rotate(45deg)',
          backgroundColor,
          border: `${borderWidth}px solid ${borderColor}`,
        }}></div>
      );
      
    case 'pentagon':
      return (
        <div style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)',
          backgroundColor,
          border: `${borderWidth}px solid ${borderColor}`,
        }}></div>
      );
      
    case 'hexagon':
      return (
        <div style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
          backgroundColor,
          border: `${borderWidth}px solid ${borderColor}`,
        }}></div>
      );
      
    case 'star':
      return (
        <div style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
          backgroundColor,
          border: `${borderWidth}px solid ${borderColor}`,
        }}></div>
      );
      
    case 'arrow':
      return (
        <div style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          clipPath: 'polygon(0% 30%, 70% 30%, 70% 0%, 100% 50%, 70% 100%, 70% 70%, 0% 70%)',
          backgroundColor,
          border: `${borderWidth}px solid ${borderColor}`,
        }}></div>
      );
      
    default:
      return <div style={styles}></div>;
  }
};

const ShapeElement = ({ element, isSelected }) => {
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
      {renderShape(
        element.shapeType,
        element.width,
        element.height,
        element.backgroundColor,
        element.borderWidth,
        element.borderColor
      )}
      
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

export default ShapeElement;