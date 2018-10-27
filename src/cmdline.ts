/*eslint no-console: 0*/
import fs from 'fs'
import path from 'path'
import Client from './client'

function getUserHome(): string {
  const userHome = process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'];
  if(!userHome) {
    throw Error('Could not detect home directory');
  } else {
    return userHome;
  }
}

function loadYleApiKeys() {
  var yleApiAuthFile = path.join(getUserHome(), '.yleapi');
  try {
  return JSON.parse(fs.readFileSync(yleApiAuthFile, 'utf8'));
  } catch (e) {
    console.error("Error loading API keys from '" + yleApiAuthFile + "'");
    console.error(e);
    process.exit(1);
  }
}

function formattedOutput(data: any) {
  console.log( JSON.stringify(data, null, 2) );
}

const client = new Client(loadYleApiKeys());
const program = require('commander');

program
  .command('search [query] [limit] [offset]')
  .description('Search for programs, clips and episodes')
  .option('-a, --availability <value>', 'Filter by availability')
  .option('-c, --category <value>', 'Return items in specific category')
  .option('-d, --downloadable', 'Only return downloadable content')
  .option('-l, --language <value>', 'Filter by language')
  .option('-m, --mediaobject <type>', 'Filter by mediaobject type')
  .option('-o, --order <criteria>', 'Order results by given criteria')
  .option('-p, --publisher <value>', 'Filter by publisher')
  .option('-r, --region <region>', 'Filter by region')
  .option('-sr, --series <value>', 'Return items containing specific series')
  .option('-s, --service <value>', 'Filter by service')
  .option('-t, --type <type>', 'Filter by type')
  .action(async (q: string, limit: number, offset: number, options: any) => {
    const finalOptions = {
      q: q,
      limit: limit,
      offset: offset,

      availability: options.availability,
      category: options.category,
      downloadable: options.downloadable,
      language: options.language,
      mediaobject: options.mediaobject,
      order: options.order,
      publisher: options.publisher,
      region: options.region,
      series: options.series,
      service: options.service,
      type: options.type
    };

    const response = await client.fetchPrograms(finalOptions);
    if(!response.meta.count) {
      console.log('No results.');
    } else {
      const programs = response.data;
      const language = finalOptions.language || 'fi';
      const output = programs.map((program: any) => {
        const title = program.title[language];
        const description = program.description[language] || '';
        return `[${program.id}] ${title} ${description}`;
      }).join('\n');
      console.log(output);
    }
  }).on('--help', function() {
    console.log('  Examples:');
    console.log();
    console.log('    $ yle-api search muumit');
    console.log('    $ yle-api search --service=yle-fem');
    console.log('    $ yle-api search --availability=ondemand --order=playcount.24h:desc --mediaobject=video');
    console.log('    $ yle-api search --type=radioclip uutiset 10 20');
    console.log();
  });

program
  .command('info [programId]')
  .description('Obtain additional information about a program')
  .action(async (programId: string) => {
    const response = await client.fetchProgram(programId);
    console.log(formattedOutput(response.data));
  });

program
  .command('get-stream <programId>')
  .description('Retrieve stream for a program')
  .option('-p, --protocol <protocol>', 'Specify protocol for returned stream. Values: HLS (default), HDS, PMD, RTMPE')
  .action(async (programId: string, options: any) => {
    const response = await client.fetchProgram(programId);
    const playables = client.findPlayablePublicationsByProgram(response.data);
    const playoutResponse = await client.fetchPlayouts(
      programId,
      playables[0].media!.id, // TODO: add error checking
      options.protocol || 'HLS'
    );
    console.log(playoutResponse.data[0].url);
  });

program.parse(process.argv);

const NO_COMMAND_SPECIFIED = program.args.length === 0;

if(NO_COMMAND_SPECIFIED) {
  program.help();
}
