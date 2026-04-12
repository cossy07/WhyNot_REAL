# WhyNot - Connect Through Skills & Location

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=flat&logo=Prisma&logoColor=white)](https://prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

WhyNot is a location-based social platform that connects people through shared skills and interests. Whether you're looking for a photography buddy, a coding mentor, or someone to collaborate on a project, WhyNot helps you find the right people nearby.

## 🌟 Features

### Core Functionality
- **🔐 Authentication**: Secure user registration and login with NextAuth.js
- **📍 Location-Based Matching**: Find people and opportunities within your preferred radius
- **🎯 Skill-Based Discovery**: Connect with others based on shared skills and interests
- **💬 Real-Time Messaging**: Built-in chat system for seamless communication
- **📝 Post Creation**: Create and browse posts for services, collaborations, or events
- **🗺️ Interactive Map**: Visual discovery of nearby opportunities and people
- **👤 Profile Management**: Comprehensive user profiles with skills, bio, and activity

### User Experience
- **📱 Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **⚡ Real-Time Updates**: Live notifications and instant messaging
- **🔍 Advanced Filtering**: Filter by skills, location, distance, and categories
- **📊 Dashboard Analytics**: Track your network activity and engagement
- **🛡️ Safety Features**: User reporting system and content moderation

## 🚀 Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **Tailwind CSS** - Utility-first CSS framework
- **React** - Component-based UI library

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **Prisma** - Database ORM and migration tool
- **NextAuth.js** - Authentication library

### Database & Real-Time
- **PostgreSQL** - Primary database (via Prisma)
- **Socket.io** - Real-time communication

### Development Tools
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **TypeScript** - Type safety (configured)

## 📋 Prerequisites

Before running this project, make sure you have:
- **Node.js** (v18 or higher)
- **npm** or **yarn** package manager
- **PostgreSQL** database
- **Git** for version control

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/whynot.git
   cd whynot
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up the database**
   ```bash
   # Configure your database connection in .env
   cp .env.example .env.local

   # Run database migrations
   npx prisma migrate dev
   npx prisma generate
   ```

4. **Configure environment variables**
   Create a `.env.local` file with:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/whynot"
   NEXTAUTH_SECRET="your-secret-key"
   NEXTAUTH_URL="http://localhost:3000"
   ```

5. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 Usage

### For Users
1. **Sign Up**: Create an account with your email and basic information
2. **Complete Profile**: Add your skills, bio, and location preferences
3. **Browse Posts**: Discover opportunities and people nearby
4. **Connect**: Send messages and build your network
5. **Create Posts**: Share your skills or request help from others

### For Developers
- **API Routes**: Located in `src/app/api/`
- **Components**: Reusable UI components in `src/components/`
- **Database Schema**: Defined in `prisma/schema.prisma`
- **Styling**: Tailwind CSS with custom components

## 🎨 Interactive Mockup

This repository includes a fully interactive HTML mockup (`mockup.html`) that demonstrates the complete user experience:

### Features Demonstrated
- ✅ User authentication flow
- ✅ Dashboard with activity overview
- ✅ Post browsing and filtering
- ✅ Real-time messaging interface
- ✅ Interactive map with location pins
- ✅ Profile management
- ✅ Responsive design across devices

### How to View the Mockup
```bash
# Open directly in browser
start mockup.html

# Or run a local server
python -m http.server 8000
# Visit: http://localhost:8000/mockup.html
```

The mockup is built with vanilla HTML, CSS, and JavaScript - no dependencies required!

## 📁 Project Structure

```
whynot/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.js               # Database seeding
├── public/                   # Static assets
├── src/
│   ├── app/                  # Next.js app router
│   │   ├── api/              # API routes
│   │   ├── auth/             # Authentication pages
│   │   ├── components/       # Reusable components
│   │   ├── globals.css       # Global styles
│   │   └── layout.js         # Root layout
│   ├── hooks/                # Custom React hooks
│   └── lib/                  # Utility functions
├── mockup.html              # Interactive UI mockup
├── package.json             # Dependencies and scripts
├── tailwind.config.js       # Tailwind configuration
└── next.config.js          # Next.js configuration
```

## 🔧 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:migrate   # Run database migrations
npm run db:seed      # Seed the database
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines
- Follow the existing code style
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting

## 📄 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/session` - Get current session

### Core Endpoints
- `GET/POST /api/posts` - Post management
- `GET/POST /api/messages` - Message handling
- `GET/POST /api/conversations` - Conversation management
- `GET/POST /api/users` - User profiles
- `GET/POST /api/sessions` - Activity sessions

## 🐛 Troubleshooting

### Common Issues
- **Database connection errors**: Check your `.env.local` DATABASE_URL
- **Authentication issues**: Verify NEXTAUTH_SECRET and NEXTAUTH_URL
- **Build errors**: Ensure all dependencies are installed with `npm install`

### Getting Help
- Check existing [Issues](https://github.com/yourusername/whynot/issues)
- Create a new issue with detailed information
- Join our community discussions

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js** for the amazing React framework
- **Prisma** for database management
- **Tailwind CSS** for styling
- **Socket.io** for real-time features
- **NextAuth.js** for authentication

## 📞 Contact

- **Project Link**: [https://github.com/yourusername/whynot](https://github.com/yourusername/whynot)
- **Email**: your.email@example.com

---

**Made with ❤️ for connecting people through shared passions and skills**</content>
<filePath>README.md