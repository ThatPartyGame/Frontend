import $ from "/modules/jquery.js"

import { with_magic, text_encoder, text_decoder, get_magic, get_string, await_event } from "/modules/Common.js"

const api_url = "ws://127.0.0.1:80/frontend";
const turn_urls = ["turn:turn1.smorsoft.com:3478", "stun:turn1.smorsoft.com"];

export { Main };

class Main {
	static #singleton = null;

	#web_socket;
	#web_rtc;

	static get singleton() {
		if (Main.#singleton == null) {
			Main.#singleton = new Main();
		}

		return Main.#singleton;
	}

	constructor() {
		if (Main.#singleton != null) {
			console.error("Multiple Main singletons");
			return;
		}

		this.#web_socket = new WebSocket(api_url);
		this.#web_socket.onerror = (e) => this.on_error(e);
		this.#web_socket.onclose = (e) => this.on_close(e);
	}

	on_error(e) {
		console.error(e);

	}

	on_close(e) {
		console.error(e);
	}

	async #onconnected() {
		return new Promise(resolve => this.#web_socket.onopen = () => resolve());
	}

	async #onmessage() {
		return new Promise(resolve => this.#web_socket.onmessage = (event) => resolve(event));
	}

	async #check_websocket() {
		if (this.#web_socket.readyState != WebSocket.OPEN) {
			await this.#onconnected();
		}
	}

	async check_lobby(lobby_id) {
		await this.#check_websocket();

		this.#web_socket.send(with_magic(0, text_encoder.encode(lobby_id)));
		var msg_ev = await this.#onmessage();
		console.log(msg_ev);
		var magic = await get_magic(msg_ev.data);
		var response = await get_string(msg_ev.data);
		if (magic < 0) {
			console.error("Failed to find lobby with status code: " + magic + ", and response: " + response);
			return false;
		}
		console.log(response);
		return JSON.parse(response);
	}

	async try_join(lobby_id) {
		await this.#check_websocket();

		this.#web_socket.send(with_magic(1, text_encoder.encode(lobby_id)));

		var msg_ev = await this.#onmessage();

		var magic = await get_magic(msg_ev.data);
		var response = await get_string(msg_ev.data);
		if (magic < 0) {
			console.error("Failed to join with status code: " + magic + ", and response: " + response);
			return false;
		}

		response = JSON.parse(response);
		this.#web_rtc = new WebRTC(lobby_id.toUpperCase(), response.unique_id);

		var offer = await this.#web_rtc.create_offer();

		console.log(JSON.stringify(offer));
		this.#web_socket.send(text_encoder.encode(JSON.stringify(offer)));



	}
}

class WebRTC {
	#peer;
	#turn_username;
	#unique_id;

	#local_ice_candidates;

	constructor(p_lobby_id, p_unique_id) {
		this.#turn_username = p_lobby_id.toUpperCase() + "." + p_unique_id;
		this.#unique_id = p_unique_id;

		this.#peer = new RTCPeerConnection({
			iceServers: [
				{
					urls: turn_urls,
					username: this.#turn_username,
					credential: this.#unique_id,
				}
			],

		});

		this.#peer.onicegatheringstatechange = (eve) => {
			console.log(eve);
		};
	}

	async onicegatheringstatechange() {
		return new Promise(resolve => this.#peer.onicegatheringstatechange = (event) => resolve(event));
	}

	async onicecandidate() {
		return new Promise(resolve => this.#peer.onicecandidate = (event) => resolve(event));
	}

	async create_offer() {
		return this.#peer.createOffer();
	}
}