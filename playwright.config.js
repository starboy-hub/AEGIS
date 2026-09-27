module.exports = {
  testDir: './e2e',
  timeout: 60000,
  expect: { timeout: 15000 },
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [['list']]
};
