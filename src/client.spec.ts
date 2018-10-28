import * as fs from 'fs'
import * as path from 'path'
import MOCK_PROGRAM from './__mocks__/program'
import MOCK_PROGRAMS_NOW from './__mocks__/programs-now'
import Client, { IMAGES_URL } from './client'
import { ApiAuth } from './client.types'

const VALID_APIKEYS: ApiAuth = {
  appId: 'TEST_VALID_APPID',
  appKey: 'TEST_VALID_APPKEY',
  decryptKey: '1234567890abcdef'
}

const VALID_APIKEYS_NO_DECRYPT: ApiAuth = {
  appId: 'TEST_VALID_APPID',
  appKey: 'TEST_VALID_APPKEY'
}

const INVALID_APIKEYS: ApiAuth = {
  appId: 'TEST_INVALID_APPID',
  appKey: 'TEST_INVALID_APPKEY',
  decryptKey: 'TEST_INVALID_DECRYPTKEY'
}

const mockFetchResultWith = (data: any) => {
  const fetchMock = jest.fn()
  fetchMock.mockResolvedValueOnce({
    ok: true,
    json: () => data
  })
  return fetchMock
}

function readJSONMock(filename: string) {
  return JSON.parse(
    fs.readFileSync(
      path.join(__dirname, '__mocks__', filename)
    ).toString()
  )
}

describe('Client', () => {

  test('fetchPrograms', async () => {
    const data = readJSONMock('programs.json')
    const client = new Client(VALID_APIKEYS, mockFetchResultWith(data))
    const programs = await client.fetchPrograms({q: 'Uutiset'})

    expect(programs.meta).toMatchObject({
      offset: expect.any(String),
      limit: expect.any(String),
      count: expect.any(Number),
      clip: expect.any(Number),
      q: expect.stringMatching('Uutiset')
    })

    expect(programs.data[0]).toMatchObject({
      id: expect.any(String),
      type: expect.any(String)
    })
  })

  test('fetchProgramsNow', async () => {
    const data = MOCK_PROGRAMS_NOW
    const client = new Client(VALID_APIKEYS, mockFetchResultWith(data))
    const programs = await client.fetchProgramsNow()

    expect(programs.meta).toMatchObject({
      start: expect.any(Number),
      end: expect.any(Number)
    })

    expect(programs.data[0]).toMatchObject({
      id: expect.any(String),
      service: {
        id: expect.any(String)
      }
    })
  })

  test('fetchProgram', async () => {
    const data = MOCK_PROGRAM
    const client = new Client(VALID_APIKEYS, mockFetchResultWith(data))
    const ID = '1-4347267'
    const program = await client.fetchProgram(ID)

    expect(program.meta).toMatchObject({
      id: expect.stringMatching(ID)
    })

    expect(program.data).toMatchObject({
      id: expect.stringMatching(ID)
    })
  })

  describe('fetchPlayouts', () => {
    test('Successfully retrieves playouts and decrypts media URLs', async () => {
      const data = readJSONMock('program-playouts.json')
      const client = new Client(VALID_APIKEYS, mockFetchResultWith(data))
      const playablePublications = client.findPlayablePublicationsByProgram(MOCK_PROGRAM.data)
      const playouts = await client.fetchPlayouts(MOCK_PROGRAM.data.id, playablePublications[0].media!.id, 'HLS')

      expect(playouts.meta).toMatchObject({
        id: expect.any(String)
      })

      expect(playouts.data[0]).toMatchObject({
        protocol: expect.stringMatching('HLS'),
        url: expect.stringMatching('https://example.com/playouts/12345/hls'),
        width: expect.any(Number),
        height: expect.any(Number)
      })
    })

    test('Throws an error when attempting to decrypt without decryptKey', async () => {
      const data = readJSONMock('program-playouts.json')
      const client = new Client(VALID_APIKEYS_NO_DECRYPT, mockFetchResultWith(data))

      const playablePublications = client.findPlayablePublicationsByProgram(MOCK_PROGRAM.data)
      const playouts = client.fetchPlayouts(MOCK_PROGRAM.data.id, playablePublications[0].media!.id, 'HLS')

      await expect(playouts).rejects.toThrowError('Missing media decryption key')
    })
  })

  test('invalid api keys return 401 on all methods', async () => {
    const fetchMock = jest.fn()
    fetchMock.mockResolvedValue({
      ok: false,
      statusText: 'Unauthorized'
    })
    const client = new Client(INVALID_APIKEYS, fetchMock)
    await expect(client.fetchPrograms({})).rejects.toEqual('Unauthorized')
    await expect(client.fetchProgramsNow()).rejects.toEqual('Unauthorized')
    await expect(client.fetchProgram('1')).rejects.toEqual('Unauthorized')
    await expect(client.fetchPlayouts('1', '1', 'HLS')).rejects.toEqual('Unauthorized')
  })

  test('getImageUrl', () => {
    const client = new Client(VALID_APIKEYS, jest.fn())
    const url = client.getImageUrl('image1', 'jpg', {
      width: 1920,
      height: 1080,
      crop: 'fit'
    })

    expect(url).toMatch(`${IMAGES_URL}w_1920,h_1080,c_fit/image1.jpg`)
  })
})

describe('trackStreamStart', () => {

  test('returns 200 OK on successful track event registration', async () => {
    const client = new Client(VALID_APIKEYS, mockFetchResultWith(jest.fn(() => ({ ok: true }))))
    await client.trackStreamStart('valid-program-id', 'valid-media-id')
  })

  test('returns 400 Bad Request with invalid or missing parameters', async () => {
    const fetchMock = jest.fn()
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 400,
      statusText: 'Bad Request'
    })
    const client = new Client(VALID_APIKEYS, fetchMock)
    const trackStreamStart = client.trackStreamStart('valid-program-id', '')
    await expect(trackStreamStart).rejects.toEqual('Track stream failed: 400 Bad Request')
  })
})
