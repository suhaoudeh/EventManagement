import React, { useState } from 'react';
import Login from './components/Login';
import Register from './components/Register';
import Home from './components/Home';

function App() {
  const [user, setUser] = useState(null); // store logged-in user

  return (
    <div className="App">
      {!user ? (
        <>
          <h1>Event Management App</h1>
          <Login setUser={setUser} />
          <Register setUser={setUser} />
        </>
      ) : (
        <Home user={user} />
      )}
    </div>
  );
}

export default App;
