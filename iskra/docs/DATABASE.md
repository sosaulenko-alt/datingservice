
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  age INT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  bio TEXT,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE likes (
  id SERIAL PRIMARY KEY,
  from_user_id INT REFERENCES users(id),
  to_user_id INT REFERENCES users(id),
  liked BOOLEAN NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE (from_user_id, to_user_id)
);

CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  from_user_id INT REFERENCES users(id),
  to_user_id INT REFERENCES users(id),
  text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);



import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pg from "pg";

const app = express();
app.use(express.json());

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const JWT_SECRET = process.env.JWT_SECRET;

app.post("/api/register", async (req, res) => {
  const { name, age, email, password, bio } = req.body;
  const passwordHash = await bcrypt.hash(password, 10);
  const result = await pool.query(
    `INSERT INTO users (name, age, email, password_hash, bio)
     VALUES ($1,$2,$3,$4,$5) RETURNING id, name, age, email, bio`,
    [name, age, email, passwordHash, bio]
  );
  const user = result.rows[0];
  const token = jwt.sign({ userId: user.id }, JWT_SECRET);
  res.json({ ...user, token });
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  const result = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
  const user = result.rows[0];
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return res.status(401).json({ error: "Невірний email або пароль" });
  }
  const token = jwt.sign({ userId: user.id }, JWT_SECRET);
  res.json({ id: user.id, name: user.name, age: user.age, email: user.email, bio: user.bio, token });
});

app.listen(3000, () => console.log("Iskra backend listening on port 3000"));

async login({ email, password }) {
  const res = await fetch("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error((await res.json()).error);
  return res.json();
}
