'use strict';

let request = require('request');
let URI = require('URIjs');
let decrypt = require('./decrypt');

const API_URL_DEFAULT = 'https://external.api.yle.fi/v1/';
const IMAGES_URL_DEFAULT = 'http://images.cdn.yle.fi/image/upload/';
const EVENT_TEMPORAL_STATUS_CURRENTLY = 'currently';
const EVENT_TYPE_ONDEMAND_PUBLICATION = 'OnDemandPublication';
const PROTOCOL_HTTP_LIVE_STREAMING = 'HLS';
const PROTOCOL_HTTP_DYNAMIC_STREAMING = 'HDS';

class yleApi {
	constructor(apiAuth, apiUrl = API_URL_DEFAULT, imagesUrl = IMAGES_URL_DEFAULT) {
		this.appId = apiAuth.appId;
		this.appKey = apiAuth.appKey;
		this.decryptKey = apiAuth.decryptKey;
		this.apiUrl = API_URL_DEFAULT;
		this.imagesUrl = imagesUrl;
	}

	getPrograms (queryOptions, callback) {
		let url =
			URI(this.apiUrl)
				.segment('programs')
				.segment('items')
				.suffix('json')
				.query({ app_id: this.appId,
				         app_key: this.appKey,
				         offset: queryOptions.offset || 0,
				         order: queryOptions.order })
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

	getProgram (id, callback) {
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

	getProgramStream(programId, callback) {
		this._findPlayableMedia(programId, (err, media) => {
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
						         protocol: PROTOCOL_HTTP_LIVE_STREAMING })
						.toString();

				request
					.get({url}, (err, response, body) => {
						let {statusCode, statusMessage} = response;

						if(err || statusCode != 200) {
							callback(`${statusCode} ${statusMessage}`, null);
						} else {
							let playouts =
								this._decryptPlayouts( JSON.parse(body).data );
							callback(null, playouts);
						}
					});
			}
		});
	}

	getProgramImage(programId, callback) {
		this.getProgram(programId, (err, program) => {
			program.image.url =
				URI(this.imagesUrl)
					.segment(program.image.id)
					.suffix('jpg')
					.toString();
			callback(null, program.image);
		});
	}

	_findPlayableMedia(id, callback) {
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

	_decryptPlayouts(playouts) {
		return playouts.map( (playout) => {
			playout.url = decrypt(playout.url, this.decryptKey);
			return playout;
		});
	}
};

module.exports = (apiAuth, apiUrl) => {
	return new yleApi(apiAuth, apiUrl);
};
