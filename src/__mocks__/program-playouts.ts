import { ApiResponseMediaPlayouts } from '../client.types'

const playouts: ApiResponseMediaPlayouts = {
  "meta": {
    "id": "12345"
  },
  "data": [
    {
      "subtitles": [
        {
          "lang": "fi",
          "type": "translation",
          "uri": "https://example.com/captions/fi"
        }
      ],
      "protocol": "HLS",
      "multibitrate": true,
      "formatOf": "12345",
      "width": 1920,
      "type": "VideoObject",
      "url": "nA2ZffCh0SQcQxExLdtBzARbRSRZITBlcc4KCoX7oPlt28JRk1NG7NPNcKlwFVMCjFJ5IvBkdSqgXC/iqDpa7w==",
      "live": false,
      "protectionType": "DEFAULT",
      "height": 1080
    }
  ],
  "notifications": {}
}

export default playouts
