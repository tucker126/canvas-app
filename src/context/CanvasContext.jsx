import React, { createContext, useState, useRef } from 'react';

export const CanvasContext = createContext();

export const CanvasProvider = ({ children }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [selectedElements, setSelectedElements] = useState([]);
  const [elements, setElements] = useState([]);
  const [activeToolbar, setActiveToolbar] = useState(null);
  const [currentTool, setCurrentTool] = useState('select');

  const addElement = (element) => {
    setElements([...elements, { ...element, id: Date.now().toString() }]);
  };

  const updateElement = (id, properties) => {
    setElements(elements.map(el => el.id === id ? { ...el, ...properties } : el));
  };

  const deleteSelectedElements = () => {
    if (selectedElements.length > 0) {
      setElements(elements.filter(el => !selectedElements.includes(el.id)));
      setSelectedElements([]);
      setActiveToolbar(null);
    }
  };

  const selectElement = (id, isMultiSelect = false) => {
    if (isMultiSelect) {
      setSelectedElements(prev => 
        prev.includes(id) 
          ? prev.filter(elId => elId !== id) 
          : [...prev, id]
      );
    } else {
      setSelectedElements([id]);
    }
    
    // 设置活动工具栏类型
    const element = elements.find(el => el.id === id);
    if (element) {
      setActiveToolbar(element.type);
    }
  };

  const clearSelection = () => {
    setSelectedElements([]);
    setActiveToolbar(null);
  };

  return (
    <CanvasContext.Provider
      value={{
        scale,
        setScale,
        position,
        setPosition,
        elements,
        setElements,
        addElement,
        updateElement,
        selectedElements,
        setSelectedElements,
        selectElement,
        clearSelection,
        deleteSelectedElements,
        activeToolbar,
        setActiveToolbar,
        currentTool,
        setCurrentTool
      }}
    >
      {children}
    </CanvasContext.Provider>
  );
};