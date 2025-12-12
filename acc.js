require('dotenv').config();
const mysql = require('mysql2/promise');
const inquirer = require('inquirer');
const qrcode = require('qrcode-terminal'); // Library to show QR image in terminal

async function main() {
  // 1. Database Connection
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
  });

  console.log("--- BANK ACCOUNT SYSTEM ---\n");

  // 2. Login Logic
  const credentials = await inquirer.prompt([
    { 
      name: 'identifier', 
      message: 'Enter Email or Phone Number:' 
    },
    { 
      name: 'password', 
      message: 'Enter Password:', 
      type: 'password' 
    }
  ]);

  // Check user credentials
  const [users] = await connection.execute(
    'SELECT * FROM users WHERE (email = ? OR phone_number = ?) AND password = ?',
    [credentials.identifier, credentials.identifier, credentials.password]
  );

  if (users.length === 0) {
    console.log('\n❌ Login Unsuccessful: Wrong credentials or user not found.');
    await connection.end();
    return;
  }

  const currentUser = users[0];
  console.log(`\n✅ Login Success! Welcome, ${currentUser.name}.`);

  // Main Menu Loop
  let exit = false;
  while (!exit) {
    // Refresh account data every time we return to menu
    const [accounts] = await connection.execute('SELECT * FROM accounts WHERE user_id = ?', [currentUser.id]);
    
    // Display Account Info Dashboard
    console.log('\n--- YOUR ACCOUNTS ---');
    accounts.forEach(acc => {
      console.log(`[${acc.currency}] Bal: ${acc.balance} | ID: ${acc.account_id}`);
    });
    console.log('---------------------');

    const { action } = await inquirer.prompt([
      {
        name: 'action',
        type: 'list',
        message: 'Select an option:',
        choices: [
          { name: 'Transfer Money (via QR ID)', value: 'transfer' },
          { name: 'Show/Create QR Code', value: 'qr' },
          { name: 'Exit', value: 'exit' },
        ],
      },
    ]);

    if (action === 'transfer') {
      await handleTransfer(connection, accounts);
    } else if (action === 'qr') {
      await handleShowQR(accounts);
    } else {
      exit = true;
      console.log('Goodbye!');
    }
  }

  await connection.end();
}

// --- Helper Function: Handle Transfer ---
async function handleTransfer(connection, myAccounts) {
  if (myAccounts.length === 0) {
    console.log("You have no accounts to transfer from.");
    return;
  }

  // 1. Select Source Account
  const { sourceAccountId } = await inquirer.prompt([
    {
      name: 'sourceAccountId',
      type: 'list',
      message: 'Select account to pay FROM:',
      choices: myAccounts.map(acc => ({
        name: `${acc.currency} (Balance: ${acc.balance})`,
        value: acc.account_id
      }))
    }
  ]);

  const sourceAccount = myAccounts.find(acc => acc.account_id === sourceAccountId);

  // 2. Input Destination QR (Simulating scanning)
  const { targetQR } = await inquirer.prompt([
    { name: 'targetQR', message: 'Enter Receiver QR ID (e.g., RNB:12345...):' }
  ]);

  // 3. Find Destination Account based on QR
  const [destAccounts] = await connection.execute(
    'SELECT * FROM accounts WHERE userqrcodedata = ?', 
    [targetQR]
  );

  if (destAccounts.length === 0) {
    console.log('❌ Error: Invalid QR Code. Account not found.');
    return;
  }

  const destAccount = destAccounts[0];

  // Prevent sending to yourself (optional check)
  if (destAccount.account_id === sourceAccount.account_id) {
    console.log("❌ Error: You cannot transfer to the same account.");
    return;
  }

  // Check Currency Match
  if (destAccount.currency !== sourceAccount.currency) {
    console.log(`❌ Error: Currency mismatch. You are sending ${sourceAccount.currency} but receiver uses ${destAccount.currency}.`);
    return;
  }

  console.log(`\nFound Receiver! Currency: ${destAccount.currency}`);
  
  // 4. Input Amount
  const { amount } = await inquirer.prompt([
    { name: 'amount', message: 'Enter Amount to Transfer:', type: 'number' }
  ]);

  if (amount <= 0) {
    console.log("❌ Error: Invalid amount.");
    return;
  }

  if (sourceAccount.balance < amount) {
    console.log(`❌ Error: Insufficient balance. You have ${sourceAccount.balance}.`);
    return;
  }

  // 5. Execute Transfer (Update Database)
  try {
    // Deduct from sender
    await connection.execute(
      'UPDATE accounts SET balance = balance - ? WHERE account_id = ?',
      [amount, sourceAccount.account_id]
    );

    // Add to receiver
    await connection.execute(
      'UPDATE accounts SET balance = balance + ? WHERE account_id = ?',
      [amount, destAccount.account_id]
    );

    console.log(`\n✅ Success! Transferred ${amount} ${sourceAccount.currency} to QR: ${targetQR}`);
  } catch (error) {
    console.log('❌ Transaction failed:', error);
  }
}

// --- Helper Function: Generate Visual QR ---
async function handleShowQR(myAccounts) {
  const { accountId } = await inquirer.prompt([
    {
      name: 'accountId',
      type: 'list',
      message: 'Select account to view QR Code:',
      choices: myAccounts.map(acc => ({
        name: `${acc.currency} Account`,
        value: acc.account_id
      }))
    }
  ]);

  const selectedAcc = myAccounts.find(acc => acc.account_id === accountId);
  
  console.log(`\nGenerating QR for: ${selectedAcc.userqrcodedata}`);
  console.log(`Account ID: ${selectedAcc.account_id} | Currency: ${selectedAcc.currency}`);
  console.log('Scan this image below:\n');

  // Generate the visual QR code in the terminal
  qrcode.generate(selectedAcc.userqrcodedata, { small: true });
  
  // Pause so user can see it
  await inquirer.prompt([{ name: 'pause', message: 'Press Enter to go back...' }]);
}

main();