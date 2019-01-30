import path from 'path';
import webpack from 'webpack';
import UglifyJsPlugin from 'uglifyjs-webpack-plugin';
import OptimizeCSSAssetsPlugin from 'optimize-css-assets-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import getBabelConfig from './babel-config';
import getTsConfig from './ts-config';
import getStyleLoaderConfig from './style-loaders-config';

const { resolve } = require;

export default function webpackConfig(config: any, isBuild: boolean = false) {
  const { stylesOptions, postcssConfig, lessConfig } = config;
  const NODE_ENV = process.env.NODE_ENV || 'production';
  const isDev = process.env.NODE_ENV === 'development';
  const isProd = NODE_ENV === 'production';

  const babelConfig = getBabelConfig(isDev);
  const tsConfig = getTsConfig();

  // @ts-ignore
  return {
    mode: NODE_ENV,
    cache: isDev, // 是否开启缓存，增量编译
    bail: true, // 默认为 false。设为 true 时如果发生错误，则不继续尝试，直接退出 bundling process
    devtool: 'eval-source-map', // 生成 source map文件
    /*
     * Specify what bundle information gets displayed
     * https://webpack.js.org/configuration/stats/
     */
    stats: {
      cached: isDev, // 显示缓存信息
      cachedAssets: isDev, // 显示缓存的资源（将其设置为 `false` 则仅显示输出的文件）
      chunks: isDev, // 显示 chunk 信息（设置为 `false` 仅显示较少的输出）
      chunkModules: isDev, // 将构建模块信息添加到 chunk 信息
      colors: true,
      hash: isDev, // 显示编译后的 hash 值
      modules: isDev, // 显示构建模块信息
      reasons: isDev, // 显示被导入的模块信息
      timings: true, // 显示构建时间信息
      version: true, // 显示 webpack 版本信息
    },
    /*
     * https://webpack.js.org/configuration/target/#target
     * webpack 能够为多种环境构建编译，默认是 'web'，可省略
     */
    target: 'web',
    resolve: {
      // 自动扩展文件后缀名
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
      // 模块别名定义，方便直接引用别名
      alias: {},
      // 参与编译的文件
      modules: ['node_modules', path.join(__dirname, '../../node_modules')],
    },

    /*
     * 入口文件，让 webpack 用哪个文件作为项目的入口
     */
    entry: {
      [config.entryName]: path.join(
        __dirname,
        '..',
        '..',
        'tmp',
        `${config.entryName}.js`
      ),
    },

    // 出口， 让 webpack 把处理完成的文件放在哪里
    output: {
      ...(isBuild ? { path: path.join(process.cwd(), config.output) } : {}),
      publicPath: isBuild ? config.root : '/',
      filename: '[name].js', // 打包文件名称
      chunkFilename: `[name]${isProd ? '.[contenthash:6]' : ''}.js`,
      pathinfo: isDev, // 打印路径信息
      sourceMapFilename: 'map/[file].map',
    },

    // module 处理
    module: {
      /*
       * Make missing exports an error instead of warning
       * 缺少 exports 时报错，而不是警告
       */
      strictExportPresence: true,

      rules: [
        {
          test: /\.jsx?$/,
          exclude: /node_modules/,
          use: {
            loader: resolve('babel-loader'),
            options: babelConfig,
          },
        },
        {
          test: /\.tsx?$/,
          use: [
            {
              loader: resolve('babel-loader'),
              options: babelConfig,
            },
            {
              loader: resolve('ts-loader'),
              options: tsConfig,
            },
          ],
        },
        ...getStyleLoaderConfig({
          isDev,
          stylesOptions,
          postcssConfig,
          lessConfig,
        }),
        /*
         * Rules for images
         * https://webpack.js.org/configuration/module/#rule-oneof
         */
        {
          test: /\.(bmp|gif|jpe?g|png)$/,
          loader: resolve('url-loader'),
          options: {
            name: '[hash:8].[ext]',
            limit: 10000, // 10kb
          },
        },
        {
          test: /\.woff2?(\?v=\d+\.\d+\.\d+)?$/,
          loader: resolve('url-loader'),
          options: {
            limit: 10000,
            name: '[hash:8].[ext]',
            mimetype: 'application/font-woff',
          },
        },
        {
          test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
          loader: resolve('url-loader'),
          options: {
            name: '[hash:8].[ext]',
            minetype: 'application/octet-stream',
          },
        },
        {
          test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
          loader: resolve('url-loader'),
          options: {
            limit: 10000,
            name: '[hash:8].[ext]',
            minetype: 'application/vnd.ms-fontobject',
          },
        },
        {
          test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
          loader: resolve('url-loader'),
          options: {
            limit: 10000,
            name: '[hash:8].[ext]',
            minetype: 'image/svg+xml',
          },
        },
        {
          test: /\.(mp4|ogg)$/,
          loader: resolve('file-loader'),
          options: {
            name: '[hash:8].[ext]',
          },
        },
      ],
    },

    // webpack 4 新增属性，选项配置，原先的一些插件部分放到这里设置
    optimization: isDev
      ? {
          splitChunks: {
            cacheGroups: {
              // 这里开始设置缓存的 chunks
              commons: {
                chunks: 'initial', // 必须三选一： "initial" | "all" | "async"(默认为异步)
                test: /[\\/]node_modules[\\/]/,
                name: 'vendors', // 要缓存的分隔出来的 chunk 名称
              },
            },
          },
          namedChunks: true, // 开启后给代码块赋予有意义的名称，而不是数字的 id
        }
      : {
          removeEmptyChunks: true, // 空的块chunks会被移除。这可以减少文件系统的负载并且可以加快构建速度。
          mergeDuplicateChunks: true, // 相同的块被合并。这会减少生成的代码并缩短构建时间。
          occurrenceOrder: true, // Webpack将会用更短的名字去命名引用频度更高的chunk
          sideEffects: true, // 剔除掉没有依赖的模块
          // 为 webpack 运行时代码和 chunk manifest 创建一个单独的代码块。这个代码块应该被内联到 HTML 中，生产环境不需要
          runtimeChunk: false,
          // 开启后给代码块赋予有意义的名称，而不是数字的 id
          namedChunks: false,
          // https://github.com/webpack-contrib/mini-css-extract-plugin#minimizing-for-production
          minimizer: [
            new UglifyJsPlugin({
              cache: true,
              parallel: true,
              sourceMap: true, // set to true if you want JS source maps
              uglifyOptions: {
                // https://github.com/mishoo/UglifyJS2/tree/harmony#compress-options
                compress: {
                  /* eslint-disable camelcase */
                  drop_console: true,
                },
                mangle: {
                  reserved: [''], // 设置不混淆变量名
                },
                // https://github.com/mishoo/UglifyJS2/tree/harmony#compress-options
                output: {
                  comments: false,
                  beautify: false,
                },
              },
            }),
            new OptimizeCSSAssetsPlugin({}),
          ],
          splitChunks: {
            cacheGroups: {
              // 这里开始设置缓存的 chunks
              commons: {
                chunks: 'initial', // 必须三选一： "initial" | "all" | "async"(默认为异步)
                test: /[\\/]node_modules[\\/]/, // 合并指定的模块，这里只 node_modules 下所有公共的，也可以设为 /react|babel/ 等
                name: 'vendors', // 要缓存的分隔出来的 chunk 名称
              },
              // 所有的 css 生成一个文件，这样只需第一次加载 css 文件，后续不需要按需加载，这样体验可能会更好些，如果需要按需加载的话，可以把这个去掉，同时 server 端引入 css 和 js 也需要调整，怎样调整可以查看历史版本
              styles: {
                name: 'styles',
                test: /\.(le|s?c)ss$/,
                chunks: 'all',
                enforce: true,
              },
            },
          },
        },

    // https://webpack.js.org/concepts/mode/#mode-development
    plugins: isDev
      ? [
          new webpack.HotModuleReplacementPlugin(), // 热部署替换模块
        ]
      : [
          // 用来优化生成的代码 chunk，合并相同的代码
          new webpack.optimize.AggressiveMergingPlugin(),
          new MiniCssExtractPlugin({
            /*
             * Options similar to the same options in webpackOptions.output
             * both options are optional
             * css/[name].[contenthash:8].css
             */
            filename: 'css/[name].[contenthash:8].css',
          }),
          new webpack.HashedModuleIdsPlugin(),
          new webpack.BannerPlugin({
            banner: [
              '/*!',
              ' Markdown Angel',
              ` Copyright © 2019-${new Date().getFullYear()}.`,
              '*/',
            ].join('\n'),
            raw: true,
            entryOnly: true,
          }),
        ],
  };
}
