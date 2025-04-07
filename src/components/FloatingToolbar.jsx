import React, { useContext, useEffect, useState } from 'react';
import styled from 'styled-components';
import { CanvasContext } from '../context/CanvasContext';

const ToolbarContainer = styled.div`
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 8px;
  display: flex;
  gap: 8px;
  z-index: 1000;
`;

const ToolbarButton = styled.button`
  padding: 6px;
  background-color: ${props => props.active ? '#e9ecef' : 'transparent'};
  border: 1px solid #ced4da;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background-color: #f1f3f5;
  }
`;

const ColorPicker = styled.input`
  width: 30px;
  height: 30px;
  padding: 0;
  border: 1px solid #ced4da;
  border-radius: 4px;
  cursor: pointer;
`;

const Select = styled.select`
  padding: 6px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  background-color: white;
`;

const Input = styled.input`
  padding: 6px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  width: 50px;
`;

const FloatingToolbar = ({ type }) => {
  const { selectedElements, elements, updateElement } = useContext(CanvasContext);
  const [selectedElement, setSelectedElement] = useState(null);
  
  useEffect(() => {
    if (selectedElements.length === 1) {
      const element = elements.find(el => el.id === selectedElements[0]);
      if (element) {
        setSelectedElement(element);
      }
    } else {
      setSelectedElement(null);
    }
  }, [selectedElements, elements]);
  
  if (!selectedElement) return null;
  
  const handleUpdate = (properties) => {
    updateElement(selectedElement.id, properties);
  };
  
// 文本工具栏部分
if (type === 'text') {
    return (
      <ToolbarContainer>
        <Select 
          value={selectedElement.fontFamily}
          onChange={(e) => handleUpdate({ fontFamily: e.target.value })}
        >
          <option value="Arial">Arial</option>
          <option value="Times New Roman">Times New Roman</option>
          <option value="Courier New">Courier New</option>
          <option value="Georgia">Georgia</option>
          <option value="Verdana">Verdana</option>
        </Select>
        
        <Input 
          type="number"
          value={selectedElement.fontSize}
          onChange={(e) => handleUpdate({ fontSize: parseInt(e.target.value) })}
          min="8"
          max="72"
        />
        
        <ColorPicker 
          type="color"
          value={selectedElement.color}
          onChange={(e) => handleUpdate({ color: e.target.value })}
          title="文字颜色"
        />
        
        <ColorPicker 
          type="color"
          value={selectedElement.backgroundColor || '#ffffff'}
          onChange={(e) => handleUpdate({ backgroundColor: e.target.value === '#ffffff' ? 'transparent' : e.target.value })}
          title="背景颜色"
        />
        
        {/* 简化的文本格式按钮 */}
        <ToolbarButton
          active={selectedElement.bold}
          onClick={() => handleUpdate({ bold: !selectedElement.bold })}
          title="加粗"
        >
          B
        </ToolbarButton>
        
        <ToolbarButton
          active={selectedElement.italic}
          onClick={() => handleUpdate({ italic: !selectedElement.italic })}
          title="斜体"
        >
          I
        </ToolbarButton>
        
        <ToolbarButton
          active={selectedElement.underline}
          onClick={() => handleUpdate({ underline: !selectedElement.underline })}
          title="下划线"
        >
          U
        </ToolbarButton>
        
        <ToolbarButton
          active={selectedElement.strikethrough}
          onClick={() => handleUpdate({ strikethrough: !selectedElement.strikethrough })}
          title="删除线"
        >
          S
        </ToolbarButton>
      </ToolbarContainer>
    );
  }
  
  if (type === 'shape') {
    return (
      <ToolbarContainer>
        <ColorPicker 
          type="color"
          value={selectedElement.backgroundColor}
          onChange={(e) => handleUpdate({ backgroundColor: e.target.value })}
          title="背景颜色"
        />
        
        <Input 
          type="number"
          value={selectedElement.borderWidth}
          onChange={(e) => handleUpdate({ borderWidth: parseInt(e.target.value) })}
          min="0"
          max="10"
          title="边框宽度"
        />
        
        <ColorPicker 
          type="color"
          value={selectedElement.borderColor}
          onChange={(e) => handleUpdate({ borderColor: e.target.value })}
          title="边框颜色"
        />
      </ToolbarContainer>
    );
  }
  
  if (type === 'image') {
    return (
      <ToolbarContainer>
        <Input 
          type="number"
          value={selectedElement.width}
          onChange={(e) => handleUpdate({ width: parseInt(e.target.value) })}
          min="10"
          title="宽度"
        />
        
        <Input 
          type="number"
          value={selectedElement.height}
          onChange={(e) => handleUpdate({ height: parseInt(e.target.value) })}
          min="10"
          title="高度"
        />
        
        <ToolbarButton
          onClick={() => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/png, image/jpeg';
            
            input.onchange = (e) => {
              const file = e.target.files[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                  handleUpdate({ src: event.target.result });
                };
                reader.readAsDataURL(file);
              }
            };
            
            input.click();
          }}
          title="替换图片"
        >
          🔄
        </ToolbarButton>
      </ToolbarContainer>
    );
  }
  
  return null;
};

export default FloatingToolbar;