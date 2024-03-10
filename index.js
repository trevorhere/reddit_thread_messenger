require('dotenv').config();
const snoowrap = require('snoowrap');
const { URLSearchParams } = require('url');
const FormData = require('form-data');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const r = new snoowrap({
  userAgent: 'reddit-app:v0.1 (by /u/sviribo)',
  clientId: process.env.REDDIT_CLIENT_ID,
  clientSecret: process.env.REDDIT_CLIENT_SECRET,
  username: process.env.REDDIT_USER,
  password: process.env.REDDIT_PASS,
});

const subredditName = 'guns'; // Example: 'test'
const threadId = '17qnvcp'; // Example: 't3_jfzv7'
const messageSubject = 'test';
const messageContent = `hey, there.

sorry to bug you, just wanted to ask a quick question if that's alright.. 

i'm building a small electronic device that magnetically attaches to any kind of firearm.  The device notifies the firearm owner if the firearm has been moved by text and/or phone call, guaranteeing the safety and security of firearms.

after reading a few of your recent comments, it looks like you might be able to give insight on the validity of this product. I would love to hear your thoughts if you have them or, if you're interested we could send you a device to test out?

thanks for your time, and have a good one!
` ;

/// 17qnvcp
async function main() {
  const usernames = await getUsersFromPost(threadId);
  console.log(`retrieved ${usernames.size} usernames`);
  const token = await getAccessToken();
  // let set = new Set()
  // set.add('tr3vor_lan3')
  const result = await sendMessages(usernames, token);
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
  params.append('username', process.env.REDDIT_USER);
  params.append('password', process.env.REDDIT_PASS);

  const response = await fetch('https://www.reddit.com/api/v1/access_token', {
    method: 'POST',
    body: params,
    headers: {
      'Authorization': 'Basic ' + Buffer.from(`${process.env.REDDIT_CLIENT_ID}:${process.env.REDDIT_CLIENT_SECRET}`).toString('base64'),
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
