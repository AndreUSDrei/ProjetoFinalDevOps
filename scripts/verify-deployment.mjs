import assert from 'node:assert/strict';

const apiUrl = (process.env.API_URL || 'https://valorant-manager-api.onrender.com').replace(/\/+$/, '');
const webUrl = (process.env.WEB_URL || 'https://projetofinaldevops.vercel.app').replace(/\/+$/, '');
const expectedCommit = process.env.EXPECTED_COMMIT?.trim();
const timeoutMs = Number(process.env.DEPLOY_TIMEOUT_MS || 10 * 60 * 1000);
const pollIntervalMs = Number(process.env.DEPLOY_POLL_INTERVAL_MS || 10 * 1000);
const deadline = Date.now() + timeoutMs;
let lastError;
let deploymentVerified = false;

const fetchWithTimeout = (url) =>
  fetch(url, {
    headers: { 'cache-control': 'no-cache' },
    signal: AbortSignal.timeout(20_000),
  });

async function verifyApi() {
  const healthResponse = await fetchWithTimeout(`${apiUrl}/health`);
  assert.equal(healthResponse.ok, true, `API /health respondeu ${healthResponse.status}`);
  const health = await healthResponse.json();
  assert.equal(health.status, 'ok', 'API não está saudável');
  assert.equal(health.database, 'up', 'SQLite não está disponível');
  if (expectedCommit) {
    assert.equal(health.commit, expectedCommit, 'A API ainda não publicou o commit esperado');
  }

  const playersResponse = await fetchWithTimeout(`${apiUrl}/api/players`);
  assert.equal(playersResponse.ok, true, `API /api/players respondeu ${playersResponse.status}`);
  const players = await playersResponse.json();
  assert.ok(Array.isArray(players) && players.length > 0, 'O seed de jogadores está vazio');
  return `commit ${health.commit}, SQLite ativo e ${players.length} jogadores`;
}

async function verifyWeb() {
  const response = await fetchWithTimeout(`${webUrl}/`);
  assert.equal(response.ok, true, `Vercel respondeu ${response.status}`);
  const html = await response.text();
  const commit = html.match(/<meta\s+name="app-commit"\s+content="([^"]+)"/i)?.[1];
  if (expectedCommit) {
    assert.equal(commit, expectedCommit, 'A Vercel ainda não publicou o commit esperado');
  }

  const scripts = Array.from(
    html.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi),
    (match) => match[1],
  );
  assert.ok(scripts.length > 0, 'Nenhum bundle JavaScript foi encontrado na Vercel');

  for (const script of scripts) {
    const bundleResponse = await fetchWithTimeout(new URL(script, `${webUrl}/`).toString());
    assert.equal(bundleResponse.ok, true, `Bundle ${script} respondeu ${bundleResponse.status}`);
    const bundle = await bundleResponse.text();
    if (bundle.includes(apiUrl)) {
      return `commit ${commit || 'não informado'} e API configurada para ${apiUrl}`;
    }
  }

  assert.fail(`Nenhum bundle da Vercel aponta para ${apiUrl}`);
}

while (Date.now() < deadline) {
  try {
    const [apiResult, webResult] = await Promise.all([verifyApi(), verifyWeb()]);
    console.log(`Deploy validado: API ${apiResult}; Vercel ${webResult}.`);
    deploymentVerified = true;
    break;
  } catch (error) {
    lastError = error;
    console.warn(`Deploy ainda não validado: ${error.message}`);
    if (Date.now() >= deadline) break;
    await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
  }
}

if (!deploymentVerified) {
  console.error(`Falha ao validar o deploy: ${lastError?.message || 'tempo limite excedido'}`);
  process.exitCode = 1;
}
