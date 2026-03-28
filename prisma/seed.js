const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

// Realistic college campus area (centered ~Austin, TX)
const BASE_LAT = 30.2849
const BASE_LNG = -97.7341

function randomOffset(range = 0.05) {
  return (Math.random() - 0.5) * range * 2
}

const skillPosts = [
  {
    title: 'Guitar lessons — beginner friendly',
    description: 'I\'ve been playing for 8 years and love teaching the basics. We\'ll start with chords and strumming patterns. Acoustic or electric, doesn\'t matter.',
    tags: ['guitar', 'music', 'beginner'],
    exchangeTypes: ['coffee', 'trade'],
    availability: 'Evenings and weekends',
  },
  {
    title: 'Python / data science tutoring',
    description: 'CS grad student here. Can help with Python fundamentals, pandas, numpy, matplotlib, or intro ML. Explain things simply — no gatekeeping.',
    tags: ['python', 'data science', 'coding', 'machine learning'],
    exchangeTypes: ['money', 'coffee', 'free'],
    availability: 'Flexible, preferably afternoons',
  },
  {
    title: 'Conversational Spanish practice',
    description: 'Native speaker from Mexico City. Looking to do 1-on-1 conversation practice. No grammar drills — just real talk. I also want to improve my English.',
    tags: ['spanish', 'language', 'conversation'],
    exchangeTypes: ['trade', 'free'],
    availability: 'Mornings work best for me',
  },
  {
    title: 'Sourdough bread baking',
    description: 'I\'ll teach you how to make a real sourdough loaf from scratch — starter, fermentation, shaping, scoring, baking. You\'ll leave with a loaf and the recipe.',
    tags: ['baking', 'sourdough', 'cooking', 'food'],
    exchangeTypes: ['coffee', 'trade'],
    availability: 'Saturdays only',
  },
  {
    title: 'Skateboarding basics',
    description: 'Can teach fundamentals: stance, pushing, ollies, kickturns. Best done at the local skate park. Beginners welcome — I was terrible when I started too.',
    tags: ['skateboarding', 'outdoor', 'sports'],
    exchangeTypes: ['free', 'coffee'],
    availability: 'Weekend mornings',
  },
  {
    title: 'Film photography — shooting and developing',
    description: 'I shoot 35mm and have darkroom access. Can teach you how to shoot manual, load film, and develop black & white in the darkroom. Super meditative.',
    tags: ['photography', 'film', 'darkroom', 'art'],
    exchangeTypes: ['trade', 'coffee'],
    availability: 'Afternoons, let\'s plan ahead',
  },
  {
    title: 'Intro to ceramics / wheel throwing',
    description: 'Third-year ceramics student. Can get you studio time and walk you through centering, opening, and pulling. It\'s harder than it looks but so satisfying.',
    tags: ['ceramics', 'pottery', 'art', 'making'],
    exchangeTypes: ['trade', 'coffee'],
    availability: 'Thursday evenings or Sundays',
  },
  {
    title: 'Rock climbing — movement techniques',
    description: 'Gym climber v5-v6 level. Can coach footwork, body positioning, and reading routes. Have a gym membership — you\'ll need a day pass or your own.',
    tags: ['rock climbing', 'fitness', 'gym'],
    exchangeTypes: ['coffee', 'free'],
    availability: 'Tuesday and Thursday evenings',
  },
  {
    title: 'Intro to Figma / UI design',
    description: 'Self-taught designer, work in product. Can walk you through Figma basics, design systems, and how to think about layout and hierarchy. Portfolio review too.',
    tags: ['figma', 'design', 'ui', 'product'],
    exchangeTypes: ['coffee', 'trade'],
    availability: 'Weekdays after 5pm',
  },
  {
    title: 'Running technique and training plans',
    description: 'I coach recreational runners. Whether you\'re doing your first 5K or targeting a half marathon, I can help with form, pacing, and building a training block.',
    tags: ['running', 'fitness', 'coaching', 'outdoors'],
    exchangeTypes: ['coffee', 'money'],
    availability: 'Early mornings',
  },
  {
    title: 'Intro to investing / personal finance',
    description: 'Finance major, interned at a fund. Can explain index funds, budgeting, and the basics of how to actually start. Not financial advice — just real talk.',
    tags: ['finance', 'investing', 'money', 'budgeting'],
    exchangeTypes: ['coffee', 'free'],
    availability: 'Flexible',
  },
  {
    title: 'Home cooking fundamentals',
    description: 'Let\'s cook something together. I\'ll teach you knife skills, how to build flavors, and how to stop following recipes and actually cook. Pick any cuisine.',
    tags: ['cooking', 'food', 'kitchen', 'fundamentals'],
    exchangeTypes: ['trade', 'coffee', 'free'],
    availability: 'Weekend afternoons',
  },
  {
    title: 'Touch typing — get to 80+ WPM',
    description: 'Went from 35 to 95 WPM in 3 months. I\'ll give you a structured practice plan and sit with you for the first session to fix bad habits. Boring? Yes. Worth it? Absolutely.',
    tags: ['typing', 'productivity', 'skills'],
    exchangeTypes: ['coffee', 'free'],
    availability: 'Anytime really',
  },
  {
    title: 'Intro to meditation — non-woo edition',
    description: 'Been meditating daily for 4 years. I can teach you the basics without any spiritual framing — just the practical, neuroscience-backed side of attention training.',
    tags: ['meditation', 'mindfulness', 'wellness'],
    exchangeTypes: ['free', 'coffee'],
    availability: 'Mornings preferred',
  },
  {
    title: 'Screenwriting — structure and pitch',
    description: 'Film school dropout who learned more on my own than in school. Can help with story structure (3-act, Save the Cat, etc.), character arcs, and how to pitch a concept.',
    tags: ['writing', 'screenwriting', 'storytelling', 'film'],
    exchangeTypes: ['trade', 'coffee'],
    availability: 'Evenings',
  },
  {
    title: 'Welding basics — MIG and stick',
    description: 'I work in a metal shop part-time. If you want to learn to weld (MIG or stick), I can get you shop time and teach you safety, setup, and basic bead runs.',
    tags: ['welding', 'making', 'metal', 'workshop'],
    exchangeTypes: ['money', 'trade'],
    availability: 'Weekends',
  },
  {
    title: 'Yoga — foundations and alignment',
    description: 'RYT-200 certified. Can do private or semi-private sessions focused on alignment and building a home practice. Props welcome. No woo required.',
    tags: ['yoga', 'fitness', 'wellness', 'movement'],
    exchangeTypes: ['coffee', 'trade', 'money'],
    availability: 'Mornings and late evenings',
  },
  {
    title: 'Rap writing and flow — beginner',
    description: 'I\'ve been writing and recording for 5 years. Can teach rhyme schemes, syllable counting, flow patterns, and how to actually write a verse. No judgment.',
    tags: ['rap', 'music', 'writing', 'hiphop'],
    exchangeTypes: ['trade', 'free'],
    availability: 'Flexible',
  },
  {
    title: 'Intro to Arduino / embedded systems',
    description: 'EE student. I can walk you through your first Arduino project — sensors, actuators, basic circuits. Bring a laptop and a curious attitude.',
    tags: ['arduino', 'electronics', 'coding', 'hardware'],
    exchangeTypes: ['coffee', 'free'],
    availability: 'Afternoons',
  },
  {
    title: 'Chess — opening theory and middlegame',
    description: '1800+ Lichess player. Can help with openings, middlegame planning, and avoiding common tactical blunders. Good for anyone stuck in the 800–1200 range.',
    tags: ['chess', 'strategy', 'game'],
    exchangeTypes: ['coffee', 'free', 'trade'],
    availability: 'Evenings, in-person or online',
  },
]

