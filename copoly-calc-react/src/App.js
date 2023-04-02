import Main from './pages/Main';
import FuncProvider from './contexts/FuncContext';
import './App.css';

function App() {
  return (
    <FuncProvider>
      	<Main />
    </FuncProvider>
  );
}

export default App;
