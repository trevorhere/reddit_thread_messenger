require('dotenv').config();
const snoowrap = require('snoowrap');
const { URLSearchParams } = require('url');
const FormData = require('form-data');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const { REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET, REDDIT_USER, REDDIT_PASS } = process.env;

const r = new snoowrap({
  userAgent: `reddit-app:v0.1 (by /u/${REDDIT_USER})`,
  clientId: REDDIT_CLIENT_ID,
  clientSecret: REDDIT_CLIENT_SECRET,
  username: REDDIT_USER,
  password: REDDIT_PASS,
});

const threadId = 'your_thread_id_here';
const messageSubject = 'your_message_subject_here';
const messageContent = `your_message_content_here`;

async function main() {
  const usernames = await getUsersFromPost(threadId);
  console.log(`retrieved ${usernames.size} usernames`);
  const token = await getAccessToken();
  await sendMessages(usernames, token);
}

async function getUsersFromPost(threadId) {
  try {

    const submission = await r.getSubmission(threadId);
    const comments = await submission.expandReplies({ limit: Infinity, depth: Infinity });
    const usernames = new Set();

    comments.comments.forEach(comment => {
      usernames.add(comment.author.name);
    });

    return usernames;

  } catch (error) {
    console.error(`Failed to fetch comments: ${error.message}`);
  }
}

async function sendMessages(usernames, access_token) {
  usernames.forEach(async (username) => {
    try {
      const result = await sendMessage(username, access_token)
      console.log(`message sent to: ${username}: ${result}`);
    } catch (error) {
      console.error(`Failed to send message to ${username}: ${error.message}`);
    }
  });

}

async function sendMessage(to, access_token) {

  const body = new FormData();
  body.append('to', `/u/${to}`);
  body.append("subject", messageSubject);
  body.append("text", messageContent);

  const response = await fetch('https://oauth.reddit.com/api/compose', {
    method: 'POST',
    headers: {
      ...body.getHeaders(),
      'Authorization': `Bearer ${access_token}`,
    },
    body: body
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Failed to send message: ${response.status} ${response.statusText} - ${errorBody}`);
  }

  const data = await response.json();
  return data.success
}

async function getAccessToken() {
  const params = new URLSearchParams();
  params.append('grant_type', 'password');
  params.append('username', REDDIT_USER);
  params.append('password', REDDIT_PASS);

  const response = await fetch('https://www.reddit.com/api/v1/access_token', {
    method: 'POST',
    body: params,
    headers: {
      'Authorization': 'Basic ' + Buffer.from(`${REDDIT_CLIENT_ID}:${REDDIT_CLIENT_SECRET}`).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  if (!response.ok) {
    throw new Error(`Error getting access token: ${response.statusText}`);
  }


  const data = await response.json();
  console.log('access token retrieved');
  return data.access_token;
}

main()
