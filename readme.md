# Reddit Message Sender

This Node.js application allows you to message all users participating in a Reddit thread. It utilizes the Reddit API to retrieve usernames from a specified thread and sends them a message with a predefined subject and content.

## Instructions

Follow these steps to set up and use the Reddit Message Sender:

1. **Obtain Reddit API Credentials**
   - Create a Reddit account if you don't have one.
   - Go to the Reddit [App Preferences page](https://www.reddit.com/prefs/apps) and create a new app.
   - Obtain the client ID and client secret generated for your app.

2. **Set Up Environment Variables**
   - Create a `.env` file in the project root directory.
   - Define the following environment variables in the `.env` file:
     ```plaintext
     REDDIT_CLIENT_ID=your_client_id_here
     REDDIT_CLIENT_SECRET=your_client_secret_here
     REDDIT_USER=your_reddit_username
     REDDIT_PASS=your_reddit_password
     ```

3. **Set Thread ID, Message Subject, and Content**
   - Replace placeholders in the `index.js` file with your thread ID, message subject, and message content:
     ```javascript
     const threadId = 'your_thread_id_here';
     const messageSubject = 'your_message_subject_here';
     const messageContent = `your_message_content_here`;
     ```

4. **Install Dependencies**
   - Run `npm install` to install required dependencies.

5. **Run the Application**
   - Execute `npm start` to run the application.
   - The program will retrieve usernames from the specified thread and send them the message.

## Example

Here's how you can set up the necessary parameters in the `index.js` file:

```javascript
// Set the thread ID
const threadId = 'abc123'; // Replace with your thread ID

// Set the message subject and content
const messageSubject = 'Greetings from Reddit Bot';
const messageContent = `Hello there! You're receiving this message from our Reddit bot.`;
