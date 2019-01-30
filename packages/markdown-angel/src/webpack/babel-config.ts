import browsersConfig from './browsers-config';

const { resolve } = require;

export default function getBabelConfig(isDev: boolean) {
  return {
    cacheDirectory: isDev,
    babelrc: false,
    /*
     * babel-preset-env 的配置可参考 https://zhuanlan.zhihu.com/p/29506685
     * 他会自动使用插件和 polyfill
     */
    presets: [
      resolve('@babel/preset-react'),
      [
        resolve('@babel/preset-env'),
        {
          targets: {
            browsers: browsersConfig(),
          },
          modules: false, // 设为 false，交由 Webpack 来处理模块化
          /*
           * 设为 usage 会根据需要自动导入用到的 es6 新方法，而不是一次性的引入 babel-polyfill
           * 比如使用 Promise 会导入 import "babel-polyfill/core-js/modules/es6.promise";
           */
          useBuiltIns: 'usage',
          debug: isDev,
        },
      ],
    ],

    plugins: [
      resolve('@babel/plugin-syntax-dynamic-import'), // 支持'import()'
      [resolve('@babel/plugin-proposal-decorators'), { legacy: true }], // 编译装饰器语法
      resolve('@babel/plugin-proposal-class-properties'), // 解析类属性，静态和实例的属性
      resolve('@babel/plugin-proposal-object-rest-spread'), // 支持对象 rest
      [
        resolve('@babel/plugin-transform-runtime'),
        {
          corejs: false, // defaults to false
          helpers: true, // defaults to true
          regenerator: true, // defaults to true
        },
      ],
      ...(isDev
        ? []
        : [
            // https://github.com/babel/babel/tree/master/packages/babel-plugin-transform-react-constant-elements
            resolve('@babel/plugin-transform-react-constant-elements'),
            // https://github.com/babel/babel/tree/master/packages/babel-plugin-transform-react-inline-elements
            resolve('@babel/plugin-transform-react-inline-elements'),
            [
              resolve('babel-plugin-transform-react-remove-prop-types'),
              {
                mode: 'remove', // 默认值为 remove ，即删除 PropTypes
                removeImport: true, // the import statements are removed as well. import PropTypes from 'prop-types'
                ignoreFilenames: ['node_modules'],
              },
            ],
          ]),
    ],
  };
}
