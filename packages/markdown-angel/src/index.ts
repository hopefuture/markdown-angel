import path from 'path';
import fs from 'fs';
import mkdirp from 'mkdirp';
import nunjucks from 'nunjucks';
import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
// @ts-ignore
import openBrowser from 'react-dev-utils/openBrowser';

import markdownConfig from './utils/markdown-config';
import getWebpackConfig from './webpack/webpack.config';

// 运行服务
export const start = (program: any) => {
  const configFile = path.join(
    process.cwd(),
    program.config || 'markdown.config.js'
  );
  // markdown config
  const config = markdownConfig(configFile);

  mkdirp.sync(config.output);

  // 读取模板
  const template = fs.readFileSync(config.htmlTemplate).toString();

  // 模板数据
  const templateData = {
    root: '/',
    ...config.htmlTemplateExtraData,
  };

  // 生成的最终 html 文件
  const templatePath = path.join(process.cwd(), config.output, 'index.html');
  // 利用模板引擎 [nunjucks](https://github.com/mozilla/nunjucks) 来处理
  fs.writeFileSync(templatePath, nunjucks.renderString(template, templateData));

  // 根据 theme 和 entryName 生成要渲染的 js 文件
  // generateEntryFile(bishengConfig.theme, bishengConfig.entryName, '/');

  const webpackConfig = getWebpackConfig(config);

  // console.info(
  //   'webpackConfig----------------',
  //   JSON.stringify(webpackConfig, null, 2)
  // );

  const serverOptions = {
    quiet: true,
    hot: true,
    ...config.devServerConfig,
    contentBase: path.join(process.cwd(), config.output),
    historyApiFallback: true,
    host: 'localhost',
    overlay: true, // 浏览器上会把错误显示出来了
  };

  // @ts-ignore
  WebpackDevServer.addDevServerEntrypoints(webpackConfig, serverOptions);
  // @ts-ignore
  const compiler = webpack(webpackConfig);

  const server = new WebpackDevServer(compiler, serverOptions);
  server.listen(config.port, '0.0.0.0', () =>
    openBrowser(`http://localhost:${config.port}`)
  );
};

// 构建
export const build = (program: any) => {
  const configFile = path.join(
    process.cwd(),
    program.config || 'markdown.config.js'
  );
  // markdown config
  const config = markdownConfig(configFile);

  mkdirp.sync(config.output);

  // 读取模板
  const template = fs.readFileSync(config.htmlTemplate).toString();

  // 模板数据
  const templateData = {
    root: '/',
    ...config.htmlTemplateExtraData,
  };

  // 生成的最终 html 文件
  const templatePath = path.join(process.cwd(), config.output, 'index.html');
  // 利用模板引擎 [nunjucks](https://github.com/mozilla/nunjucks) 来处理
  fs.writeFileSync(templatePath, nunjucks.renderString(template, templateData));

  // 根据 theme 和 entryName 生成要渲染的 js 文件
  // generateEntryFile(bishengConfig.theme, bishengConfig.entryName, '/');

  const webpackConfig = getWebpackConfig(config, true);

  // console.info(
  //   'webpackConfig----------------',
  //   JSON.stringify(webpackConfig, null, 2)
  // );

  // @ts-ignore
  webpack(webpackConfig, (err, stats) => {
    if (err !== null) {
      return console.error(err);
    }

    if (stats.hasErrors()) {
      console.log(stats.toString('errors-only'));
    }
  });
};
