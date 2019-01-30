import commander from 'commander';
import { build } from '../index';

commander
  .option(
    '-c, --config <path>',
    'set config path. defaults to ./markdown.config.js'
  )
  .parse(process.argv);

build(commander);
