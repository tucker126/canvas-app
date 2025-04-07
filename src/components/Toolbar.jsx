import React, { useContext } from 'react';
import styled from 'styled-components';
import { CanvasContext } from '../context/CanvasContext';

const ToolbarContainer = styled.div`
  width: 60px;
  height: 100%;
  background-color: #2c2c2c;
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 0;
  overflow-y: auto;
`;

const ToolButton = styled.button`
  width: 40px;
  height: 40px;
  margin: 5px 0;
  border-radius: 4px;
  border: none;
  background-color: ${props => props.active ? '#4d4d4d' : 'transparent'};
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background-color: #4d4d4d;
  }
`;

const Divider = styled.div`
  width: 40px;
  height: 1px;
  background-color: #4d4d4d;
  margin: 10px 0;
`;

const shapeTypes = [
  { id: 'rectangle', name: '矩形', icon: '□' },
  { id: 'roundedRectangle', name: '圆角矩形', icon: '▢' },
  { id: 'circle', name: '圆形', icon: '○' },
  { id: 'ellipse', name: '椭圆', icon: '⬭' },
  { id: 'triangle', name: '三角形', icon: '△' },
  { id: 'diamond', name: '菱形', icon: '◇' },
  { id: 'pentagon', name: '五边形', icon: '⬠' },
  { id: 'hexagon', name: '六边形', icon: '⬡' },
  { id: 'star', name: '星形', icon: '★' },
  { id: 'arrow', name: '箭头', icon: '→' }
];

const Toolbar = () => {
  const { currentTool, setCurrentTool, addElement } = useContext(CanvasContext);
  
  const handleSelectTool = (tool) => {
    setCurrentTool(tool);
  };
  
  const handleAddText = () => {
    addElement({
      type: 'text',
      x: 100,
      y: 100,
      width: 200,
      height: 50,
      content: '点击编辑文本',
      fontFamily: 'Arial',
      fontSize: 16,
      color: '#000000',
      backgroundColor: 'transparent',
      bold: false,
      italic: false,
      underline: false,
      strikethrough: false
    });
  };
  
  const handleAddShape = (shapeType) => {
    addElement({
      type: 'shape',
      shapeType,
      x: 100,
      y: 100,
      width: 100,
      height: 100,
      backgroundColor: '#4dabf7',
      borderWidth: 1,
      borderColor: '#339af0'
    });
  };
  
  const handleAddImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/png, image/jpeg';
    
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          addElement({
            type: 'image',
            x: 100,
            y: 100,
            width: 200,
            height: 200,
            src: event.target.result,
          });
        };
        reader.readAsDataURL(file);
      }
    };
    
    input.click();
  };

  return (
    <ToolbarContainer>
      <ToolButton
        title="选择工具"
        active={currentTool === 'select'}
        onClick={() => handleSelectTool('select')}
      >
        ↖
      </ToolButton>
      
      <ToolButton
        title="拖拽画布"
        active={currentTool === 'hand'}
        onClick={() => handleSelectTool('hand')}
      >
        ✋
      </ToolButton>
      
      <Divider />
      
      <ToolButton
        title="添加文本"
        active={currentTool === 'text'}
        onClick={handleAddText}
      >
        T
      </ToolButton>
      
      <Divider />
      
      {shapeTypes.map((shape) => (
        <ToolButton
          key={shape.id}
          title={shape.name}
          onClick={() => handleAddShape(shape.id)}
        >
          {shape.icon}
        </ToolButton>
      ))}
      
      <Divider />
      
      <ToolButton
        title="添加图片"
        onClick={handleAddImage}
      >
        🖼
      </ToolButton>
    </ToolbarContainer>
  );
};

export default Toolbar;