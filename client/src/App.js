import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import CreateEvent from './pages/CreateEvent.jsx';
import Inviters from './pages/Inviters.jsx';
import InvitersList from './pages/InvitersList.jsx';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        {/* alias for backward compatibility with links that navigate to /home */}
        <Route path="/home" element={<Home />} />
        
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/create" element={<CreateEvent />} />
        <Route path="/inviters" element={<Inviters />} />
        <Route path="/my-inviters" element={<InvitersList />} />
      </Routes>
    </Router>
  );
}

export default App;
