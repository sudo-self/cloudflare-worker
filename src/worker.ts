/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export interface Env {
	// Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
	// MY_KV_NAMESPACE: KVNamespace;
	//
	// Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
	// MY_DURABLE_OBJECT: DurableObjectNamespace;
	//
	// Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
	// MY_BUCKET: R2Bucket;
	//
	// Example binding to a Service. Learn more at https://developers.cloudflare.com/workers/runtime-apis/service-bindings/
	// MY_SERVICE: Fetcher;
	//
	// Example binding to a Queue. Learn more at https://developers.cloudflare.com/queues/javascript-apis/
	// MY_QUEUE: Queue;
}

addEventListener('fetch', (event) => {
	event.respondWith(handleRequest(event.request));
});

interface ChatMessage {
	message: string;
	timestamp: string;
}

const messages: ChatMessage[] = [];

async function handleRequest(request: Request): Promise<Response> {
	if (request.method === 'POST' && new URL(request.url).pathname === '/chat') {
		return handleChatPost(request);
	} else {
		return serveChatPage();
	}
}

async function serveChatPage(): Promise<Response> {
	const messagesHtml = messages.map((msg) => `<p>${msg.timestamp}: ${msg.message}</p>`).join('');
	const htmlResponse = `
		  <html>
		  <head>
			<style>
			body{
			background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' width='1174' height='682' viewBox='0 0 1174 682' version='1.1'%3e%3cpath d='M 593.750 499.732 C 596.087 499.943, 599.913 499.943, 602.250 499.732 C 604.587 499.522, 602.675 499.349, 598 499.349 C 593.325 499.349, 591.413 499.522, 593.750 499.732 M 522.395 537.250 C 519.864 540.688, 517.158 544.850, 516.382 546.500 C 515.549 548.272, 515.489 548.728, 516.236 547.614 C 516.931 546.577, 519.843 542.414, 522.706 538.364 C 529.041 529.404, 528.802 528.547, 522.395 537.250 M 672.660 540.250 C 673.087 540.938, 674.914 543.949, 676.719 546.941 C 678.523 549.934, 680 551.945, 680 551.410 C 680 550.265, 673.069 539, 672.364 539 C 672.099 539, 672.232 539.563, 672.660 540.250 M 686.070 572.770 C 686.032 574.568, 684.875 578.808, 683.500 582.192 C 680.894 588.606, 680.351 590.717, 682.065 587.777 C 684.773 583.130, 687.697 573.375, 686.944 571.500 C 686.288 569.866, 686.128 570.098, 686.070 572.770 M 693 576.161 C 693 576.414, 691.656 581.994, 690.013 588.561 C 686.429 602.883, 686.215 609.351, 689.117 615.526 C 693.240 624.297, 698.603 626.423, 720.500 627.967 C 730.475 628.671, 738.002 629.649, 738.714 630.333 C 741.635 633.141, 738.357 633.947, 719.959 634.939 C 709.806 635.486, 699.700 636.450, 697.500 637.081 C 689.701 639.317, 681.491 644.285, 675.500 650.394 C 669.097 656.922, 662 669.032, 662 673.429 L 662 676.065 716.847 675.783 C 759.471 675.563, 772.036 675.216, 773.229 674.226 C 775.522 672.322, 777.384 658.256, 776.683 648.133 C 774.451 615.908, 752.711 588.685, 721.500 579.035 C 715.229 577.096, 693 574.855, 693 576.161 M 443.667 588.667 C 443.300 589.033, 443.071 592.296, 443.157 595.917 L 443.315 602.500 443.964 595.500 C 444.668 587.908, 444.658 587.676, 443.667 588.667 M 627.776 626.733 C 630.128 626.945, 633.728 626.942, 635.776 626.727 C 637.824 626.512, 635.900 626.339, 631.500 626.343 C 627.100 626.346, 625.424 626.522, 627.776 626.733 M 513.500 627.958 C 503.050 628.256, 493.938 628.864, 493.250 629.309 C 491.664 630.335, 491.638 633.238, 493.200 634.800 C 494.540 636.140, 506.128 636.268, 515 635.042 C 519.336 634.443, 517.574 634.252, 506.677 634.141 C 494.203 634.014, 492.886 633.833, 493.183 632.286 C 493.382 631.254, 494.905 630.270, 497.007 629.814 C 498.928 629.397, 524.575 628.668, 554 628.196 C 605.416 627.369, 606.039 627.338, 570 627.376 C 549.375 627.397, 523.950 627.659, 513.500 627.958 M 525.083 635.362 C 525.313 635.561, 543.950 635.938, 566.500 636.201 C 589.050 636.464, 602.325 636.360, 596 635.971 C 584.077 635.237, 524.349 634.724, 525.083 635.362 M 620.728 636.722 C 622.503 636.943, 625.653 636.946, 627.728 636.730 C 629.802 636.513, 628.350 636.333, 624.500 636.328 C 620.650 636.324, 618.952 636.501, 620.728 636.722' stroke='none' fill='%23fcb54c' fill-rule='evenodd'/%3e%3cpath d='M 578 501.540 C 575.525 502.378, 570.623 503.990, 567.106 505.122 C 556.624 508.496, 548.749 512.740, 540.046 519.703 C 528.365 529.049, 517.986 542.760, 512.948 555.500 C 511.643 558.800, 510.448 561.685, 510.293 561.912 C 510.137 562.138, 507.767 561.103, 505.026 559.610 C 494.926 554.113, 482.885 552.771, 473.290 556.072 C 459.028 560.979, 451.382 568.614, 445.207 584.116 C 444.634 585.555, 444.240 591.068, 444.332 596.367 C 444.516 606.947, 445.117 605.987, 438 606.489 C 433.256 606.823, 422.481 610.795, 416.258 614.504 C 409.244 618.684, 403.039 624.347, 398.229 630.956 C 394.398 636.221, 389.011 649.635, 388.171 656 C 387.137 663.841, 387.457 672.857, 388.819 674.219 C 389.844 675.244, 415.792 675.556, 518.800 675.780 C 589.585 675.934, 648.469 675.823, 649.654 675.535 C 653.784 674.529, 657.197 659.146, 655.054 651.197 C 653.585 645.746, 647.453 639.468, 642.222 638.060 C 638.129 636.958, 537.463 635.250, 510.187 635.820 C 494.211 636.154, 492 635.679, 492 631.913 C 492 630.899, 492.835 629.623, 493.857 629.077 C 494.968 628.482, 514.939 627.859, 543.607 627.524 C 626.558 626.555, 642.574 626.142, 645.630 624.893 C 653.404 621.713, 655.940 620.402, 661.242 616.818 C 668.825 611.692, 674.062 604.374, 680.306 590.178 C 687.513 573.790, 687.462 569.704, 679.836 553.096 C 673.652 539.627, 663.209 526.571, 651.872 518.133 C 644.601 512.721, 633.096 506.800, 625.500 504.561 C 622.200 503.589, 618.150 502.349, 616.500 501.806 C 614.850 501.264, 606.525 500.639, 598 500.418 C 585.922 500.106, 581.507 500.353, 578 501.540' stroke='none' fill='%23f58a23' fill-rule='evenodd'/%3e%3c/svg%3e");
			background-repeat: no-repeat;
			background-size: 80%;
			background-attachment: fixed;
			}
			</style>
			<title>Chat</title>
			<style>
			body {
			  font-family: Arial, sans-serif;
			  background-color: #01153e;
			  margin: 0;
			  padding: 0;
			}
			#container {
			  max-width: 600px;
			  margin: 20px auto;
			  padding: 20px;
			  background-color: #fff;
			  border-radius: 8px;
			  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
			}
			h1 {
			  font-size: 24px;
			  margin-bottom: 20px;
			}
			#messages {
			  margin-bottom: 20px;
			}
			.message {
			  background-color: #f9f9f9;
			  padding: 10px;
			  border-radius: 8px;
			  margin-bottom: 10px;
			}
			.message .timestamp {
			  font-size: 12px;
			  color: #666;
			  margin-bottom: 5px;
			}
			form {
			  display: flex;
			  margin-bottom: 20px;
			}
			label {
			  font-weight: bold;
			  margin-right: 10px;
			}
			input[type="text"] {
			  flex: 1;
			  padding: 10px;
			  border-radius: 4px;
			  border: 1px solid #ccc;
			}
			button[type="submit"] {
			  padding: 10px 20px;
			  border-radius: 4px;
			  background-color: #01153e;
			  color: #fff;
			  border: none;
			  cursor: pointer;
			}
			button[type="submit"]:hover {
			  background-color: #eda740;
			}
			</style>
		  </head>
		  <body>
			<div id="container">
			<h1>serverless messenger</h1>
			<div id="messages">
			  ${messagesHtml}
			</div>
			<form action="/chat" method="post">
			  <label for="message"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 128 128"><linearGradient id="deviconCloudflareworkers0" x1="-.556" x2="-.628" y1="128.705" y2="128.977" gradientTransform="matrix(155.9359 0 0 -364.3 119.128 47001.098)" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#eb6f07"/><stop offset="1" stop-color="#fab743"/></linearGradient><path fill="url(#deviconCloudflareworkers0)" d="M33.882 9.694L48.491 36.05L35.075 60.199a7.75 7.75 0 0 0 0 7.543l13.416 24.209l-14.609 26.356a15.501 15.501 0 0 1-6.559-6.172L4.068 71.737a15.563 15.563 0 0 1 0-15.503l23.255-40.398a15.501 15.501 0 0 1 6.559-6.142"/><linearGradient id="deviconCloudflareworkers1" x1="-.594" x2="-.715" y1="129.358" y2="129.519" gradientTransform="matrix(149.7049 0 0 -194.8 131.59 25305.098)" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#d96504"/><stop offset="1" stop-color="#d96504" stop-opacity="0"/></linearGradient><path fill="url(#deviconCloudflareworkers1)" d="M35.075 60.229a7.75 7.75 0 0 0 0 7.513l13.416 24.209l-14.609 26.356a15.501 15.501 0 0 1-6.559-6.172L4.068 71.737c-1.848-3.19 8.497-7.006 31.007-11.478z" opacity=".7"/><linearGradient id="deviconCloudflareworkers2" x1="-2.234" x2="-2.109" y1="128.901" y2="128.689" gradientTransform="matrix(95.8 0 0 -101.1 239.4 13048.3)" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#eb6f07"/><stop offset="1" stop-color="#eb720a" stop-opacity="0"/></linearGradient><path fill="url(#deviconCloudflareworkers2)" d="m35.373 12.347l13.118 23.702l-2.176 3.786l-11.568-19.587c-3.339-5.456-8.437-2.624-14.818 8.408l.954-1.64l6.44-11.18a15.51 15.51 0 0 1 6.499-6.142l1.521 2.653z" opacity=".5"/><linearGradient id="deviconCloudflareworkers3" x1="-.847" x2="-.919" y1="128.688" y2="128.96" gradientTransform="matrix(207.975 0 0 -375 275.025 48376)" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#ee6f05"/><stop offset="1" stop-color="#fab743"/></linearGradient><path fill="url(#deviconCloudflareworkers3)" d="m100.665 15.835l23.255 40.398a15.485 15.485 0 0 1 0 15.503l-23.255 40.398a15.504 15.504 0 0 1-13.416 7.752H63.994l28.92-52.145a7.75 7.75 0 0 0 0-7.513L63.994 8.084h23.255a15.502 15.502 0 0 1 13.416 7.751"/><linearGradient id="deviconCloudflareworkers4" x1="-2.602" x2="-2.229" y1="128.679" y2="128.977" gradientTransform="matrix(118.9101 0 0 -375.1 361.09 48388.902)" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#d96504" stop-opacity=".8"/><stop offset=".498" stop-color="#d96504" stop-opacity=".2"/><stop offset="1" stop-color="#d96504" stop-opacity="0"/></linearGradient><path fill="url(#deviconCloudflareworkers4)" d="m86.057 119.708l-22.957.208l27.787-52.413a8.053 8.053 0 0 0 0-7.573L63.1 8.084h5.247l29.158 51.608a8.048 8.048 0 0 1-.03 7.99a4670.283 4670.283 0 0 0-18.693 32.796c-5.665 9.957-3.22 16.367 7.275 19.23"/><linearGradient id="deviconCloudflareworkers5" x1="-.561" x2="-.634" y1="128.688" y2="128.96" gradientTransform="matrix(201.2571 0 0 -375 180.743 48376)" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#ffa95f"/><stop offset="1" stop-color="#ffebc8"/></linearGradient><path fill="url(#deviconCloudflareworkers5)" d="M40.739 119.886c-2.385 0-4.77-.566-6.857-1.58l28.681-51.727a5.353 5.353 0 0 0 0-5.188L33.882 9.694a15.492 15.492 0 0 1 6.857-1.61h23.255l28.92 52.145a7.75 7.75 0 0 1 0 7.513l-28.92 52.145H40.739z"/><linearGradient id="deviconCloudflareworkers6" x1="-2.816" x2="-2.552" y1="128.861" y2="128.719" gradientTransform="matrix(109.2571 0 0 -375 364.743 48376)" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff" stop-opacity=".5"/><stop offset="1" stop-color="#fff" stop-opacity=".1"/></linearGradient><path fill="url(#deviconCloudflareworkers6)" d="M90.886 61.391L61.311 8.084h2.683l28.92 52.145a7.75 7.75 0 0 1 0 7.513l-28.92 52.145h-2.683l29.576-53.308a5.35 5.35 0 0 0-.001-5.188" opacity=".6"/><linearGradient id="deviconCloudflareworkers7" x1="-2.34" x2="-2.001" y1="128.779" y2="128.952" gradientTransform="matrix(107.2571 0 0 -371.4 274.743 47913.2)" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff" stop-opacity=".5"/><stop offset="1" stop-color="#fff" stop-opacity=".1"/></linearGradient><path fill="url(#deviconCloudflareworkers7)" d="M62.563 61.391L33.882 9.694c.894-.477 1.968-.835 2.981-1.133c6.321 11.359 15.652 28.592 28.025 51.668a7.75 7.75 0 0 1 0 7.513L36.416 119.29c-1.014-.298-1.55-.507-2.504-.954l28.622-51.727a5.353 5.353 0 0 0 0-5.188z" opacity=".6"/></svg></label>
			  <input type="text" id="message" name="message" placeholder="enter messsge here" required />
			  <button type="submit">Send</button>
			</form>
			</div>
		  </body>
		  </html>
		`;

	return new Response(htmlResponse, {
		headers: {
			'Content-Type': 'text/html',
		},
	});
}

async function handleChatPost(request: Request): Promise<Response> {
	const formData = await request.formData();
	const message = formData.get('message') || '';
	const timestamp = new Date().toISOString();
	messages.push({ message: message.toString(), timestamp });

	return serveChatPage();
}
