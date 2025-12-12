require('dotenv').config();
const mysql = require('mysql2/promise');
const inquirer = require('inquirer');
const Table = require('cli-table3');

async function main() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
  });

  // List users and their accounts with balances
  const [users] = await connection.execute('SELECT * FROM users');
  if (users.length === 0) {
    console.log('No users found.');
    await connection.end();
    return;
  }

  for (const user of users) {
    console.log(`User: ${user.name} | Email: ${user.email} | Phone: ${user.phone_number}`);
    const [accounts] = await connection.execute('SELECT * FROM accounts WHERE user_id = ?', [user.id]);
    accounts.forEach(acc => {
      console.log(`  Account: ${acc.account_id} | Currency: ${acc.currency} | Balance: ${acc.balance} | QR: ${acc.userqrcodedata}`);
    });
    console.log('');
  }

  await connection.end();
}

main();