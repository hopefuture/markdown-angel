import fs from 'fs';
import path from 'path';
import resolve from 'resolve';
import autoprefixer from 'autoprefixer';
// 修复 flexbox 已知的 bug
// @ts-ignore
import flexbugs from 'postcss-flexbugs-fixes';
import browsersConfig from '../webpack/browsers-config';

interface Transformer {
  test: string;
  use: string;
}

// Markdown 解析器
const markdownTransformer = path.join(__dirname, 'markdown-transformer');

// 默认配置项
const defaultConfig = {
  port: 9090,
  source: './posts', // 该文件夹中定义 markdown 文件
  output: './_site', // 输出目录
  theme: './theme', // 主题，用来定义整个项目的主题，包括布局、显示的内容等
  htmlTemplate: path.join(__dirname, '../template.html'), // 默认模板文件
  htmlTemplateExtraData: {}, // 模板数据
  transformers: [], // 解析器
  devServerConfig: {}, // dev-server 配置项
  postcssConfig: {
    plugins: [
      flexbugs(),
      autoprefixer({
        flexbox: 'no-2009',
        browsers: browsersConfig(),
      }),
    ],
  },
  entryName: 'index',
  root: '/',
};

export default function markdownConfig(configFile: string) {
  const customizedConfig = fs.existsSync(configFile) ? require(configFile) : {};
  const config = { ...defaultConfig, ...customizedConfig };
  config.theme = resolve.sync(config.theme, { basedir: process.cwd() });
  // 解析器
  config.transformers = config.transformers
    .concat({
      test: /\.md$/,
      use: markdownTransformer,
    })
    .map(({ test = '', use }: Transformer) => ({
      test: test.toString(),
      use,
    }));

  return config;
}
