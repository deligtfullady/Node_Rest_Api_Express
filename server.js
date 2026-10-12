const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const USERS_FILE = path.join(__dirname, 'users.json');

// Middleware для парсинга JSON
app.use(express.json());

// Загрузка пользователей из файла
function loadUsers() {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Ошибка чтения users.json:', err.message);
  }
  return [];
}

// Сохранение пользователей в файл
function saveUsers(users) {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
  } catch (err) {
    console.error('Ошибка записи users.json:', err.message);
  }
}

// ==================== РОУТЫ ====================

// GET /users — получить всех пользователей
app.get('/users', (req, res) => {
  const users = loadUsers();
  res.json(users);
});

// GET /users/:id — получить одного пользователя по id
app.get('/users/:id', (req, res) => {
  const users = loadUsers();
  const id = Number(req.params.id);
  const user = users.find(u => u.id === id);

  if (!user) {
    return res.status(404).json({ message: 'Пользователь не найден' });
  }

  res.json(user);
});

// POST /users — создать нового пользователя
app.post('/users', (req, res) => {
  const users = loadUsers();
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ message: 'Поля name и email обязательны' });
  }

  // Генерируем новый id
  const newId = users.length > 0
    ? Math.max(...users.map(u => u.id)) + 1
    : 1;

  const newUser = {
    id: newId,
    name,
    email
  };

  users.push(newUser);
  saveUsers(users);

  res.status(201).json(newUser);
});

// PUT /users/:id — обновить пользователя
app.put('/users/:id', (req, res) => {
  const users = loadUsers();
  const id = Number(req.params.id);
  const index = users.findIndex(u => u.id === id);

  if (index === -1) {
    return res.status(404).json({ message: 'Пользователь не найден' });
  }

  const { name, email } = req.body;

  // Обновляем только переданные поля
  if (name !== undefined) users[index].name = name;
  if (email !== undefined) users[index].email = email;

  saveUsers(users);
  res.json(users[index]);
});

// DELETE /users/:id — удалить пользователя
app.delete('/users/:id', (req, res) => {
  let users = loadUsers();
  const id = Number(req.params.id);
  const index = users.findIndex(u => u.id === id);

  if (index === -1) {
    return res.status(404).json({ message: 'Пользователь не найден' });
  }

  const deletedUser = users.splice(index, 1)[0];
  saveUsers(users);

  res.json({
    message: 'Пользователь успешно удалён',
    user: deletedUser
  });
});

// Обработка несуществующих роутов
app.use((req, res) => {
  res.status(404).json({ message: 'Маршрут не найден' });
});

app.listen(PORT, () => {
  console.log(`REST API запущен: http://localhost:${PORT}`);
  console.log('Доступные эндпоинты:');
  console.log('  GET    /users');
  console.log('  GET    /users/:id');
  console.log('  POST   /users');
  console.log('  PUT    /users/:id');
  console.log('  DELETE /users/:id');
});
