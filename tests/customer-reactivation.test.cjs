// Run: node --test tests/customer-reactivation.test.cjs
// Uses the project's existing TypeScript compiler and React; no test dependency needed.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const React = require('react');
const { renderToString } = require('react-dom/server');

const root = path.resolve(__dirname, '..');
const tokenURL = 'https://api-livetakeoff.herokuapp.com/api/token/web/';
const credentials = { username: 'fictional-customer', password: 'Fictional-password-91!' };
const response = (status, data) => new Response(JSON.stringify(data), {
  status, headers: { 'Content-Type': 'application/json' },
});
const notice = (delivery) => ({
  code: 'customer_reactivation_required', title: 'Reactivate your account',
  message: `Backend message for ${delivery}`,
  primary_email: delivery === 'missing_email' ? null : 'fictional@example.com',
  delivery,
});

function load(relative, mocks, fetch) {
  const filename = path.join(root, relative);
  const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  const module = { exports: {} };
  vm.runInNewContext(compiled, {
    module, exports: module.exports,
    require: (name) => Object.hasOwn(mocks, name) ? mocks[name] : require(name),
    fetch, AbortController, setTimeout, clearTimeout, console,
  }, { filename });
  return module.exports;
}

function service(fetch) { return load('services/loginService.ts', {}, fetch); }

test('active login preserves credentials and token contract on the recovery-aware endpoint', async () => {
  const result = await service(async (url, options) => {
    assert.equal(url, tokenURL);
    assert.equal(options.method, 'POST');
    assert.deepEqual(JSON.parse(options.body), credentials);
    return response(200, { access: 'access-token', refresh: 'refresh-token' });
  }).requestLogin(credentials.username, credentials.password);
  assert.equal(result.kind, 'authenticated');
  assert.equal(result.access, 'access-token');
  assert.equal(result.refresh, 'refresh-token');
});

for (const delivery of ['sent', 'missing_email', 'unavailable']) {
  test(`inactive customer displays the backend's ${delivery} response`, async () => {
    const expected = notice(delivery);
    const result = await service(async () => response(403, expected))
      .requestLogin(credentials.username, credentials.password);
    assert.equal(result.kind, 'reactivation');
    assert.deepEqual(result.notice, expected);
    assert.equal(result.access, undefined);
  });
}

for (const [label, status, data] of [
  ['incorrect credentials', 401, { detail: 'No active account found' }],
  ['inactive non-customer', 401, { detail: 'No active account found' }],
  ['unrelated permission denial', 403, { detail: 'Access denied' }],
  ['malformed recovery response', 403, { code: 'customer_reactivation_required' }],
  ['recovery code without correct status', 200, notice('sent')],
  ['missing tokens', 200, {}],
  ['empty tokens', 200, { access: '', refresh: '' }],
]) {
  test(`${label} never becomes a session or recovery notice`, async () => {
    await assert.rejects(service(async () => response(status, data))
      .requestLogin(credentials.username, credentials.password), /Login failed/);
  });
}

test('HTML server failures never appear in the displayed error', async () => {
  await assert.rejects(service(async () => new Response('<html>Private server traceback</html>', { status: 500 }))
    .requestLogin(credentials.username, credentials.password), { message: 'Login failed' });
});

test('network failures do not retry login or send duplicate email requests', async () => {
  let calls = 0;
  await assert.rejects(service(async () => { calls++; throw new Error('Offline'); })
    .requestLogin(credentials.username, credentials.password), /Offline/);
  assert.equal(calls, 1);
});

function provider(fetch) {
  const writes = [];
  const secureStore = {
    getItemAsync: async () => null,
    setItemAsync: async (key, value) => writes.push([key, value]),
    deleteItemAsync: async () => {},
  };
  const { AuthProvider, AuthContext } = load('providers/AuthProvider.tsx', {
    'expo-secure-store': secureStore,
    '../services/loginService': service(fetch),
  }, fetch);
  let auth;
  function Capture() { auth = React.useContext(AuthContext); return null; }
  // Render the actual provider to obtain its login function; native storage and
  // HTTP are the test boundaries. Device/session-restoration QA is separate.
  renderToString(React.createElement(AuthProvider, null, React.createElement(Capture)));
  return { auth, writes };
}

for (const delivery of ['sent', 'missing_email', 'unavailable']) {
  test(`provider keeps ${delivery} customers signed out without storing tokens or fetching profile`, async () => {
    const requests = [];
    const { auth, writes } = provider(async (url) => {
      requests.push(url);
      return response(403, notice(delivery));
    });
    const result = await auth.login(credentials.username, credentials.password);
    assert.equal(result.kind, 'reactivation');
    assert.equal(auth.token, null);
    assert.equal(auth.currentUser, null);
    assert.deepEqual(writes, []);
    assert.deepEqual(requests, [tokenURL]);
  });
}

test('provider retains normal token storage and authenticated profile lookup', async () => {
  const user = { id: 123, username: credentials.username };
  const { auth, writes } = provider(async (url, options) => {
    if (url === tokenURL) return response(200, { access: 'new-access', refresh: 'new-refresh' });
    assert.equal(url, 'https://api-livetakeoff.herokuapp.com/api/users/me');
    assert.equal(options.headers.Authorization, 'JWT new-access');
    return response(200, user);
  });
  const result = await auth.login(credentials.username, credentials.password);
  assert.equal(result.kind, 'authenticated');
  assert.deepEqual(result.user, user);
  assert.deepEqual(writes, [['accessToken', 'new-access'], ['refreshToken', 'new-refresh']]);
});
