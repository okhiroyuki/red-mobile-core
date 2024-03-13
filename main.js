const cordova = require("cordova-bridge");
const http = require("node:http");
const express = require("express");
const cors = require("cors");
const RED = require("node-red");
const bodyParser = require("body-parser");
const bcryptjs = require("bcryptjs");
const mobile = require("./mobile");
const flows = require("./flows");
const env = require("./env");

const wsServer = require("./websocket/init");

const app = express();
env.init(cordova);

const uploadDir = `${cordova.app.datadir()}/uploads/`;
flows.clear(uploadDir);

let isStarted = false;
// 静的コンテンツのルートを追加
app.use(cors());
app.use("/", express.static("public"));
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));
app.use(bodyParser.json({ limit: "10mb", extended: true }));

app.get("/mobile", (req, res) => {
	mobile.responseGet(req, res);
});

app.post("/mobile", (req, res) => {
	mobile.responsePost(req, res);
});

app.post("/upload", (req, res) => {
	flows.upload(req, res);
});

// サーバの生成
const server = http.createServer(app);
// eslint-disable-next-line no-unused-vars
server.on("error", (err) => {
	cordova.channel.send(JSON.stringify({ method: "error" }));
});

function start(user, pass, port, wsport) {
	isStarted = true;
	mobile.init(cordova);
	flows.init(user, pass, port);
	env.set();
	const settings = {
		httpAdminRoot: "/red",
		httpNodeRoot: "/api",
		userDir: `${cordova.app.datadir()}/node-red/`,
		nodesDir: `${cordova.app.datadir()}/node-red/nodes`,
		nodesExcludes: [
			"90-exec.js",
			"node-red-node-tail",
			"10-file.js",
			"23-watch.js",
		],
		redMobilePort: port,
		redMobileAccessKey: mobile.getBcryptKey(),
		redMobileWsPort: wsport,
		apiMaxLength: "10mb",
		contextStorage: {
			default: "memoryOnly",
			memoryOnly: { module: "memory" },
			file: { module: "localfilesystem" },
		},
		editorTheme: {
			projects: {
				// To enable the Projects feature, set this value to true
				enabled: false,
			},
		},
		externalModules: {
			palette: {
				allowInstall: false,
			},
		},
		logging: {
			console: {
				level: "info",
				metrics: false,
				audit: false,
			},
			myCustomLogger: {
				level: "error",
				metrics: true,
				handler() {
					return (msg) => {
						// eslint-disable-next-line no-empty
						if (msg.event?.includes("runtime.memory")) {
						} else {
							cordova.channel.send(JSON.stringify({ method: "log", log: msg }));
						}
					};
				},
			},
		},
		functionGlobalContext: {}, // グローバルコンテキストを有効化,
	};

	if (pass !== undefined) {
		settings.adminAuth = {
			type: "credentials",
			users: [
				{
					username: user,
					password: bcryptjs.hashSync(pass, 8),
					permissions: "*",
				},
			],
		};
	}

	// サーバと設定とランタイムの初期化
	RED.init(server, settings);

	// エディタUIのルートを '/red' に指定
	app.use(settings.httpAdminRoot, RED.httpAdmin);

	// HTTP node UIのルートを '/api' に指定
	app.use(settings.httpNodeRoot, RED.httpNode);

	wsServer.listen(wsport);

	// eslint-disable-next-line no-unused-vars
	server.listen(port, (err) => {
		// eslint-disable-next-line no-unused-vars
		RED.start().then(() => {
			cordova.channel.send(JSON.stringify({ method: "started" }));
		});
	});
}

function listenerCallback(_msg) {
	const msg = _msg;
	if (msg && msg.method !== undefined) {
		if (msg.method === "start") {
			if (!isStarted) {
				start(msg.username, msg.password, msg.port, msg.wsport);
			}
		} else if (msg.method === "check") {
			msg.payload = isStarted;
			cordova.channel.send(JSON.stringify(msg));
		} else if (msg.method === "ws-serial") {
			wsServer.sendSerial(msg);
		} else if (msg.method === "ws-ble") {
			wsServer.sendBle(msg);
		} else if (msg.method === "ws-compass") {
			wsServer.sendCompass(msg);
		} else if (msg.method === "ws-geolocation") {
			wsServer.sendGeolocation(msg);
		} else if (msg.method === "ws-motion") {
			wsServer.sendMotion(msg);
		} else if (msg.method === "ws-magnetic") {
			wsServer.sendMagnetic(msg);
		} else if (msg.method === "ws-gyroscope") {
			wsServer.sendGyroscope(msg);
		} else if (msg.method === "ws-light") {
			wsServer.sendLight(msg);
		} else if (msg.method === "ws-proximity") {
			wsServer.sendProximity(msg);
		} else if (msg.method === "ws-nfc") {
			wsServer.sendNFC(msg);
		} else if (msg.method === "ws-fcm") {
			wsServer.sendFCM(msg);
		} else if (msg.method === "ws-firebase-token") {
			wsServer.sendFirebaseToken(msg);
		} else {
			mobile.callback(msg);
		}
	}
}

cordova.channel.on("message", listenerCallback);
