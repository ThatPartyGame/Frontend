function CreateHTTPRequest(base_url, path, parameters) {
	var request = base_url + path;
	if (parameters.length > 0) {
		request += "?";
		parameters.forEach((parameter) => request += parameter.name + "=" + parameter.value + "&");

		request = request.substring(0, request.length - 1);
	}

	return request;
}

const packet_event = new CustomEvent("packet",);

const Magic = {
	Username: -1,
	SetPage: -2,
};

var player;

class Connection {
	lobbyId;
	turnPassword;
	peer;
	channel;
	answer;
	candidates = [];

	on_packet_callback

	constructor(lobbyId, turnUsername, turnPassword, on_packet_callback) {
		this.lobbyId = lobbyId;
		this.turnPassword = turnPassword;
		this.on_packet_callback = on_packet_callback;

		this.init(this.lobbyId, turnUsername, this.turnPassword);
	}

	async init(lobbyId, turnUsername, turnPassword) {
		this.peer = new RTCPeerConnection({
			iceServers: [
				{
					urls: turn_urls,
					username: turnUsername,
					credential: turnPassword,
				}
				// {
				// 	urls: ["stun:stun1.l.google.com:19302", "stun:stun3.l.google.com:19302"]
				// }
			]
		});

		console.log(this);


		this.channel = this.peer.createDataChannel("data", { negotiated: true, id: 1 });
		this.channel.addEventListener('message', this.on_packet.bind(this));
		this.peer.addEventListener('connectionstatechange', this.on_connection_state_change.bind(this));
		this.peer.addEventListener('icegatheringstatechange', this.on_ice_gathering_state_change.bind(this));

		this.peer.onicecandidate = (e) => {
			if (e.candidate != null) {
				this.candidates.push({
					media: e.candidate.sdpMid,
					index: e.candidate.sdpMLineIndex,
					name: e.candidate.candidate
				});
			}
		};

		await $.ajax({
			url: CreateHTTPRequest(
				api_url,
				"/api/Lobby/GetLobbySdp",
				[
					{ name: "lobbyId", value: lobbyId },
					{ name: "turnPassword", value: turnPassword },
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
			error: function (error) {
				console.log(error);
				alert("Unable to join :(");
			}
		});

		this.answer = await this.peer.createAnswer();
		await this.peer.setLocalDescription(this.answer);
	}

	async on_ice_gathering_state_change() {
		if (this.peer.iceGatheringState == "complete") {
			var localSdp = {
				session: this.answer.sdp,
				iceCandidates: this.candidates,
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
					alert("Error setting player SDP");
				}
			})

		}
	}

	on_connection_state_change(_) {
		switch (this.peer.connectionState) {
			case "connected":

				break;
			default:
				break;
		}
	}

	on_packet(packet) {
		var magic = new DataView(packet.data, 0, 4).getInt32(0, true);
		var without_magic = new DataView(packet.data, 4);
		this.on_packet_callback(magic, without_magic);
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

class Player {
	lobbyId;
	username;
	turnUsername;
	turnPassword;

	connection;

	constructor(init_lobbyId, init_playerName) {
		var check = Player.checkLobby(init_lobbyId);
		if (check == null) {
			console.error("Tried to join a non joinable lobby");
		}

		var stored = Player.readFromLocalStorage();
		if (stored != null &&
			stored.lobbyId != null &&
			stored.username != null &&
			stored.lobbyId.toUpperCase() == init_lobbyId.toUpperCase() &&
			stored.username.toUpperCase() == init_playerName.toUpperCase()) {
			this.lobbyId = stored.lobbyId;
			this.username = stored.username;
			this.turnUsername = stored.turnUsername;
			this.turnPassword = stored.turnPassword;
			this.connection = new Connection(this.lobbyId, this.turnUsername, this.turnPassword, this.on_packet.bind(this));
		} else {
			this.join(init_lobbyId, init_playerName).then((_) => {
				this.connection = new Connection(this.lobbyId, this.turnUsername, this.turnPassword, this.on_packet.bind(this));
			});
		}

		console.log(this);
		player = this;
	}

	saveToLocalStorage() {
		localStorage.setItem("player", JSON.stringify({
			lobbyId: this.lobbyId,
			username: this.username,
			turnUsername: this.turnUsername,
			turnPassword: this.turnPassword,
		}));
	}

	static readFromLocalStorage() {
		var json = localStorage.getItem("player");

		if (json != null) {
			return JSON.parse(json);
		}
	}

	static async checkLobby(lobbyIdToCheck) {
		try {
			var result = await $.ajax({
				url: CreateHTTPRequest(
					api_url,
					"/api/Lobby/CheckLobby",
					[
						{ name: "lobbyId", value: lobbyIdToCheck },
					]
				),
				method: "GET",
			});
			console.log(result);
			return result;
		} catch (e) {

		}
	}

	async join(init_lobbyId, init_playerName) {
		await $.ajax({
			url: CreateHTTPRequest(
				api_url,
				"/api/Lobby/Join",
				[
					{ name: "lobbyId", value: init_lobbyId },
					{ name: "name", value: init_playerName },
				]
			),
			method: "POST",
			success: (result) => {
				console.log(result);
				this.lobbyId = result.lobbyId;
				this.username = result.player.name;
				this.turnUsername = result.player.turnUsername;
				this.turnPassword = result.player.turnPassword;
			},
			error: function (error) {
				console.log(error);
				alert("Unable to join :(");
			}
		});

		this.saveToLocalStorage();
	}

	on_packet(magic, packet) {
		switch (magic) {
			case Magic.Username:
				this.connection.prepend_and_send(Magic.Username, new TextEncoder().encode(this.username).buffer);
				break;
		}
	}
}

