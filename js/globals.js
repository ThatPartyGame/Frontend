const api_url = "https://grad-api.smorsoft.com";
const turn_urls = ["turn:turn1.smorsoft.com:3478", "stun:turn1.smorsoft.com"];

const encoder = new TextEncoder();
const decoder = new TextDecoder("utf-8");

function encode_text(text) {
	return encoder.encode(text).buffer;
}

function decode_text(buffer) {
	return decoder.decode(buffer);
}

const Magic = {
	Username: -1,
	SetPage: -2,
	SetTextContent: -3,
};

const BingoMagic = {
	Start: 0,
	Predictions: 1,
	TextPrompt: 2,
	TextPromptAnswer: 3,
	TextPromptChoice: 4,
};