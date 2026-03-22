const axios = require('axios');
axios.post('http://localhost:5000/api/auth/login', { email: 'jangirparth3@gmail.com', password: 'password123' })
  .then(res => console.log('Success:', res.data))
  .catch(err => {
     console.log('--- ERROR OBJECT ---');
     console.log('Message:', err.message);
     console.log('Response Status:', err.response?.status);
     console.log('Response Data:', err.response?.data);
  });
