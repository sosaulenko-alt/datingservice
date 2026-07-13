const DB = {
  users: [
    { id: 1, name: "Марта", age: 27, email: "marta@example.com", password: "1234",
      bio: "Кава, довгі прогулянки, погані каламбури", colors: ["#FF6F5E", "#F2C14E"] },
    { id: 2, name: "Тарас", age: 30, email: "taras@example.com", password: "1234",
      bio: "Гітара, гори, готую занадто гострий борщ", colors: ["#6B4E71", "#FF6F5E"] },
    { id: 3, name: "Оля", age: 24, email: "olya@example.com", password: "1234",
      bio: "Книги, коти, кава №2 о 16:00", colors: ["#F2C14E", "#6B4E71"] },
    { id: 4, name: "Богдан", age: 29, email: "bogdan@example.com", password: "1234",
      bio: "Велосипед, настолки, JS на вихідних", colors: ["#FF6F5E", "#2B1B2E"] },
    { id: 5, name: "Ірина", age: 26, email: "iryna@example.com", password: "1234",
      bio: "Йога, подорожі автостопом, гарбузове лате", colors: ["#F2C14E", "#FF6F5E"] },
  ],

  likes: [],

  messages: [],

  nextUserId: 6,

};

function delay(ms = 350) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function computeSpark(userA, userB) {
  const seed = (userA.id * 31 + userB.id * 17) % 41;
  return 55 + seed; // діапазон приблизно 55–95%
}

const api = {

  async register({ name, age, email, password, bio }) {
    await delay();
    if (DB.users.some((u) => u.email === email)) {
      throw new Error("Користувач з таким email вже існує");
    }
    const palette = [
      ["#FF6F5E", "#F2C14E"], ["#6B4E71", "#FF6F5E"], ["#F2C14E", "#6B4E71"],
    ];
    const colors = palette[DB.users.length % palette.length];
    const user = { id: DB.nextUserId++, name, age: Number(age), email, password, bio, colors };
    DB.users.push(user);
    return { ...user, password: undefined };
  },

  async login({ email, password }) {
    await delay();
    const user = DB.users.find((u) => u.email === email && u.password === password);
    if (!user) throw new Error("Невірний email або пароль");
    return { ...user, password: undefined };
  },

  async getProfiles(currentUserId) {
    await delay();
    const alreadySeen = new Set(
      DB.likes.filter((l) => l.fromUserId === currentUserId).map((l) => l.toUserId)
    );
    const me = DB.users.find((u) => u.id === currentUserId);
    return DB.users
      .filter((u) => u.id !== currentUserId && !alreadySeen.has(u.id))
      .map((u) => ({ ...u, password: undefined, sparkPercent: computeSpark(me, u) }));
  },

  async swipe({ fromUserId, toUserId, liked }) {
    await delay(200);
    DB.likes.push({ fromUserId, toUserId, liked, ts: Date.now() });
    if (!liked) return { matched: false };
    const mutual = DB.likes.some(
      (l) => l.fromUserId === toUserId && l.toUserId === fromUserId && l.liked
    );
    return { matched: mutual };
  },

  async getMatches(currentUserId) {
    await delay();
    const myLikes = DB.likes.filter((l) => l.fromUserId === currentUserId && l.liked);
    const matchIds = myLikes
      .filter((l) =>
        DB.likes.some((o) => o.fromUserId === l.toUserId && o.toUserId === currentUserId && o.liked)
      )
      .map((l) => l.toUserId);
    return DB.users
      .filter((u) => matchIds.includes(u.id))
      .map((u) => ({ ...u, password: undefined }));
  },

  async getMessages(currentUserId, otherUserId) {
    await delay(150);
    return DB.messages
      .filter(
        (m) =>
          (m.fromUserId === currentUserId && m.toUserId === otherUserId) ||
          (m.fromUserId === otherUserId && m.toUserId === currentUserId)
      )
      .sort((a, b) => a.ts - b.ts);
  },

  async sendMessage({ fromUserId, toUserId, text }) {
    await delay(120);
    const message = { id: DB.messages.length + 1, fromUserId, toUserId, text, ts: Date.now() };
    DB.messages.push(message);
    return message;
  },
};
