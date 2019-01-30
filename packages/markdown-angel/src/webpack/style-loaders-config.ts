import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import autoprefixer from 'autoprefixer';
// @ts-ignore
import flexbugs from 'postcss-flexbugs-fixes'; // 修复 flexbox 已知的 bug
import browsersConfig from './browsers-config';

const { resolve } = require;

export default function getStyleLoaderConfig({
  isDev = true,
  stylesOptions = {
    css: true,
    less: true,
    sass: true,
  },
  // 默认值
  postcssConfig = {
    plugins: [
      flexbugs(),
      autoprefixer({
        flexbox: 'no-2009',
        browsers: browsersConfig(),
      }),
    ],
  },
  lessConfig = {
    javascriptEnabled: true,
  },
}) {
  return [
    ...(stylesOptions.css
      ? [
          {
            test(filePath: string) {
              return (
                /\.css$/.test(filePath) && !/\.module\.css$/.test(filePath)
              );
            },
            use: [
              isDev ? resolve('style-loader') : MiniCssExtractPlugin.loader,
              {
                loader: resolve('css-loader'),
                options: {
                  sourceMap: true,
                },
              },
              {
                loader: resolve('postcss-loader'),
                options: postcssConfig,
              },
            ],
          },
          {
            test: /\.module\.css$/,
            use: [
              isDev ? resolve('style-loader') : MiniCssExtractPlugin.loader,
              {
                loader: resolve('css-loader'),
                options: {
                  sourceMap: true,
                  modules: true,
                  localIdentName: '[local]___[hash:base64:5]',
                },
              },
              {
                loader: resolve('postcss-loader'),
                options: postcssConfig,
              },
            ],
          },
        ]
      : []),
    ...(stylesOptions.less
      ? [
          {
            test(filePath: string) {
              return (
                /\.less$/.test(filePath) && !/\.module\.less$/.test(filePath)
              );
            },
            use: [
              isDev ? resolve('style-loader') : MiniCssExtractPlugin.loader,
              {
                loader: resolve('css-loader'),
              },
              {
                loader: resolve('postcss-loader'),
                options: postcssConfig,
              },
              {
                loader: resolve('less-loader'),
                options: lessConfig,
              },
            ],
          },
          {
            test: /\.module\.less$/,
            use: [
              isDev ? resolve('style-loader') : MiniCssExtractPlugin.loader,
              {
                loader: resolve('css-loader'),
                options: {
                  modules: true,
                  localIdentName: '[local]___[hash:base64:5]',
                },
              },
              {
                loader: resolve('postcss-loader'),
                options: postcssConfig,
              },
              {
                loader: resolve('less-loader'),
                options: lessConfig,
              },
            ],
          },
        ]
      : []),
    ...(stylesOptions.sass
      ? [
          {
            test(filePath: string) {
              return (
                /\.scss$/.test(filePath) && !/\.module\.scss$/.test(filePath)
              );
            },
            use: [
              isDev ? resolve('style-loader') : MiniCssExtractPlugin.loader,
              {
                loader: resolve('css-loader'),
              },
              {
                loader: resolve('postcss-loader'),
                options: postcssConfig,
              },
              {
                loader: resolve('resolve-url-loader'),
              },
              {
                loader: resolve('sass-loader'),
                options: {
                  sourceMap: true, // 必须保留
                  outputStyle: 'expanded', // 不压缩，设为 compressed 表示压缩
                  precision: 15, // 设置小数精度
                },
              },
            ],
          },
          {
            test: /\.module\.scss$/,
            use: [
              isDev ? resolve('style-loader') : MiniCssExtractPlugin.loader,
              {
                loader: 'css-loader',
                options: {
                  modules: true,
                  localIdentName: '[local]___[hash:base64:5]',
                },
              },
              {
                loader: 'postcss-loader',
                options: postcssConfig,
              },
              {
                loader: resolve('resolve-url-loader'),
              },
              {
                loader: 'sass-loader',
                options: {
                  sourceMap: true, // 必须保留
                  modules: true,
                  outputStyle: 'expanded', // 不压缩，设为 compressed 表示压缩
                  precision: 15, // 设置小数精度
                },
              },
            ],
          },
        ]
      : []),
  ];
}
