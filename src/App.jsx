import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import Canvas from './components/Canvas';
import Toolbar from './components/Toolbar';
import FloatingToolbar from './components/FloatingToolbar';
import { CanvasProvider } from './context/CanvasContext';

const AppContainer = styled.div`
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
`;

const App = () => {
  return (
    <CanvasProvider>
      <AppContainer>
        <Toolbar />
        <FloatingToolbar />
        <Canvas />
      </AppContainer>
    </CanvasProvider>


  );
};

export default App;