const http = require('http');

function post(path, data) {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data)
    }
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let raw = '';
      res.on('data', (chunk) => raw += chunk);
      res.on('end', () => {
        try {
          const parsed = raw ? JSON.parse(raw) : null;
          resolve({ statusCode: res.statusCode, body: parsed });
        } catch (err) {
          resolve({ statusCode: res.statusCode, body: raw });
        }
      });
    });

    req.on('error', (e) => reject(e));
    req.write(data);
    req.end();
  });
}

(async () => {
  const ts = Date.now();
  const email = `node_test_${ts}@example.com`;
  const password = 'Password123';

  console.log('Trying login for', email);
  try {
    const loginRes = await post('/api/auth/login', JSON.stringify({ email, password }));
    console.log('Login response:', loginRes.statusCode, loginRes.body);
    if (loginRes.statusCode === 200 && loginRes.body && loginRes.body.token) {
      console.log('Login successful. Token:', loginRes.body.token.slice(0, 20) + '...');
      return;
    }

    console.log('Login failed, registering user...');
    const regRes = await post('/api/auth/register', JSON.stringify({ name: 'Node Test', email, password }));
    console.log('Register response:', regRes.statusCode, regRes.body);

    const loginRes2 = await post('/api/auth/login', JSON.stringify({ email, password }));
    console.log('Login after register response:', loginRes2.statusCode, loginRes2.body);
  } catch (err) {
    console.error('Error while testing auth:', err);
  }
})();
