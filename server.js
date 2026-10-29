import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const tsxCli = path.resolve(__dirname, 'node_modules', 'tsx', 'dist', 'cli.mjs');
const serverTs = path.resolve(__dirname, 'server.ts');

const child = spawn(process.execPath, [tsxCli, serverTs, ...process.argv.slice(2)], {
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: process.env.NODE_ENV || 'production',
  },
});

child.on('exit', (code) => {
  process.exit(code ?? 0);
});

child.on('error', (err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
