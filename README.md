# KAIRO Lite v2

An immersive, bias-aware phishing and BEC (Business Email Compromise) training application built with Next.js, TypeScript, and Tailwind CSS.

## Features

- **Three-page application**: Landing, Play, and Debrief
- **Character-based training**: Choose between Senior Accountant or Project Manager personas
- **Interactive scenarios**: Real-world BEC attack simulations
- **Bias awareness**: Track and learn about cognitive biases in security decisions
- **Evidence system**: Expandable evidence drawers for investigation
- **Timer mechanics**: Pressure-based decision making with countdown timers
- **Badge system**: Bronze, Silver, and Gold achievement levels
- **Keyboard shortcuts**: Use number keys 1-4 for quick choice selection
- **Mobile responsive**: Works on desktop and mobile devices

## Technology Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: LocalStorage
- **Deployment**: GitHub Pages

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/tobi70334-collab/Kairo_testing.git
cd Kairo_testing
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
npm start
```

## Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Landing page
│   ├── play/page.tsx      # Game runner
│   └── debrief/page.tsx   # Results page
├── components/             # React components
│   ├── CharacterBubble.tsx
│   ├── SceneHeader.tsx
│   └── BadgeModal.tsx
├── lib/                   # Game logic and utilities
│   ├── characters.ts      # Character definitions
│   └── engine-v2.ts       # Game state management
└── public/               # Static assets
    ├── characters/        # Character avatars
    └── scenarios/         # Game scenarios
```

## Game Mechanics

### Scenario: Wire Transfer Mirage
Players navigate through a realistic BEC attack scenario involving:
- Urgent payment requests
- Email header analysis
- Policy compliance checks
- Verification procedures
- Evidence evaluation

### Bias Tracking
The system tracks various cognitive biases:
- **Overconfidence**: Overestimating one's security knowledge
- **Authority bias**: Following orders without verification
- **Present bias**: Focusing on immediate pressure over long-term security
- **Confirmation bias**: Seeking information that confirms existing beliefs
- **Curiosity bias**: Clicking on suspicious links

### Scoring System
- **XP Points**: Earned for good security decisions
- **Streak Bonuses**: +2 XP for consecutive good choices
- **Badge Tiers**: Bronze (10 XP), Silver (25 XP), Gold (40 XP)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

## Live Demo

The application is deployed and available at: [https://tobi70334-collab.github.io/Kairo_testing/](https://tobi70334-collab.github.io/Kairo_testing/)
