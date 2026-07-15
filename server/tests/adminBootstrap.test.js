import test from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';
import { syncAdminAccount } from '../adminBootstrap.js';

test('syncAdminAccount refreshes an existing admin password and role', async () => {
  const users = [
    {
      _id: '1',
      name: 'Old Admin',
      email: 'admin@innovationxlab.com',
      password: await bcrypt.hash('wrong-password', 10),
      role: 'user',
    },
  ];

  const User = {
    async findOne({ email }) {
      return users.find((user) => user.email === email) || null;
    },
    async create(document) {
      const created = { _id: '2', ...document };
      users.push(created);
      return created;
    },
    async findByIdAndUpdate(id, update) {
      const index = users.findIndex((user) => user._id === id);
      users[index] = { ...users[index], ...update };
      return users[index];
    },
  };

  await syncAdminAccount({
    User,
    adminEmail: 'admin@innovationxlab.com',
    adminPassword: 'Admin@02',
    logger: { log: () => {} },
  });

  const currentAdmin = users.find((user) => user.email === 'admin@innovationxlab.com');
  assert.equal(currentAdmin.role, 'admin');
  assert.equal(currentAdmin.name, 'Admin');
  assert.ok(await bcrypt.compare('Admin@02', currentAdmin.password));
});

test('syncAdminAccount creates the admin when no account exists yet', async () => {
  const users = [];
  const User = {
    async findOne({ email }) {
      return users.find((user) => user.email === email) || null;
    },
    async create(document) {
      const created = { _id: '1', ...document };
      users.push(created);
      return created;
    },
    async findByIdAndUpdate() {
      throw new Error('unexpected findByIdAndUpdate call');
    },
  };

  await syncAdminAccount({
    User,
    adminEmail: 'admin@innovationxlab.com',
    adminPassword: 'Admin@02',
    logger: { log: () => {} },
  });

  assert.equal(users.length, 1);
  assert.equal(users[0].role, 'admin');
  assert.ok(await bcrypt.compare('Admin@02', users[0].password));
});
