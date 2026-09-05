/**
 * @fileoverview Standalone Database Connection Tester script.
 *
 * Usage:
 *   pnpm --filter @autoagent/api db:test
 */

import { URL } from 'url';
import net from 'net';
import { env } from '../config/index.js';

console.log('\n🔍 [AutoAgent] Testing PostgreSQL Database Connection...');
console.log(`📌 Target URL: ${env.DATABASE_URL.replace(/:[^:@]+@/, ':****@')}`);

function testTcpSocket(connectionString: string): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const parsed = new URL(connectionString);
      const host = parsed.hostname;
      const port = parseInt(parsed.port || '5432', 10);

      console.log(`🔌 Attempting TCP connection to ${host}:${port}...`);

      const socket = net.connect(port, host, () => {
        console.log(`✅ TCP Socket successfully connected to ${host}:${port}!`);
        socket.end();
        resolve();
      });

      socket.setTimeout(8000, () => {
        socket.destroy();
        reject(new Error(`Connection to ${host}:${port} timed out after 8000ms.`));
      });

      socket.on('error', (err) => {
        reject(err);
      });
    } catch (err) {
      reject(err);
    }
  });
}

testTcpSocket(env.DATABASE_URL)
  .then(() => {
    console.log('🎉 [SUCCESS] Supabase PostgreSQL Database host is online and reachable!\n');
    process.exit(0);
  })
  .catch((err) => {
    console.error(`❌ [FAILED] Database connection failed: ${(err as Error).message}`);
    console.error('👉 Tip: Check your DATABASE_URL credentials and network connection.\n');
    process.exit(1);
  });
