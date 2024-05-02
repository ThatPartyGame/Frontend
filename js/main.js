const api_url = "https://grad-api.smorsoft.com";
const turn_urls = ["turn:turn1.smorsoft.com:3478"];

document.onload = loadPage("html/home.html");

var peer;
var lobbyId;
var turnUsername;
var turnPassword;
var channel;

function CreateHTTPRequest(base_url, path, parameters) {
	var request = base_url + path;
	if (parameters.length > 0) {
		request += "?";
		parameters.forEach((parameter) => request += parameter.name + "=" + parameter.value + "&");

		request = request.substring(0, request.length - 1);
	}

	return request;
}


class Player {
	constructor() {

	}


}

async function initialize_peer(lobbySdp) {
	console.log(lobbySdp);

	peer = new RTCPeerConnection({
		iceServers: [
			{
				urls: turn_urls,
				username: turnUsername,
				credential: turnPassword,
			}
		]
	});

	channel = peer.createDataChannel("data", { negotiated: true, id: 1 });

	channel.addEventListener("message", (event) => {
		var data = event.data;
		alert(data);
	});

	peer.addEventListener('connectionstatechange', (event) => {
		switch (peer.connectionState) {
			case "connected":
				alert("Connected!");
				break;
			default:
				break;
		}
	});

	peer.setRemoteDescription({ type: "offer", sdp: lobbySdp.session });

	lobbySdp.iceCandidates.forEach((candidateSDP) => {
		var candidate = new RTCIceCandidate({
			sdpMid: candidateSDP.media,
			sdpMLineIndex: candidateSDP.index,
			candidate: candidateSDP.name
		});
		peer.addIceCandidate(candidate);
	});

	var answer = await peer.createAnswer();

	peer.setLocalDescription(answer);

	$.ajax({
		url: CreateHTTPRequest(
			api_url,
			"/api/Lobby/SetPlayerSdp",
			[
				{ name: "lobbyId", value: lobbyId },
				{ name: "turnPassword", value: turnPassword },
			]
		),
		type: "PATCH",
		contentType: "application/json",
		data: JSON.stringify({
			session: answer.sdp,
			iceCandidates: [
				{
					media: "string",
					index: 0,
					name: "string"
				}
			],
		}),
		success: function (result) {
			console.log(result);
		},
		error: function (error) {
			console.log(error);
			alert("Error setting player SDP");
		}
	})
}