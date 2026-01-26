# Running the Pharmacy System

This guide explains how to run the Pharmacy System on Web, Desktop, and Mobile platforms.

## Prerequisites

- Node.js installed (v18 or higher recommended)
- MongoDB installed and running locally on port 27017
- Android Studio (for Mobile/Android)

## 1. Backend Setup (Required for all platforms)

The backend must be running for any frontend to work.

1.  Open a terminal in `d:\pharmacy\backend`.
2.  Install dependencies (if not already done):
    ```bash
    npm install
    ```
3.  Start the server:
    ```bash
    npm start
    ```
    You should see `Server running on port 5000` and `MongoDB Connected`.

## Default Credentials

To access the system, use the following admin credentials:
- **Email:** `admin@shawcare.com`
- **Password:** `password123`

## 2. Web Application

1.  Open a new terminal in `d:\pharmacy\frontend`.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```
4.  Open your browser to [http://localhost:3000](http://localhost:3000).

## 3. Desktop Application (Electron)

The project includes an `electron` directory. To run the desktop version:

1.  Ensure the Next.js frontend is built or running (depending on electron config, usually it needs a build).
    ```bash
    cd frontend
    npm run build
    ```
2.  Run the Electron app (Assuming scripts are set up, check `frontend/package.json` or `electron/package.json`):
    *If no specific script exists, you may need to run:*
    ```bash
    cd frontend
    npx electron .
    ```
    *(Note: You might need to adjust based on exact project structure. If `electron` folder is separate, navigate there and run `npm start`)*

## 4. Mobile Application (Android/iOS)

This project uses Capacitor.

1.  **Build the Frontend:**
    ```bash
    cd frontend
    npm run build
    ```

2.  **Sync Capacitor:**
    ```bash
    npx cap sync
    ```

3.  **Run on Android:**
    - Open Android Studio:
      ```bash
      npx cap open android
      ```
    - Once Android Studio opens, run the app on an emulator or connected device.
    - **Important:** Ensure your mobile device can reach the backend. `localhost` on Android refers to the device itself. You may need to change the API URL in frontend config to your machine's IP address (e.g., `http://192.168.1.x:5000`).

4.  **Run on iOS (Mac only):**
    ```bash
    npx cap open ios
    ```
