import { PrismaClient, Difficulty, GameType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const categories = [
  { slug: 'animals', name: 'Animals', icon: '🐾', color: '#f97316', sortOrder: 1 },
  { slug: 'fruits', name: 'Fruits', icon: '🍎', color: '#ef4444', sortOrder: 2 },
  { slug: 'colors', name: 'Colors', icon: '🎨', color: '#8b5cf6', sortOrder: 3 },
  { slug: 'numbers', name: 'Numbers', icon: '🔢', color: '#06b6d4', sortOrder: 4 },
  { slug: 'school', name: 'School', icon: '🏫', color: '#3b82f6', sortOrder: 5 },
  { slug: 'weather', name: 'Weather', icon: '⛅', color: '#64748b', sortOrder: 6 },
  { slug: 'body-parts', name: 'Body Parts', icon: '🫀', color: '#ec4899', sortOrder: 7 },
  { slug: 'vehicles', name: 'Vehicles', icon: '🚗', color: '#14b8a6', sortOrder: 8 },
  { slug: 'sports', name: 'Sports', icon: '⚽', color: '#f43f5e', sortOrder: 9 },
];

const flashcardData: Record<string, Array<{
  word: string;
  translation: string;
  pronunciation: string;
  exampleSentence: string;
  imageUrl: string;
  difficulty: Difficulty;
}>> = {
  animals: [
    { word: 'Cat', translation: 'Mushuk', pronunciation: '/kæt/', exampleSentence: 'The cat is sleeping.', imageUrl: '🐱', difficulty: 'BEGINNER' },
    { word: 'Dog', translation: 'It', pronunciation: '/dɒɡ/', exampleSentence: 'My dog loves to play.', imageUrl: '🐶', difficulty: 'BEGINNER' },
    { word: 'Bird', translation: 'Qush', pronunciation: '/bɜːrd/', exampleSentence: 'The bird can fly.', imageUrl: '🐦', difficulty: 'BEGINNER' },
    { word: 'Fish', translation: 'Baliq', pronunciation: '/fɪʃ/', exampleSentence: 'Fish live in water.', imageUrl: '🐟', difficulty: 'BEGINNER' },
    { word: 'Elephant', translation: 'Fil', pronunciation: '/ˈelɪfənt/', exampleSentence: 'The elephant is big.', imageUrl: '🐘', difficulty: 'INTERMEDIATE' },
    { word: 'Lion', translation: 'Sher', pronunciation: '/ˈlaɪən/', exampleSentence: 'The lion is the king.', imageUrl: '🦁', difficulty: 'INTERMEDIATE' },
  ],
  fruits: [
    { word: 'Apple', translation: 'Olma', pronunciation: '/ˈæpəl/', exampleSentence: 'I eat an apple every day.', imageUrl: '🍎', difficulty: 'BEGINNER' },
    { word: 'Banana', translation: 'Banan', pronunciation: '/bəˈnænə/', exampleSentence: 'Monkeys love bananas.', imageUrl: '🍌', difficulty: 'BEGINNER' },
    { word: 'Orange', translation: 'Apelsin', pronunciation: '/ˈɒrɪndʒ/', exampleSentence: 'Orange juice is tasty.', imageUrl: '🍊', difficulty: 'BEGINNER' },
    { word: 'Grape', translation: 'Uzum', pronunciation: '/ɡreɪp/', exampleSentence: 'Grapes are sweet.', imageUrl: '🍇', difficulty: 'BEGINNER' },
    { word: 'Strawberry', translation: 'Qulupnay', pronunciation: '/ˈstrɔːbəri/', exampleSentence: 'I like strawberry ice cream.', imageUrl: '🍓', difficulty: 'INTERMEDIATE' },
  ],
  colors: [
    { word: 'Red', translation: 'Qizil', pronunciation: '/red/', exampleSentence: 'The apple is red.', imageUrl: '🔴', difficulty: 'BEGINNER' },
    { word: 'Blue', translation: 'Ko\'k', pronunciation: '/bluː/', exampleSentence: 'The sky is blue.', imageUrl: '🔵', difficulty: 'BEGINNER' },
    { word: 'Green', translation: 'Yashil', pronunciation: '/ɡriːn/', exampleSentence: 'Grass is green.', imageUrl: '🟢', difficulty: 'BEGINNER' },
    { word: 'Yellow', translation: 'Sariq', pronunciation: '/ˈjeləʊ/', exampleSentence: 'The sun is yellow.', imageUrl: '🟡', difficulty: 'BEGINNER' },
    { word: 'Purple', translation: 'Binafsha', pronunciation: '/ˈpɜːpl/', exampleSentence: 'She has a purple dress.', imageUrl: '🟣', difficulty: 'INTERMEDIATE' },
  ],
  numbers: [
    { word: 'One', translation: 'Bir', pronunciation: '/wʌn/', exampleSentence: 'I have one cat.', imageUrl: '1️⃣', difficulty: 'BEGINNER' },
    { word: 'Two', translation: 'Ikki', pronunciation: '/tuː/', exampleSentence: 'Two plus two is four.', imageUrl: '2️⃣', difficulty: 'BEGINNER' },
    { word: 'Three', translation: 'Uch', pronunciation: '/θriː/', exampleSentence: 'I see three birds.', imageUrl: '3️⃣', difficulty: 'BEGINNER' },
    { word: 'Four', translation: 'To\'rt', pronunciation: '/fɔːr/', exampleSentence: 'Four seasons in a year.', imageUrl: '4️⃣', difficulty: 'BEGINNER' },
    { word: 'Five', translation: 'Besh', pronunciation: '/faɪv/', exampleSentence: 'High five!', imageUrl: '5️⃣', difficulty: 'BEGINNER' },
  ],
  school: [
    { word: 'Book', translation: 'Kitob', pronunciation: '/bʊk/', exampleSentence: 'I read a book.', imageUrl: '📚', difficulty: 'BEGINNER' },
    { word: 'Pen', translation: 'Ruchka', pronunciation: '/pen/', exampleSentence: 'Write with a pen.', imageUrl: '🖊️', difficulty: 'BEGINNER' },
    { word: 'Teacher', translation: 'O\'qituvchi', pronunciation: '/ˈtiːtʃər/', exampleSentence: 'The teacher is kind.', imageUrl: '👩‍🏫', difficulty: 'BEGINNER' },
    { word: 'Student', translation: 'O\'quvchi', pronunciation: '/ˈstjuːdnt/', exampleSentence: 'I am a student.', imageUrl: '🧑‍🎓', difficulty: 'BEGINNER' },
    { word: 'Pencil', translation: 'Qalam', pronunciation: '/ˈpensl/', exampleSentence: 'Draw with a pencil.', imageUrl: '✏️', difficulty: 'BEGINNER' },
  ],
  weather: [
    { word: 'Sun', translation: 'Quyosh', pronunciation: '/sʌn/', exampleSentence: 'The sun is bright.', imageUrl: '☀️', difficulty: 'BEGINNER' },
    { word: 'Rain', translation: 'Yomg\'ir', pronunciation: '/reɪn/', exampleSentence: 'It is raining today.', imageUrl: '🌧️', difficulty: 'BEGINNER' },
    { word: 'Cloud', translation: 'Bulut', pronunciation: '/klaʊd/', exampleSentence: 'Clouds are white.', imageUrl: '☁️', difficulty: 'BEGINNER' },
    { word: 'Snow', translation: 'Qor', pronunciation: '/snəʊ/', exampleSentence: 'Snow is cold.', imageUrl: '❄️', difficulty: 'BEGINNER' },
    { word: 'Wind', translation: 'Shamol', pronunciation: '/wɪnd/', exampleSentence: 'The wind is strong.', imageUrl: '💨', difficulty: 'INTERMEDIATE' },
  ],
  'body-parts': [
    { word: 'Head', translation: 'Bosh', pronunciation: '/hed/', exampleSentence: 'My head hurts.', imageUrl: '🗣️', difficulty: 'BEGINNER' },
    { word: 'Hand', translation: 'Qo\'l', pronunciation: '/hænd/', exampleSentence: 'Wash your hands.', imageUrl: '✋', difficulty: 'BEGINNER' },
    { word: 'Eye', translation: 'Ko\'z', pronunciation: '/aɪ/', exampleSentence: 'I have two eyes.', imageUrl: '👁️', difficulty: 'BEGINNER' },
    { word: 'Ear', translation: 'Quloq', pronunciation: '/ɪər/', exampleSentence: 'Listen with your ears.', imageUrl: '👂', difficulty: 'BEGINNER' },
    { word: 'Foot', translation: 'Oyoq', pronunciation: '/fʊt/', exampleSentence: 'My foot is tired.', imageUrl: '🦶', difficulty: 'BEGINNER' },
  ],
  vehicles: [
    { word: 'Car', translation: 'Mashina', pronunciation: '/kɑːr/', exampleSentence: 'We drive a car.', imageUrl: '🚗', difficulty: 'BEGINNER' },
    { word: 'Bus', translation: 'Avtobus', pronunciation: '/bʌs/', exampleSentence: 'The bus is full.', imageUrl: '🚌', difficulty: 'BEGINNER' },
    { word: 'Train', translation: 'Poyezd', pronunciation: '/treɪn/', exampleSentence: 'The train is fast.', imageUrl: '🚂', difficulty: 'BEGINNER' },
    { word: 'Plane', translation: 'Samolyot', pronunciation: '/pleɪn/', exampleSentence: 'The plane flies high.', imageUrl: '✈️', difficulty: 'INTERMEDIATE' },
    { word: 'Bicycle', translation: 'Velosiped', pronunciation: '/ˈbaɪsɪkl/', exampleSentence: 'I ride my bicycle.', imageUrl: '🚲', difficulty: 'INTERMEDIATE' },
  ],
  sports: [
    { word: 'Football', translation: 'Futbol', pronunciation: '/ˈfʊtbɔːl/', exampleSentence: 'We play football.', imageUrl: '⚽', difficulty: 'BEGINNER' },
    { word: 'Basketball', translation: 'Basketbol', pronunciation: '/ˈbæskɪtbɔːl/', exampleSentence: 'He is tall for basketball.', imageUrl: '🏀', difficulty: 'BEGINNER' },
    { word: 'Tennis', translation: 'Tennis', pronunciation: '/ˈtenɪs/', exampleSentence: 'She hits the tennis ball.', imageUrl: '🎾', difficulty: 'BEGINNER' },
    { word: 'Swimming', translation: 'Suzish', pronunciation: '/ˈswɪmɪŋ/', exampleSentence: 'I go swimming in summer.', imageUrl: '🏊‍♂️', difficulty: 'INTERMEDIATE' },
    { word: 'Boxing', translation: 'Boks', pronunciation: '/ˈbɒksɪŋ/', exampleSentence: 'Boxing is a hard sport.', imageUrl: '🥊', difficulty: 'INTERMEDIATE' },
  ],
};

const achievements = [
  { slug: 'first-game', name: 'First Game', description: 'Play your first game', icon: '🎮', xpReward: 20, coinReward: 10, condition: 'games_played >= 1' },
  { slug: 'first-win', name: 'First Win', description: 'Complete a game with 50%+ accuracy', icon: '🏆', xpReward: 30, coinReward: 15, condition: 'accuracy >= 50' },
  { slug: '100-correct', name: '100 Correct', description: 'Answer 100 questions correctly', icon: '💯', xpReward: 100, coinReward: 50, condition: 'correct_answers >= 100' },
  { slug: '7-day-streak', name: '7-Day Streak', description: 'Learn 7 days in a row', icon: '🔥', xpReward: 70, coinReward: 35, condition: 'streak >= 7' },
  { slug: 'memory-master', name: 'Memory Master', description: 'Win 5 memory match games', icon: '🧠', xpReward: 50, coinReward: 25, condition: 'memory_wins >= 5' },
  { slug: 'quiz-champion', name: 'Quiz Champion', description: 'Get a perfect quiz round', icon: '⭐', xpReward: 40, coinReward: 20, condition: 'perfect_round' },
];

async function main() {
  console.log('🌱 Seeding BrainCards database...');

  await prisma.userAchievement.deleteMany();
  await prisma.gameSession.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.streak.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.parentChildLink.deleteMany();
  await prisma.classroomMember.deleteMany();
  await prisma.classroom.deleteMany();
  await prisma.flashcard.deleteMany();
  await prisma.category.deleteMany();
  await prisma.achievement.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('password123', 12);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@braincards.app',
      username: 'admin',
      passwordHash,
      role: 'ADMIN',
      xp: 5000,
      level: 10,
      coins: 500,
      avatar: '👑',
    },
  });

  const student = await prisma.user.create({
    data: {
      email: 'student@braincards.app',
      username: 'student',
      passwordHash,
      role: 'STUDENT',
      age: 8,
      country: 'UZ',
      avatar: '🦊',
      streak: { create: { currentStreak: 3, longestStreak: 5, lastActiveDate: new Date() } },
    },
  });

  const teacher = await prisma.user.create({
    data: {
      email: 'teacher@braincards.app',
      username: 'teacher',
      passwordHash,
      role: 'TEACHER',
      avatar: '👩‍🏫',
    },
  });

  for (const cat of categories) {
    const category = await prisma.category.create({ data: cat });
    const cards = flashcardData[cat.slug] ?? [];
    for (const card of cards) {
      await prisma.flashcard.create({
        data: { ...card, categoryId: category.id, tags: [cat.slug] },
      });
    }
  }

  for (const ach of achievements) {
    await prisma.achievement.create({ data: ach });
  }

  await prisma.classroom.create({
    data: {
      name: 'English Class A',
      code: 'ENG2024',
      teacherId: teacher.id,
      description: 'Beginner English vocabulary',
      members: { create: { userId: student.id } },
    },
  });

  console.log('✅ Seed complete!');
  console.log('   Admin:   admin@braincards.app / password123');
  console.log('   Student: student@braincards.app / password123');
  console.log('   Teacher: teacher@braincards.app / password123');
  console.log(`   Categories: ${categories.length}, Flashcards: ~${Object.values(flashcardData).flat().length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
