## 🛠️ Getting Started

> **Note:** You must obtain an API key from the JobNimbus user you wish to integrate with. That API key must have full access to jobs and contacts. 
> Follow their instructions here:
>  👉 [JobNimbus Public API Documentation](https://documenter.getpostman.com/view/3919598/S11PpG4x#intro)
 
---

### Setup Instructions

#### 1. Obtain API key

JobNimbus user goes to Settings > Integrations > API > New API Key button. 
Give the key a description and select an access profile has "Full Access" toggled with everything in Record access and Feature access turned off.

#### 2. Create a .env file

In the project folder create a .env file that contains the following:

```
API_KEY=[Insert your API key here]
```

#### 3. Install dependencies

Run the following command in the project directory to install required packages:

```
npm install
```

#### 4. Start the application
In the project directory terminal, run:
```
    npm run start
```
Open the local development link (usually http://localhost:3000) in your browser.

#### 5. Fetch completed jobs
Select a start and end date, then click "Get" to retrieve completed jobs within that range.

## ✅ You're all set!

You’ll now see a list of completed jobs you can work with — be sure to use this data ethically and responsibly.
