import React from 'react';
import './App.css';
import WrappedDynamicFieldSet from './3/wrappedDynamicFieldSet';

function App() {
  return (
    <div className="App">
      <WrappedDynamicFieldSet keys={[0]} />
    </div>
  );
}

export default App;
