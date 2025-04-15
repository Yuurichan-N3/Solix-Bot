import axios from 'axios';
import { promises as fs } from 'fs';
import colors from 'colors';
import cliProgress from 'cli-progress';
import Table from 'cli-table3';
import gradient from 'gradient-string';

// Configure gradient (blue to green)
const customGradient = gradient(['#0000FF', '#00FF00']);

// File untuk credentials
const DATA_FILE = 'data.txt';

// URLs
const loginUrl = 'https://api.solixdepin.net/api/auth/login-password';
const taskListUrl = 'https://api.solixdepin.net/api/task/get-user-task';
const claimTaskUrl = 'https://api.solixdepin.net/api/task/claim-task';

// Headers
const headersTemplate = {
  accept: 'application/json, text/plain, */*',
  'accept-encoding': 'gzip, deflate, br, zstd',
  'accept-language': 'id-ID,id;q=0.9,ja-ID;q=0.8,ja;q=0.7,en-ID;q=0.6,en;q=0.5,en-US;q=0.4',
  connection: 'keep-alive',
  'content-type': 'application/json',
  host: 'api.solixdepin.net',
  origin: 'https://dashboard.solixdepin.net',
  referer: 'https://dashboard.solixdepin.net/',
  'sec-ch-ua': '"Google Chrome";v="135", "Not-A.Brand";v="8", "Chromium";v="135"',
  'sec-ch-ua-mobile': '?0',
  'sec-ch-ua-platform': '"Windows"',
  'sec-fetch-dest': 'empty',
  'sec-fetch-mode': 'cors',
  'sec-fetch-site': 'same-site',
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36'
};

// Buffer untuk menyimpan log (hanya untuk pesan non-claimTask)
const logBuffer = [];

function addLog(message, color = 'white') {
  const timestamp = new Date().toLocaleTimeString();
  logBuffer.push({ timestamp, message: colors[color](message) });
}

function displayLogs() {
  const logTable = new Table({
    head: [
      colors.cyan('Time'),
      colors.magenta('Message')
    ],
    colWidths: [15, 60]
  });
  logBuffer.forEach(log => {
    logTable.push([log.timestamp, log.message]);
  });
  console.log('\n' + customGradient('Log Messages:'));
  console.log(logTable.toString());
}

async function readCredentials() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    const credentials = data
      .split('\n')
      .map(line => line.trim())
      .filter(line => line)
      .map(line => {
        const [email, password] = line.split('|');
        if (!email || !password) {
          addLog(`Format salah di baris: ${line}, minimal: email|password`, 'red');
          return null;
        }
        return { email, password };
      })
      .filter(cred => cred);

    if (!credentials.length) {
      addLog('File data.txt kosong atau tidak ada data valid', 'yellow');
      return [];
    }
    return credentials;
  } catch (err) {
    if (err.code === 'ENOENT') {
      addLog('File data.txt tidak ditemukan', 'red');
    } else {
      addLog(`Error membaca data.txt: ${err.message}`, 'red');
    }
    return [];
  }
}

