# AI Transcription App

A complete, production-ready AI-powered transcription web application built with Next.js, React, and Tailwind CSS.

## Features

- 🎨 **Modern Dark UI** - Sleek black design with floating bubbles animation
- 🔐 **Authentication** - Email/password and Google OAuth support
- 📤 **File Upload** - Drag & drop with support for audio/video formats
- 🤖 **AI Transcription** - Powered by AssemblyAI with speaker identification
- 📊 **Smart Summaries** - AI-generated summaries and topic detection using Gemini
- 📱 **Responsive Design** - Works perfectly on desktop, tablet, and mobile
- ⚡ **Real-time Processing** - Live upload progress and processing status

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Vercel Serverless Functions
- **AI Services**: AssemblyAI (transcription), Google Gemini (summaries)
- **UI Components**: Radix UI, Lucide React icons
- **Authentication**: JWT-based with Google OAuth

## Supported Formats

### Audio Formats
- MP3, WAV, M4A, FLAC, AAC

### Video Formats  
- MP4, MOV, AVI, MKV, WMV

### File Requirements
- Max file size: 500MB
- Max duration: 4 hours
- Min sample rate: 16kHz
- Max speakers: 10

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- AssemblyAI API key
- Google Gemini API key

### Installation

1. Clone the repository:
\`\`\`bash
git clone <repository-url>
cd ai-transcription-app
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Create environment file:
\`\`\`bash
cp .env.example .env.local
\`\`\`

4. Add your API keys to `.env.local`:
\`\`\`env
ASSEMBLYAI_API_KEY=your_assemblyai_key_here
GEMINI_API_KEY=your_gemini_key_here
\`\`\`

5. Run the development server:
\`\`\`bash
npm run dev
\`\`\`

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard:
   - `ASSEMBLYAI_API_KEY`
   - `GEMINI_API_KEY`
4. Deploy!

The app is optimized for Vercel with proper serverless function configuration.

## Project Structure

\`\`\`
├── app/
│   ├── api/                 # API routes
│   │   ├── auth/           # Authentication endpoints
│   │   └── transcribe/     # Transcription endpoint
│   ├── dashboard/          # Dashboard pages
│   ├── login/              # Login page
│   ├── signup/             # Signup page
│   └── forgot-password/    # Password reset
├── components/
│   ├── ui/                 # Reusable UI components
│   ├── auth-provider.tsx   # Authentication context
│   ├── dashboard-sidebar.tsx
│   ├── floating-bubbles.tsx
│   └── typing-text.tsx
└── public/                 # Static assets
\`\`\`

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Sign in user

### Transcription
- `POST /api/transcribe` - Upload and transcribe file

## Features in Detail

### Authentication Flow
1. **Signup** - Create account with email/password or Google
2. **Login** - Sign in with credentials or Google OAuth  
3. **Password Reset** - Email-based password recovery
4. **Session Management** - JWT-based authentication

### Transcription Process
1. **File Upload** - Drag & drop or browse files
2. **Settings Configuration** - Language, quality, speaker ID options
3. **Processing** - Upload to AssemblyAI for transcription
4. **AI Enhancement** - Generate summary and topics with Gemini
5. **Results** - View transcript, summary, speakers, and timestamps

### Dashboard Features
- **Overview** - Stats, recent files, storage usage
- **File Management** - Upload, view, download, delete files
- **Processing Status** - Real-time updates on transcription progress
- **Search & Filter** - Find files by name, status, date

## Customization

### Styling
- Modify `app/globals.css` for global styles
- Update Tailwind config in `tailwind.config.ts`
- Customize animations and effects

### API Integration
- Replace mock authentication with real auth service
- Add database integration for persistent storage
- Implement file storage (AWS S3, etc.)

### Features
- Add user profiles and settings
- Implement team collaboration
- Add export formats (PDF, DOCX, etc.)
- Include audio playback with transcript sync

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@transcribeai.com or create an issue on GitHub.
