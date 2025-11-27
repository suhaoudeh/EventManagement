// import React, { useState } from 'react';
// import api from '../api';
// import { useNavigate } from "react-router-dom";

// function Login({ setUser }) {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState('');
//   const navigate = useNavigate();

//   const handleSubmit = async (e) => {
//   e.preventDefault();
//   setError('');
//   try {
//     const res = await api.post('/auth/login', { email, password });
    
//     // Save user in state
//     setUser(res.data);

//     // Save user in localStorage
//     localStorage.setItem('user', JSON.stringify(res.data));

//     // Redirect to home page
//     navigate('/home');
//   } catch (err) {
//     setError(err.response?.data?.error || 'Login failed');
//   }
// };


//   return (
//     <div>
//       <h2>Login</h2>
//       <form onSubmit={handleSubmit}>
//         <input type="email" placeholder="Email"
//           value={email} onChange={(e) => setEmail(e.target.value)}
//           required />
        
//         <input type="password" placeholder="Password"
//           value={password} onChange={(e) => setPassword(e.target.value)}
//           required />

//         <button type="submit">Login</button>
//       </form>

//       {error && <p style={{color:"red"}}>{error}</p>}
//     </div>
//   );
// }

// export default Login;

import React, { useState } from 'react';
import api from '../api';
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await api.post('/auth/login', { email, password });

      localStorage.setItem('user', JSON.stringify(res.data));
      localStorage.setItem('token', res.data.token);

      //alert("Login successful!");
      navigate('/home');

    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input type="email" placeholder="Email" value={email} 
               onChange={(e) => setEmail(e.target.value)} required />

        <input type="password" placeholder="Password" value={password} 
               onChange={(e) => setPassword(e.target.value)} required />

        <button type="submit">Login</button>
      </form>

      {error && <p style={{color:"red"}}>{error}</p>}
    </div>
  );
}

export default Login;
