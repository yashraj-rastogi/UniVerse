# UniVerse

UniVerse is a modern web application built with Next.js 16, React 19, and Firebase. It features a unique "Ocean" theme, dark mode support, and a specialized "ThirdSpace" for anonymous interactions.

## Features

-   **Modern UI**: Built with Tailwind CSS v4 and Shadcn UI components.
-   **Theming**:
    -   **Ocean Theme**: A custom color palette inspired by the ocean.
    -   **Dark Mode**: Fully supported with a toggle switch.
    -   **ThirdSpace**: A distinct, anonymous section with a "Midnight Violet" theme.
-   **Authentication**: Secure user authentication using Firebase Auth.
-   **Database**: Real-time data storage with Firebase Firestore.
-   **AI Safety**: Content moderation for posts using Google Gemini AI (Gemini 1.5 Flash).

## Getting Started

### Prerequisites

-   Node.js (v18 or higher)
-   npm or pnpm

### Installation

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    cd UniVerse
    ```

2.  Install dependencies:
    ```bash
    npm install
    # or
    pnpm install
    ```

3.  Set up Environment Variables:
    -   Copy `.env.example` to `.env.local`:
        ```bash
        cp .env.example .env.local
        ```
    -   Fill in your Firebase and Gemini API keys in `.env.local`.

### Running the Development Server

```bash
npm run dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deployment on Vercel

1.  Push your code to a Git repository (GitHub, GitLab, Bitbucket).
2.  Import the project into Vercel.
3.  Vercel will automatically detect Next.js.
4.  **Important**: Add the Environment Variables (from your `.env.local`) to the Vercel project settings.
5.  Deploy!

## Important Notes

-   **AI Safety**: The project uses Google Gemini AI for content safety checks. Ensure your `GEMINI_API_KEY` is valid.
    -   *Note*: If you see "403 Forbidden" errors in logs, your API key might be compromised or invalid. Please generate a new one from Google AI Studio.
-   **Build Configuration**: The project is configured to ignore TypeScript build errors (`ignoreBuildErrors: true`) to facilitate smoother deployment for prototypes.

## Tech Stack

-   **Framework**: Next.js 16 (App Router)
-   **Language**: TypeScript
-   **Styling**: Tailwind CSS v4
-   **Backend**: Firebase (Auth, Firestore)
-   **AI**: Google Generative AI SDK
