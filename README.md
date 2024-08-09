## Getting Started

### How to run Emulator:
Inital Setup
- run 
  ```
  npm install firebase-functions@latest firebase-admin@latest --save
  npm install -g firebase-tools
  ```
- update .env file (inside functions folder) to add Deepgram API Key: DEEPGRAM_API_KEY
- Inside functions folder run: 
  ```
  npm i 
  ```
Running Emulator:
- In base folder run 
  ```
  npm run emulator
  ```
  If you are making changes inside functions folder then make sure to also run:
  ```
  npm run build:watch
  ```

### Frontend
- Get the .env file
- ```
  npm i && npm run dev
  ```
