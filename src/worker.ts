const { KVNamespace } = require('@cloudflare/workers-kv');

// Define interface and array to hold chat messages
const messages = [];
const kvNamespace = new KVNamespace('chat_messages');

// Event listener for incoming requests
addEventListener('fetch', (event) => {
	event.respondWith(handleRequest(event.request));
});

// Function to handle incoming requests
async function handleRequest(request) {
	if (request.method === 'POST' && new URL(request.url).pathname === '/chat') {
		return handleChatPost(request);
	} else {
		return serveChatPage();
	}
}

// Function to serve the chat page
async function serveChatPage() {
	const messagesHtml = messages.map((msg) => `<p>${msg.timestamp}: ${msg.message}</p>`).join('');
	const htmlResponse = `
    <html>
    <head>
      <title>Chat</title>
    </head>
    <body>
      <h1>Chat Messages</h1>
      <div id="messages">
        ${messagesHtml}
      </div>
      <form action="/chat" method="post">
        <label for="message">Message:</label>
        <input type="text" id="message" name="message" required />
        <button type="submit">Send</button>
      </form>
    </body>
    </html>
  `;

	return new Response(htmlResponse, {
		headers: {
			'Content-Type': 'text/html',
		},
	});
}

// Function to handle chat message submission
async function handleChatPost(request) {
	const formData = await request.formData();
	const message = formData.get('message') || '';
	const timestamp = new Date().toISOString();
	messages.push({ message: message.toString(), timestamp });

	// Store messages in KV
	await kvNamespace.put('messages', JSON.stringify(messages));

	return new Response('', {
		status: 303,
		headers: {
			Location: '/',
		},
	});
}
