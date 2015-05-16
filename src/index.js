'use strict';

let request = require('request');
let URI = require('URIjs');
let decrypt = require('./decrypt.js');

const API_URL_DEFAULT = 'https://external.api.yle.fi/v1/';
const EVENT_TEMPORAL_STATUS_CURRENTLY = 'currently';
const EVENT_TYPE_ONDEMAND_PUBLICATION = 'OnDemandPublication';

class yleApi {
	constructor(apiAuth, apiUrl = API_URL_DEFAULT) {
		this.appId = apiAuth.appId;
		this.appKey = apiAuth.appKey;
		this.decryptKey = apiAuth.decryptKey;
		this.apiUrl = API_URL_DEFAULT;
	}

	getProgram(id, callback) {
		let url =
			URI(this.apiUrl)
				.segment('programs')
				.segment('items')
				.segment(id)
				.suffix('json')
				.query({ app_id: this.appId,
				         app_key: this.appKey })
				.toString();

		request
			.get({url}, (err, response, body) => {
				let {statusCode, statusMessage} = response;

				if(statusCode != 200) {
					callback(`${statusCode} ${statusMessage}`, null);
				} else {
					let {apiVersion, meta, data} = JSON.parse(body);
					callback(null, data);
				}
			});
	}

	findPlayableMedia(id, callback) {
		this.getProgram(id, (err, program) => {
			if(program && program.publicationEvent !== undefined) {
				for (let event of program.publicationEvent) {
					if(event.temporalStatus === EVENT_TEMPORAL_STATUS_CURRENTLY &&
					   event.type === EVENT_TYPE_ONDEMAND_PUBLICATION) {
						return callback(null, event.media);
					}
				}

				callback(err, null);
			} else {
				callback('No matches', null);
			}
		});
	}

	getPlayouts(programId, callback) {
		this.findPlayableMedia(programId, (err, media) => {
			if(err) {
				return callback(err, null);
			} else {
				let url =
					URI(this.apiUrl)
						.segment('media')
						.segment('playouts')
						.suffix('json')
						.query({ app_id: this.appId,
						         app_key: this.appKey,
						         program_id: programId,
						         media_id: media.id,
						         protocol: 'HLS' })
						.toString();

				request
					.get({url}, (err, response, body) => {
						let {statusCode, statusMessage} = response;

						if(err || statusCode != 200) {
							callback(`${statusCode} ${statusMessage}`, null);
						} else {
							let {meta, data} = JSON.parse(body);
							callback(null, data);
						}
					});
			}
		});
	}

	getProgramPlayableMediaUrl(id, callback) {
		this.getPlayouts(id, (err, playouts) => {
			if(err) {
				return callback(err, null);
			} else {
				let url = playouts[0].url;
				let decryptedMedia = decrypt(url, this.decryptKey);
				callback(null, decryptedMedia);
			}
		});
	}
};

module.exports = (apiAuth, apiUrl) => {
	return new yleApi(apiAuth, apiUrl);
};
