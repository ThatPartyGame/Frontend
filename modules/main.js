import $ from "/modules/jquery.js"
import { awaitEvent } from "/modules/Common.js"

const api_url = "https://grad-api.smorsoft.com";
const turn_urls = ["turn:turn1.smorsoft.com:3478", "stun:turn1.smorsoft.com"];

var connection = null;

export { CheckLobby }

export function Join(lobbyId, username) {
	var check = CheckLobby(lobbyId);
	if (check == null) {
		console.error("Tried to join a non joinable lobby");
		return null
	}

	Connection.new(lobbyId, username);
}

export async function CheckStored() {
	var stored = Storage.Read();
	if (stored == null) {
		return null;
	}

	if (await CheckLobby(stored.lobbyId) == null) {
		return null;
	}

	return stored;
}


export const Magic = {
	Username: -1,
	SetPage: -2,
};

function CreateHTTPRequest(base_url, path, parameters) {
	var request = base_url + path;
	if (parameters.length > 0) {
		request += "?";
		parameters.forEach((parameter) => request += parameter.name + "=" + parameter.value + "&");

		request = request.substring(0, request.length - 1);
	}

	return request;
}

function Failed() {

}

async function CheckLobby(lobbyId) {
	try {
		return await $.ajax({
			url: CreateHTTPRequest(
				api_url,
				"/api/Lobby/CheckLobby",
				[
					{ name: "lobbyId", value: lobbyId },
				]
			),
			method: "GET",
		});
	} catch (e) {
		console.warn(e);
	}
}

class Connection {
	lobbyId;
	username;
	turnUsername;
	turnPassword;
	peer;
	channel;

	packet_callbacks = [];

	static async new(p_lobbyId, p_username) {
		var _connection = new Connection();

		var storedConnection = Storage.Read();
		if (storedConnection != null &&
			storedConnection.lobbyId != null &&
			storedConnection.username != null &&
			storedConnection.lobbyId.toUpperCase() == p_lobbyId.toUpperCase() &&
			storedConnection.username.toUpperCase() == p_username.toUpperCase()
		) {
			_connection.lobbyId = storedConnection.lobbyId;
			_connection.username = storedConnection.username;
			_connection.turnUsername = storedConnection.turnUsername;
			_connection.turnPassword = storedConnection.turnPassword;
			await _connection.connect();
		} else {
			_connection.lobbyId = p_lobbyId.toUpperCase();
			_connection.username = p_username;
			await _connection.join();
		}

		connection = _connection;
	}

	async join() {
		await $.ajax({
			url: CreateHTTPRequest(
				api_url,
				"/api/Lobby/Join",
				[
					{ name: "lobbyId", value: this.lobbyId },
					{ name: "name", value: this.username },
				]
			),
			method: "POST",
			success: (result) => {
				this.lobbyId = result.lobbyId;
				this.turnUsername = result.player.turnUsername;
				this.turnPassword = result.player.turnPassword;
			},
			error: (error) => {
				console.log(error);
				Failed();
			}
		});

		new Storage(this.lobbyId, this.username, this.turnUsername, this.turnPassword).Write();
		this.connect();
	}

