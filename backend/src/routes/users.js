const express = require('express');
const User = require('../models/User');
const Task = require('../models/Task');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware, adminMiddleware);

router.get('/', async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error al obtener usuarios' });
  }
});

router.put('/:id', async (req, res) => {
  const userId = Number.parseInt(req.params.id, 10);

  if (!Number.isInteger(userId) || userId <= 0) {
    return res.status(400).json({ message: 'Identificador inválido' });
  }

  const { username, email, role } = req.body || {};
  const payload = { username, email, role };

  if (typeof username === 'string' && username.trim() === '') {
    return res.status(400).json({ message: 'El nombre de usuario no puede estar vacío' });
  }

  if (typeof email === 'string' && email.trim() === '') {
    return res.status(400).json({ message: 'El correo electrónico no puede estar vacío' });
  }

  if (!username && !email && !role) {
    return res.status(400).json({ message: 'No se recibieron datos para actualizar' });
  }

  if (role && !['user', 'admin'].includes(role)) {
    return res.status(400).json({ message: 'Rol inválido' });
  }

  try {
    const updatedUser = await User.update(userId, payload);

    if (!updatedUser) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json({ message: 'Usuario actualizado correctamente', user: updatedUser });
  } catch (error) {
    console.error('Error updating user:', error);

    if (error && error.code === 'SQLITE_CONSTRAINT') {
      let message = 'Los datos proporcionados ya están en uso por otro usuario';

      if (typeof error.message === 'string') {
        if (error.message.includes('users.username')) {
          message = 'El nombre de usuario ya está en uso';
        } else if (error.message.includes('users.email')) {
          message = 'El correo electrónico ya está en uso';
        }
      }

      return res.status(400).json({ message });
    }

    res.status(500).json({ message: 'Error al actualizar usuario' });
  }
});

router.delete('/:id', async (req, res) => {
  const userId = Number.parseInt(req.params.id, 10);

  if (!Number.isInteger(userId) || userId <= 0) {
    return res.status(400).json({ message: 'Identificador inválido' });
  }

  if (userId === req.user.id) {
    return res.status(400).json({ message: 'No puedes eliminar tu propia cuenta' });
  }

  try {
    const attachmentPaths = await Task.getAttachmentFilePathsForUser(userId);
    const result = await User.deleteById(userId);

    if (!result || result.changes === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    await Task.removeAttachmentFiles(attachmentPaths);

    res.json({ message: 'Usuario eliminado correctamente' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Error al eliminar usuario' });
  }
});

module.exports = router;
