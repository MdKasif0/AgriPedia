# AgriPedia 2.0

A modern web application for plant enthusiasts to track, learn, and grow their plants with AI-powered assistance.

## Features

- 🌱 **Plant Health Scanner**: Use your camera to scan plants and get instant health analysis
- 📱 **My Garden**: Track and manage your plants with detailed care information
- 📅 **Care Calendar**: Schedule and track watering, fertilizing, and other care tasks
- 👥 **Community**: Connect with other plant enthusiasts and share your gardening journey
- 📚 **Learning Center**: Access educational content about plant care and gardening
- 🌙 **Dark Mode**: Beautiful dark and light themes for comfortable viewing

## Tech Stack

- Next.js 14 with App Router
- TypeScript
- Tailwind CSS
- Shadcn UI
- Zustand for state management
- React Hook Form with Zod validation
- Lucide Icons

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/MdKasif0/AgriPedia.git
   cd AgriPedia
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                 # App router pages
├── components/          # React components
│   ├── ui/             # UI components
│   ├── auth/           # Authentication components
│   ├── garden/         # Garden management components
│   ├── scanner/        # Plant scanner components
│   ├── calendar/       # Care calendar components
│   ├── community/      # Community components
│   └── learn/          # Learning center components
├── store/              # Zustand store
└── lib/                # Utility functions
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Shadcn UI](https://ui.shadcn.com/) for the beautiful UI components
- [Lucide Icons](https://lucide.dev/) for the icons
- [Unsplash](https://unsplash.com/) for the images

NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
NEXT_PUBLIC_OPENWEATHER_API_KEY=your_openweather_api_key
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_vapid_public_key