	async connect() {
		this.peer = new RTCPeerConnection({
			iceServers: [
				{
					urls: turn_urls,
					username: this.turnUsername,
					credential: this.turnPassword,
				},
				// {
				// 	urls: ["stun:stun1.l.google.com:19302", "stun:stun3.l.google.com:19302"]
				// }
			]
		})

		this.channel = this.peer.createDataChannel("data", { negotiated: true, id: 1 });
		this.channel.addEventListener('message', this.on_packet.bind(this));

		await $.ajax({
			url: CreateHTTPRequest(
				api_url,
				"/api/Lobby/GetLobbySdp",
				[
					{ name: "lobbyId", value: this.lobbyId },
					{ name: "turnPassword", value: this.turnPassword },
				]
			),
			method: "GET",
			success: async (result) => {
				this.peer.setRemoteDescription({ type: "offer", sdp: result.session });

				for (const candidateSDP of result.iceCandidates) {
					var candidate = new RTCIceCandidate({
						sdpMid: candidateSDP.media,
						sdpMLineIndex: candidateSDP.index,
						candidate: candidateSDP.name
					});
					await this.peer.addIceCandidate(candidate);
				}
			},
			error: (error) => {
				console.log(error);
				alert("Unable to join :(");
			}
		});

		var candidates = [];
		this.peer.onicecandidate = (e) => {
			if (e.candidate == null) return
			candidates.push({
				media: e.candidate.sdpMid,
				index: e.candidate.sdpMLineIndex,
				name: e.candidate.candidate
			})
		};

		var answer = await this.peer.createAnswer();
		await this.peer.setLocalDescription(answer);

		while (true) {
			await awaitEvent(this.peer, 'icegatheringstatechange');
			if (this.peer.iceGatheringState != "complete") {
				continue;
			} else {
				break;
			}
		}

		var localSdp = {
			session: answer.sdp,
			iceCandidates: candidates,
		};

		await $.ajax({
			url: CreateHTTPRequest(
				api_url,
				"/api/Lobby/SetPlayerSdp",
				[
					{ name: "lobbyId", value: this.lobbyId },
					{ name: "turnPassword", value: this.turnPassword },
				]
			),
			type: "PATCH",
			contentType: "application/json",
			data: JSON.stringify(localSdp),
			success: (result) => {
				console.log("Player SDP set");
				console.log(result);
			},
			error: (error) => {
				console.log(error);
				Failed();
			}
		})

	}

	on_connection_state_change() {
		console.log("Peer connection state changed to: " + this.peer.connectionState);
		switch (this.peer.connectionState) {
			case "connected":
				break;
			case "failed":
				Failed();
				break;
			default:
				break;
		}
	}

	on_packet(in_packet) {
		var magic = new DataView(in_packet.data, 0, 4).getInt32(0, true);
		var packet = new DataView(in_packet.data, 4);
		console.log("Magic: " + magic.toString() + ", Packet: " + new TextDecoder("utf-8").decode(packet));

		switch (magic) {
			case Magic.Username:
				this.prepend_and_send(Magic.Username, new TextEncoder().encode(this.username));
				break;
			case Magic.SetPage:
				var page = new TextDecoder("utf-8").decode(packet);
				console.log("Set page to: " + page);
				// loadPage(page);
				break;
			default:
				for (const callback of this.packet_callbacks) {
					if (callback != null) {
						callback(magic, packet);
					}
				}
				break;
		}
	}

	send_packet(packet) {
		this.channel.send(packet);
	}

	send_magic(magic) {
		var packet = new ArrayBuffer(4);
		new DataView(packet).setInt32(0, magic, true);
		this.send_packet(packet);
	}

	prepend_and_send(magic, in_packet) {
		var packet = new ArrayBuffer(4 + in_packet.byteLength);
		var dataView = new DataView(packet);
		dataView.setInt32(0, magic, true);
		new Uint8Array(packet).set(new Uint8Array(in_packet), 4);

		this.send_packet(packet);
	}
}

class Storage {
	lobbyId;
	username;
	turnUsername;
	turnPassword;

	constructor(p_lobbyId, p_username, p_turnUsername, p_turnPassword) {
		this.lobbyId = p_lobbyId;
		this.username = p_username;
		this.turnUsername = p_turnUsername;
		this.turnPassword = p_turnPassword;
	}

	static Read() {
		var json = localStorage.getItem("connection");

		if (json != null) {
			var data = JSON.parse(json);
			if (data.lobbyId != null &&
				data.username != null &&
				data.turnUsername != null &&
				data.turnPassword != null
			) {
				return new Storage(data.lobbyId, data.username, data.turnUsername, data.turnPassword);
			}
		}
		return null;
	}

	Write() {
		if (connection == null) {
			return;
		}

		localStorage.setItem("connection", JSON.stringify(this));

	}

	static Delete() {
		if (localStorage.getItem("connection") == null) {
			return;
		}

		localStorage.removeItem("connection");
	}
}