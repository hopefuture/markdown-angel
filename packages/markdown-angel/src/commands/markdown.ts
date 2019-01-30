import commander from 'commander';
import _package from '../../package.json';

commander
  .version(_package.version)
  .description('[command] [options]')
  .command('start [options]', 'to start a server.')
  .command(
    'build [options]',
    'to build and write static files to `config.output`'
  )
  .command('gh-pages [options]', 'to deploy website to gh-pages')
  .parse(process.argv);

if (!commander.args.length) {
  commander.help();
}

// 当出现新的 process 时，杀死当前运行的 commander
process.on('SIGINT', () => {
  if (commander.runningCommand) {
    commander.runningCommand.kill('SIGKILL');
  }
  process.exit(0);
});
