require('dotenv').config();
const mysql = require('mysql2/promise');
const inquirer = require('inquirer');

async function main() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
  });

  async function listUsers() {
    const [users] = await connection.execute('SELECT * FROM users');
    for (const user of users) {
      console.log(`User: ${user.name} | Email: ${user.email} | Phone: ${user.phone_number}`);
      const [accounts] = await connection.execute('SELECT * FROM accounts WHERE user_id = ?', [user.id]);
      accounts.forEach(acc => {
        console.log(`  Account: ${acc.account_id} | Currency: ${acc.currency} | Balance: ${acc.balance} | QR: ${acc.userqrcodedata}`);
      });
    }
  }

  async function createUser() {
    const userAnswers = await inquirer.prompt([
      { name: 'name', message: 'Name:' },
      { name: 'email', message: 'Email:' },
      { name: 'password', message: 'Password:' },
      { name: 'national_id_card_url', message: 'National ID Card URL:' },
      { name: 'birth_date', message: 'Birth Date (YYYY-MM-DD):' },
      { name: 'country', message: 'Country:' },
      { name: 'city', message: 'City:' },
      { name: 'phone_number', message: 'Phone Number:' },
    ]);
    const [userResult] = await connection.execute(
      'INSERT INTO users (name, email, password, national_id_card_url, birth_date, country, city, phone_number) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [userAnswers.name, userAnswers.email, userAnswers.password, userAnswers.national_id_card_url, userAnswers.birth_date, userAnswers.country, userAnswers.city, userAnswers.phone_number]
    );
    const userId = userResult.insertId;
    function randomDigits(length) {
      let result = '';
      for (let i = 0; i < length; i++) {
        result += Math.floor(Math.random() * 10);
      }
      return result;
    }
    function randomQR() {
      return 'RNB:' + randomDigits(9);
    }
    for (const currency of ['USD', 'KHR']) {
      const accAnswers = await inquirer.prompt([
        { name: 'balance', message: `Initial balance for ${currency}:`, type: 'number' },
        { name: 'account_pin', message: `Account PIN for ${currency}:` },
      ]);
      const account_id = randomDigits(8);
      const userqrcodedata = randomQR();
      await connection.execute(
        'INSERT INTO accounts (user_id, account_id, currency, balance, account_pin, userqrcodedata) VALUES (?, ?, ?, ?, ?, ?)',
        [userId, account_id, currency, accAnswers.balance, accAnswers.account_pin, userqrcodedata]
      );
      console.log(`Created ${currency} account: ID=${account_id}, QR=${userqrcodedata}`);
    }
    console.log('User and accounts created!');
  }

  const { action } = await inquirer.prompt([
    {
      name: 'action',
      type: 'list',
      message: 'What do you want to do?',
      choices: [
        { name: 'List users', value: 'list' },
        { name: 'Create new user', value: 'create' },
        { name: 'Edit user', value: 'edit' },
        { name: 'Exit', value: 'exit' },
      ],
    },
  ]);

  if (action === 'list') await listUsers();
  else if (action === 'create') await createUser();
  else if (action === 'edit') await editUser();
  else process.exit(0);

  await connection.end();
}

main();
