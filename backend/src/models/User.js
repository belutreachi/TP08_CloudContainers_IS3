const { db } = require('../config/database');

const normalizeString = (value) => {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim();
};

const User = {
  create: (username, email, hashedPassword, role = 'user') => {
    return new Promise((resolve, reject) => {
      const query = 'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)';
      db.run(query, [username, email, hashedPassword, role], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, username, email, role });
        }
      });
    });
  },

  findByUsername: (username) => {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM users WHERE username = ?';
      db.get(query, [username], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  },

  findByEmail: (email) => {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM users WHERE email = ?';
      db.get(query, [email], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  },

  findById: (id) => {
    return new Promise((resolve, reject) => {
      const query = 'SELECT id, username, email, role, created_at FROM users WHERE id = ?';
      db.get(query, [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  },

  findAll: () => {
    return new Promise((resolve, reject) => {
      const query = 'SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC';
      db.all(query, [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows || []);
        }
      });
    });
  },

  update: (id, updates = {}) => {
    return new Promise((resolve, reject) => {
      const allowedRoles = ['user', 'admin'];
      const fields = [];
      const params = [];

      const username = normalizeString(updates.username);
      const email = normalizeString(updates.email);
      const role = normalizeString(updates.role);

      if (username) {
        fields.push('username = ?');
        params.push(username);
      }

      if (email) {
        fields.push('email = ?');
        params.push(email);
      }

      if (role && allowedRoles.includes(role)) {
        fields.push('role = ?');
        params.push(role);
      }

      if (fields.length === 0) {
        resolve(null);
        return;
      }

      const query = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;

      db.run(query, [...params, id], function(err) {
        if (err) {
          reject(err);
          return;
        }

        User.findById(id)
          .then((user) => {
            if (!user) {
              resolve(null);
              return;
            }
            resolve(user);
          })
          .catch(reject);
      });
    });
  },

  deleteById: (id) => {
    return new Promise((resolve, reject) => {
      const query = 'DELETE FROM users WHERE id = ?';
      db.run(query, [id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ changes: this.changes });
        }
      });
    });
  }
};

module.exports = User;
