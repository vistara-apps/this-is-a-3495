# Archilyzer

**Instant architectural layouts from your project brief.**

Archilyzer is a web application that reduces the time architects spend on generating initial layout options by automatically creating layouts based on project parameters.

![Archilyzer Logo](https://via.placeholder.com/400x200/3B82F6/FFFFFF?text=ARCHILYZER)

## 🚀 Features

### Core Features
- **Project Parameter Input**: Input key project parameters including schedule, space requirements, building type, and location
- **Automated Layout Generation**: Generate 3-5 initial layout options based on input parameters with functional space allocation and code compliance
- **Layout Preview & Selection**: Display generated layouts with key metrics for easy comparison and selection

### Advanced Features
- **AI-Enhanced Generation**: Powered by OpenRouter API for intelligent layout suggestions
- **Location-Based Design**: Google Maps integration for climate and zoning considerations
- **Multi-Format Export**: Export layouts in PNG, SVG, PDF, DXF, DWG, and IFC formats
- **Subscription Management**: Tiered pricing with usage tracking and limits
- **User Profile Management**: Comprehensive account and subscription management

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **State Management**: React Context API
- **Icons**: Lucide React
- **AI Integration**: OpenRouter API
- **Maps**: Google Maps API

### Project Structure
```
src/
├── components/          # React components
│   ├── Dashboard.jsx    # Main dashboard
│   ├── ProjectForm.jsx  # Project creation form
│   ├── LayoutGenerator.jsx # Layout generation interface
│   ├── UserProfile.jsx  # User account management
│   └── ...
├── contexts/           # React contexts
│   ├── AuthContext.jsx # Authentication state
│   └── ProjectContext.jsx # Project state
├── services/           # Business logic services
│   ├── layoutService.js # Layout generation
│   ├── subscriptionService.js # Subscription management
│   ├── locationService.js # Location services
│   └── exportService.js # Export functionality
└── ...
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- OpenRouter API key (optional, for AI features)
- Google Maps API key (optional, for location features)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/vistara-apps/this-is-a-3495.git
   cd this-is-a-3495
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your API keys:
   ```env
   VITE_OPENROUTER_API_KEY=your-openrouter-api-key
   VITE_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## 📖 Usage

### Creating Your First Project

1. **Sign Up/Login**: Create an account or log in to get started
2. **Create Project**: Click "New Project" and fill in:
   - Project name and building type
   - Location (city, state)
   - Project schedule
3. **Add Space Requirements**: Define rooms with square footage and quantities
4. **Generate Layouts**: Click "Generate Layouts" to create options
5. **Review & Select**: Compare layouts with efficiency metrics
6. **Export**: Download your selected layout in various formats

### Subscription Tiers

#### Basic ($29/month)
- Up to 5 projects
- 5 layout generations per project
- PNG & SVG export
- Standard support

#### Pro ($79/month)
- Up to 25 projects
- 15 layout generations per project
- All export formats (PNG, SVG, PDF, DXF)
- Priority support
- API access

#### Enterprise ($199/month)
- Unlimited projects and generations
- All export formats including DWG & IFC
- Dedicated support
- White-label options
- SSO integration

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_OPENROUTER_API_KEY` | OpenRouter API key for AI features | No |
| `VITE_GOOGLE_MAPS_API_KEY` | Google Maps API key for location services | No |
| `VITE_APP_ENV` | Application environment (development/production) | No |
| `VITE_API_BASE_URL` | API base URL for production | No |

### Feature Flags

Enable/disable features using environment variables:
- `VITE_ENABLE_AI_GENERATION=true` - AI-enhanced layout generation
- `VITE_ENABLE_LOCATION_SERVICES=true` - Location-based features
- `VITE_ENABLE_EXPORT_FEATURES=true` - Export functionality

## 📚 API Documentation

Comprehensive API documentation is available in [`docs/API.md`](docs/API.md).

### Key Endpoints

- `POST /auth/login` - User authentication
- `GET /projects` - List user projects
- `POST /projects` - Create new project
- `POST /generate_layout` - Generate layout options
- `GET /geocode` - Location geocoding

## 🎨 UI/UX Guidelines

Detailed UI/UX requirements and design system documentation is available in [`docs/UI-UX-Requirements.md`](docs/UI-UX-Requirements.md).

### Design System
- **Primary Color**: Blue (#3B82F6)
- **Typography**: Inter font family
- **Components**: Modular, accessible components
- **Responsive**: Mobile-first design approach

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

## 🚀 Deployment

### Docker Deployment

```bash
# Build Docker image
docker build -t archilyzer .

# Run container
docker run -p 3000:3000 archilyzer
```

### Vercel Deployment

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment

```bash
# Build for production
npm run build

# Serve static files
npm run preview
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `npm test`
5. Commit changes: `git commit -m 'Add amazing feature'`
6. Push to branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Code Style

- Use ESLint and Prettier for code formatting
- Follow React best practices
- Write meaningful commit messages
- Add tests for new features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Documentation
- [API Documentation](docs/API.md)
- [UI/UX Guidelines](docs/UI-UX-Requirements.md)

### Getting Help
- 📧 Email: support@archilyzer.com
- 💬 Discord: [Join our community](https://discord.gg/archilyzer)
- 📖 Documentation: [docs.archilyzer.com](https://docs.archilyzer.com)

### Reporting Issues
Please report bugs and feature requests through [GitHub Issues](https://github.com/vistara-apps/this-is-a-3495/issues).

## 🙏 Acknowledgments

- OpenRouter for AI-powered layout generation
- Google Maps for location services
- Tailwind CSS for styling framework
- Lucide React for beautiful icons
- The React community for excellent tooling

## 📊 Project Status

- ✅ Core Features Complete
- ✅ UI/UX Implementation
- ✅ Subscription Management
- ✅ Export Functionality
- ✅ Location Services
- 🔄 API Integration (In Progress)
- 🔄 Advanced AI Features (In Progress)
- ⏳ Mobile App (Planned)

---

**Built with ❤️ by the Archilyzer team**

*Reducing the time architects spend on initial layout generation, one project at a time.*
