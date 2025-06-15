const fetch = require('node-fetch');

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUxLCJpYXQiOjE3NDk3MzI1NDUsImV4cCI6MTc0OTgxODk0NX0.NaJdottjVzZVNQisFITSOjJs4S5YqCjqDC1-0UVrnv4';

async function testPin() {
  try {
    // 1. Check if user has PIN
    console.log('1. Checking if user has PIN...');
    const checkResponse = await fetch('http://uas.sekai.id:3000/api/pin/check', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const checkData = await checkResponse.json();
    console.log('Check PIN result:', checkData);

    // 2. Try to update PIN
    console.log('\n2. Trying to update PIN...');
    const updateResponse = await fetch('http://uas.sekai.id:3000/api/pin/update', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        oldPin: '111222',
        newPin: '123456'
      })
    });
    const updateData = await updateResponse.json();
    console.log('Update PIN result:', updateData);

  } catch (error) {
    console.error('Error:', error);
  }
}

testPin();
