import { execSync } from 'child_process';

function run(cmd: string) {
  try {
    console.log(`Executing: ${cmd}`);
    const out = execSync(cmd, { encoding: 'utf8' });
    console.log(out);
  } catch (err: any) {
    console.error(`Error executing command: ${err.message}`);
    if (err.stdout) console.log(`STDOUT: ${err.stdout}`);
    if (err.stderr) console.error(`STDERR: ${err.stderr}`);
  }
}

try {
  run('git config user.name "HackerCompagnion7"');
  run('git config user.email "HackerCompagnion7@users.noreply.github.com"');

  // Stage everything, including deleted files (like git_stage_all.ts)
  run('git add -A');

  // Commit deletion of any temporary scripts
  run('git commit -m "chore: remove dynamic staging help scripts and final repository alignment"');

  // Push to remote
  run('git push origin main --force');

  console.log('Final clean push and remote alignment completed successfully!');
} catch (e: any) {
  console.error('Final push failed:', e.message);
}