const userNames = [
  'Maya Chen', 'Jordan Lee', 'Sam Rivera', 'Alex Kim', 'Priya Patel',
  'Luca Moretti', 'Amara Osei', 'Finn O\'Brien', 'Zoe Nakamura', 'Diego Vargas',
  'Riley Thompson', 'Kai Yamamoto', 'Nadia Hassan', 'Eli Cohen', 'Sofia Andrade',
  'Marcus Johnson', 'Ava Wright', 'Omar Farouk', 'Cleo Dubois', 'Ben Larsen',
]

async function main() {
  console.log('Seeding database...')

  // Clean up first
  await prisma.report.deleteMany()
  await prisma.block.deleteMany()
  await prisma.message.deleteMany()
  await prisma.conversation.deleteMany()
  await prisma.session.deleteMany()
  await prisma.post.deleteMany()
  await prisma.user.deleteMany()

  const passwordHash = await bcrypt.hash('password123', 12)

  // Create users
  const users = []
  for (let i = 0; i < 20; i++) {
    const user = await prisma.user.create({
      data: {
        email: `user${i + 1}@example.com`,
        passwordHash,
        name: userNames[i],
        bio: `Curious person who loves learning new things. Based in Austin.`,
        locationLat: BASE_LAT + randomOffset(0.08),
        locationLng: BASE_LNG + randomOffset(0.08),
        locationName: 'Austin, TX',
        isEduVerified: Math.random() > 0.5,
      },
    })
    users.push(user)
  }

  console.log(`Created ${users.length} users`)

  // Create posts (one per user)
  const posts = []
  for (let i = 0; i < 20; i++) {
    const postData = skillPosts[i]
    const post = await prisma.post.create({
      data: {
        userId: users[i].id,
        title: postData.title,
        description: postData.description,
        tags: postData.tags,
        exchangeTypes: postData.exchangeTypes,
        isRemote: false,
        lat: users[i].locationLat + randomOffset(0.01),
        lng: users[i].locationLng + randomOffset(0.01),
        locationName: 'Austin, TX',
        availability: postData.availability,
        isActive: true,
      },
    })
    posts.push(post)
  }

  console.log(`Created ${posts.length} posts`)

  // Create a demo user for easy login
  const demoUser = await prisma.user.create({
    data: {
      email: 'demo@whynot.app',
      passwordHash,
      name: 'Demo User',
      bio: 'Just checking out WhyNot!',
      locationLat: BASE_LAT,
      locationLng: BASE_LNG,
      locationName: 'Austin, TX',
    },
  })

  console.log('Created demo user: demo@whynot.app / password123')
  console.log('Seeding complete.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
