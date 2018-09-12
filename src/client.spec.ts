import Client from './client';
import { ApiAuth } from './client.types';
import * as fs from 'fs';
import * as path from 'path';
import fetchMock from 'fetch-mock';
import { encrypt } from './mediaurl';

const VALID_APIKEYS: ApiAuth = {
  appId: 'TEST_VALID_APPID',
  appKey: 'TEST_VALID_APPKEY',
  decryptKey: '1234567890abcdef'
};

const VALID_APIKEYS_NO_DECRYPT: ApiAuth = {
  appId: 'TEST_VALID_APPID',
  appKey: 'TEST_VALID_APPKEY'
};

const INVALID_APIKEYS: ApiAuth = {
  appId: 'TEST_INVALID_APPID',
  appKey: 'TEST_INVALID_APPKEY',
  decryptKey: 'TEST_INVALID_DECRYPTKEY'
};

function makeClient(credentials = VALID_APIKEYS) {
  return new Client(credentials, fetchMock.sandbox() as any); 
}

function readJSONMock(filename: string) {
  return JSON.parse(
    fs.readFileSync(
      path.join(__dirname, '__mocks__', filename)
    ).toString()
  );
}

function withMockResponseFromFile(filename: string) {
  const data = readJSONMock(filename);
  fetchMock.once('*', {
    status: 200,
    body: data
  });
}

describe('Client', () => {
  afterEach(fetchMock.restore);

  test('fetchPrograms', async () => {
    withMockResponseFromFile('programs.json');
    const client = makeClient();
    const programs = await client.fetchPrograms({q: 'Uutiset'});

    expect(programs.meta).toMatchObject({
      offset: expect.any(String),
      limit: expect.any(String),
      count: expect.any(Number),
      clip: expect.any(Number),
      q: expect.stringMatching("Uutiset")
    });

    expect(programs.data[0]).toMatchObject({
      id: expect.any(String),
      type: expect.any(String)
    });
  });

  test('fetchProgramsNow', async () => {
    withMockResponseFromFile('programs-now.json');
    const client = makeClient();
    const programs = await client.fetchProgramsNow();

    expect(programs.meta).toMatchObject({
      start: expect.any(Number),
      end: expect.any(Number)
    });

    expect(programs.data[0]).toMatchObject({
      id: expect.any(String),
      service: {
        id: expect.any(String)
      }
    });
  });

  test('fetchProgram', async () => {
    withMockResponseFromFile('program.json');
    const client = makeClient();
    const ID = '1-4347267';
    const program = await client.fetchProgram(ID);

    expect(program.meta).toMatchObject({
      id: expect.stringMatching(ID)
    });

    expect(program.data).toMatchObject({
      id: expect.stringMatching(ID)
    });
  });

  
  describe('fetchPlayouts', () => {
    test('Successfully retrieves playouts and decrypts media URLs', async () => {
      withMockResponseFromFile('program-playouts.json');
      const client = makeClient();
      const program = readJSONMock('program.json');
  
      const playablePublications = client.findPlayablePublicationsByProgram(program.data);
      const playouts = await client.fetchPlayouts(program.data.id, playablePublications[0].media.id, 'HLS');
  
      expect(playouts.meta).toMatchObject({
        id: expect.any(String)
      });
  
      expect(playouts.data[0]).toMatchObject({
        protocol: expect.stringMatching('HLS'),
        url: expect.stringMatching('https://example.com/playouts/12345/hls'),
        width: expect.any(Number),
        height: expect.any(Number)
      });
    });

    test('Throws an error when attempting to decrypt without decryptKey', async () => {
      withMockResponseFromFile('program-playouts.json');
      const client = makeClient(VALID_APIKEYS_NO_DECRYPT);
      const program = readJSONMock('program.json');
  
      const playablePublications = client.findPlayablePublicationsByProgram(program.data);

      const playouts = client.fetchPlayouts(program.data.id, playablePublications[0].media.id, 'HLS')

      await expect(playouts).rejects.toThrowError('Missing media decryption key');
    });  
  });

  test('invalid api keys return 401 on all methods', async () => {
    fetchMock.mock('*', {
      status: 401,
      body: 'Unauthorized'
    });
    const client = makeClient(INVALID_APIKEYS);
    const requests = [
      client.fetchPrograms({}),
      client.fetchProgramsNow(),
      client.fetchProgram('1'),
      client.fetchPlayouts('1', '1', 'HLS')
    ];

    requests.forEach(async (request) => {
      await expect(request).rejects.toEqual('Unauthorized');;
    });
  });
});