async function getNewToken(email, password, headers, retries = 3, delay = 5000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const payload = { email, password };
      const headersNoAuth = { ...headers };
      delete headersNoAuth.authorization;

      const response = await axios.post(loginUrl, payload, { headers: headersNoAuth });
      if (response.status === 201) {
        const token = response.data?.data?.accessToken;
        if (token) {
          headers.authorization = `Bearer ${token}`;
          addLog(`[${email}] Berhasil login`, 'green');
          return true;
        } else {
          addLog(`[${email}] accessToken tidak ditemukan di respons login`, 'red');
        }
      } else {
        addLog(`[${email}] Gagal login: ${response.status}`, 'red');
        return false;
      }
    } catch (err) {
      addLog(`[${email}] Error saat login (percobaan ${attempt}/${retries}): ${err.message}`, 'red');
      if (attempt < retries) {
        addLog(`[${email}] Menunggu ${delay / 1000} detik sebelum coba lagi...`, 'yellow');
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  addLog(`[${email}] Gagal login setelah beberapa percobaan`, 'red');
  return false;
}

async function getAllTasks(headers) {
  try {
    const response = await axios.get(taskListUrl, { headers });
    if (response.status === 200) {
      const tasks = response.data?.data || [];

      // Display all tasks in a table
      const allTasksTable = new Table({
        head: [
          colors.cyan('Task ID'),
          colors.magenta('Name'),
          colors.green('Points'),
          colors.yellow('Status')
        ],
        colWidths: [25, 25, 10, 10]
      });
      tasks.forEach(task => {
        allTasksTable.push([
          task._id || 'N/A',
          task.name || 'N/A',
          task.pointAmount || 0,
          task.status || 'N/A'
        ]);
      });
      console.log(customGradient('\nAll Tasks Received:'));
      console.log(allTasksTable.toString());

      // Ambil semua task
      const allTasks = tasks.map(task => ({
        id: task._id,
        name: task.name,
        pointAmount: task.pointAmount
      }));

      if (allTasks.length) {
        addLog(`Ditemukan ${allTasks.length} task total`, 'green');
      } else {
        addLog('Tidak ada task sama sekali', 'yellow');
      }
      return allTasks;
    } else {
      addLog(`Gagal mendapatkan task: ${response.status}`, 'red');
      return [];
    }
  } catch (err) {
    addLog(`Error mendapatkan task: ${err.message}`, 'red');
    return [];
  }
}

async function claimTask(taskId, taskName, headers) {
  try {
    const payload = { taskId };
    const response = await axios.post(claimTaskUrl, payload, { headers });
    console.log(JSON.stringify(response.data));
    return response.status === 201;
  } catch (err) {
    console.log(err.response ? JSON.stringify(err.response.data) : 'No response');
    return false;
  }
}

async function processAccount(email, password, progressBar) {
  const headers = { ...headersTemplate };

  // Coba login
  if (!(await getNewToken(email, password, headers))) {
    addLog(`[${email}] Gagal inisialisasi token. Lewati akun ini.`, 'red');
    return false;
  }

  // Simpan semua tugas yang pernah ditemukan
  let allKnownTasks = [];

  // Loop terus menerus untuk tugas dan claim
  while (true) {
    try {
      // Ambil semua task
      const newTasks = await getAllTasks(headers);
      if (newTasks.length) {
        addLog(`[${email}] Menemukan ${newTasks.length} task total...`, 'green');
        // Tambahkan tugas baru ke daftar permanen, hindari duplikat
        newTasks.forEach(newTask => {
          if (!allKnownTasks.some(task => task.id === newTask.id)) {
            allKnownTasks.push(newTask);
          }
        });
        // Coba claim tugas baru
        for (const task of newTasks) {
          await claimTask(task.id, task.name, headers);
        }
      } else {
        addLog(`[${email}] Tidak ada task sama sekali`, 'yellow');
      }

      // Tampilkan log setelah pemrosesan tugas
      displayLogs();
      logBuffer.length = 0; // Kosongkan buffer setelah ditampilkan

      // Selalu coba claim semua tugas yang pernah ditemukan
      if (allKnownTasks.length) {
        addLog(`[${email}] Mencoba claim ulang ${allKnownTasks.length} tugas yang diketahui...`, 'cyan');
        for (const task of allKnownTasks) {
          await claimTask(task.id, task.name, headers);
        }
      }

      // Tunggu 15 detik sebelum cek tugas lagi
      await new Promise(resolve => setTimeout(resolve, 15000));

    } catch (err) {
      if (err.message === 'INTERRUPTED') {
        addLog(`[${email}] Dihentikan oleh pengguna`, 'yellow');
        break;
      }
      addLog(`[${email}] Error loop: ${err.message}`, 'red');
      // Coba login ulang jika terjadi error
      if (!(await getNewToken(email, password, headers))) {
        addLog(`[${email}] Gagal login ulang. Menghentikan loop untuk akun ini.`, 'red');
        break;
      }
      await new Promise(resolve => setTimeout(resolve, 15000));
    }
  }

  return true;
}

async function main() {
  // Tampilkan header
  const header = `
╔══════════════════════════════════════════════╗
║       🌟 SOLIX BOT - Automated Earnings      ║
║   Automate your Solix Depin account tasks!   ║
║  Developed by: https://t.me/sentineldiscus   ║
╚══════════════════════════════════════════════╝
  `;
  console.log(customGradient(header));

  // Baca semua credentials
  const credentials = await readCredentials();
  if (!credentials.length) {
    addLog('Tidak ada akun untuk diproses. Menunggu untuk coba lagi...', 'yellow');
    return false;
  }

  // Display credentials in a table
  const accountsTable = new Table({
    head: [
      colors.cyan('Email'),
      colors.magenta('Password')
    ],
    colWidths: [30, 20]
  });
  credentials.forEach(({ email }) => {
    accountsTable.push([email, '******']);
  });
  console.log(customGradient('\nAccounts to Process:'));
  console.log(accountsTable.toString());

  // Initialize progress bar
  const progressBar = new cliProgress.SingleBar({
    format: 'Processing Accounts |' + colors.cyan('{bar}') + '| {percentage}% || {value}/{total} Accounts',
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    hideCursor: true,
    clearOnComplete: false,
    stopOnComplete: false
  });

  // Proses setiap akun satu per satu
  progressBar.start(credentials.length, 0);
  const results = [];

  for (const { email, password } of credentials) {
    try {
      const result = await processAccount(email, password, progressBar);
      results.push({ email, success: result });
      progressBar.increment();
      displayLogs();
      logBuffer.length = 0; // Kosongkan buffer setelah ditampilkan
    } catch (err) {
      addLog(`[${email}] Error saat pemrosesan: ${err.message}`, 'red');
      results.push({ email, success: false });
      progressBar.increment();
      displayLogs();
      logBuffer.length = 0; // Kosongkan buffer setelah ditampilkan
    }
  }

  progressBar.stop();

  // Display results
  results.forEach(({ email, success }) => {
    addLog(`[${email}] Selesai diproses: ${success ? 'Berhasil' : 'Gagal'}`, success ? 'green' : 'red');
  });
  displayLogs();

  return true;
}

async function run() {
  process.on('SIGINT', () => {
    addLog('Program dihentikan oleh pengguna', 'yellow');
    displayLogs();
    process.exit(0);
  });

  while (true) {
    try {
      if (await main()) {
        addLog('Semua akun selesai diproses. Menunggu untuk memulai ulang...', 'green');
        displayLogs();
        await new Promise(resolve => setTimeout(resolve, 60000));
      } else {
        await new Promise(resolve => setTimeout(resolve, 60000));
      }
    } catch (err) {
      addLog(`Error utama: ${err.message}`, 'red');
      displayLogs();
      await new Promise(resolve => setTimeout(resolve, 60000));
    }
  }
}

run();
