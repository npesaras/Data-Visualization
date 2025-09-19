# Filipino Emigrants Data Visualization

A comprehensive web application for managing and visualizing Filipino emigrant statistics. Built with React, TypeScript, and Appwrite, featuring interactive charts, data management, and CSV import capabilities.

![Project Status](https://img.shields.io/badge/status-active-brightgreen)
![React](https://img.shields.io/badge/React-19.1.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-latest-blue)
![Appwrite](https://img.shields.io/badge/Appwrite-20.0.0-red)

## 📊 Features

### Data Management
- **Manual Data Entry**: Add emigrant records through an intuitive form interface
- **CSV Import**: Bulk import data from CSV files with validation and error handling
- **CRUD Operations**: Create, read, update, and delete emigrant records
- **Real-time Updates**: Automatic data refresh and live connection monitoring

### Data Visualization
- **Interactive Charts**: Multiple chart types including bar, line, area, pie, and stacked area charts
- **Chart Selector**: Dynamic switching between different visualization types
- **Statistics Dashboard**: Key metrics and insights with professional styling
- **Responsive Design**: Charts adapt to different screen sizes and devices

### Technical Features
- **Appwrite Integration**: Secure cloud database with real-time connection monitoring
- **Type Safety**: Full TypeScript implementation with strict typing
- **Modern UI**: Clean interface built with Shadcn/UI components
- **Error Handling**: Comprehensive error reporting and user feedback
- **Performance**: Optimized rendering with React best practices

## 🚀 Quick Start

### Prerequisites

- **Node.js** (version 18 or higher)
- **pnpm** (recommended) or npm
- **Appwrite Account** for database services

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/npesaras/Data-Visualization.git
   cd dataViz2
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Environment Setup**
   
   Create a `.env` file in the root directory:
   ```env
   VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
   VITE_APPWRITE_PROJECT_ID=your_project_id
   VITE_APPWRITE_DATABASE_ID=your_database_id
   VITE_APPWRITE_COLLECTION_ID=your_collection_id
   ```

4. **Start the development server**
   ```bash
   pnpm dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

## 🛠️ Technology Stack

### Frontend
- **React 19.1.1**: Modern UI library with latest features
- **TypeScript**: Type-safe development
- **Vite**: Fast build tool and development server
- **Tailwind CSS 4.1.13**: Utility-first CSS framework

### UI Components
- **Shadcn/UI**: Modern component library
- **Radix UI**: Headless UI primitives
- **Lucide React**: Beautiful icon library

### Data Visualization
- **Recharts 2.15.4**: Composable charting library
- **Custom Chart Components**: Tailored visualization solutions

### Backend & Database
- **Appwrite 20.0.0**: Backend-as-a-Service
- **Real-time Database**: Live data synchronization
- **Cloud Storage**: Secure data persistence

### Development Tools
- **ESLint**: Code linting and formatting
- **TypeScript Compiler**: Type checking
- **React Hook Form**: Form management
- **Zod**: Schema validation

## 🔧 Development

### Project Structure

```
dataViz2/
├── src/
│   ├── components/          # React components
│   │   ├── ui/             # Reusable UI components
│   │   ├── area-chart.tsx  # Area chart component
│   │   ├── bar-chart.tsx   # Bar chart component
│   │   ├── line-chart.tsx  # Line chart component
│   │   ├── pie-chart.tsx   # Pie chart component
│   │   └── ...
│   ├── lib/                # Utility libraries
│   │   ├── appwrite.ts     # Appwrite configuration
│   │   └── utils.ts        # Helper functions
│   ├── services/           # Business logic
│   │   ├── emigrantServices.ts  # CRUD operations
│   │   └── importCSV.ts    # CSV import logic
│   ├── styles/             # CSS files
│   └── App.tsx             # Main application component
├── public/                 # Static assets
├── package.json            # Dependencies and scripts
└── README.md              # Project documentation
```

### Available Scripts

```bash
# Development
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm preview      # Preview production build
pnpm lint         # Run ESLint

# Package Management
pnpm install      # Install dependencies
pnpm update       # Update dependencies
```

### Key Components

- **App.tsx**: Main application component with state management
- **StatsSummary**: Dashboard statistics and metrics
- **ChartSelector**: Interactive chart type switching
- **importCSV.ts**: Comprehensive CSV processing logic
- **emigrantServices.ts**: Appwrite CRUD operations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
