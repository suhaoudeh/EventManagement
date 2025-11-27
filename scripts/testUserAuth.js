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
        const result = {
          statusCode: res.statusCode,
          headers: res.headers,
          body: raw || null
        };
        try { result.parsed = raw ? JSON.parse(raw) : null; } catch (e) { result.parsed = null; }
        resolve(result);
      });
    });

    req.on('error', (e) => reject(e));
    req.write(data);
    req.end();
  });
}

(async () => {
  const ts = Date.now();
  const email = `node_user_${ts}@example.com`;
  const username = `nodeuser${ts}`;
  const password = 'Password123';

  console.log('Test user:', username, email);

  try {
    console.log('\nAttempting login...');
    const loginRes = await post('/api/users/login', JSON.stringify({ email, password }));
    console.log('Login status:', loginRes.statusCode);
    console.log('Login headers:', loginRes.headers);
    console.log('Login body:', loginRes.body);

    if (loginRes.statusCode === 200 && loginRes.parsed && loginRes.parsed.token) {
      console.log('Login succeeded. Token length:', loginRes.parsed.token.length);
      return;
    }

    console.log('\nLogin failed — attempting register...');
    const regRes = await post('/api/users/register', JSON.stringify({ username, email, password }));
    console.log('Register status:', regRes.statusCode);
    console.log('Register headers:', regRes.headers);
    console.log('Register body:', regRes.body);

    console.log('\nAttempting login after register...');
    const loginRes2 = await post('/api/users/login', JSON.stringify({ email, password }));
    console.log('Login-after-register status:', loginRes2.statusCode);
    console.log('Login-after-register headers:', loginRes2.headers);
    console.log('Login-after-register body:', loginRes2.body);

  } catch (err) {
    console.error('Error during test:', err);
  }
})();
