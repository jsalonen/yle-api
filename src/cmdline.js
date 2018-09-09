/*eslint no-console: 0*/
import fs from 'fs'
import path from 'path'
import Client from './client'

function getUserHome () {
  return process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'];
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

function formattedOutput(data) {
  console.log( JSON.stringify(data, null, 2) );
}

function withDefaultErrorHandling(cb) {
  function applyDefaultErrorHandling(err, results) {
    if(err) {
      console.error(err);
    } else {
      cb(results);
    }
  }

  return applyDefaultErrorHandling;
}

var client = new Client(loadYleApiKeys());
var program = require('commander');

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
  .action(function(q, limit, offset, options) {
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

    client.getPrograms(finalOptions, withDefaultErrorHandling((programs) => {
      if(!programs || !programs.length) {
        console.log('No results.');
      } else {
        var language = finalOptions.language || 'fi';
        var output = programs.map(function(program) {
          var title = program.title[language];
          var description = program.description[language] || '';
          return `[${program.id}] ${title} ${description}`;
        }).join('\n');
        console.log(output);
      }
    }));
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
  .action(function(programId) {
    client.getProgram(programId, withDefaultErrorHandling((program) => {
      console.log(program);
    }));
  });

program
  .command('get-stream <programId> [protocol]')
  .description('Retrieve stream for a program')
  .option('-ml, --multibitrate <true|false>', '')
  .option('-hs, --hardsubtitles <true|false>', 'Burn subtitles into stream')
  .action(function(programId, protocol) {
    client.getProgramStream(programId, protocol || 'HDS', function (err, stream) {
      formattedOutput(stream);
    });
  });

if(process.argv.length === 2) {
  program.outputHelp();
} else {
  program.parse(process.argv);
}
