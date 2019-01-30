import path from 'path';

export default function getThemeConfig(configFile: string = '') {
  const customizedConfig = require(configFile);
  const config = { plugins: [], ...customizedConfig };
  // 这里可以加入原生定义的插件
  config.plugins = [].concat(
    config.plugins.map((plugin: string) =>
      plugin.charAt(0) === '.' ? path.join(process.cwd(), plugin) : plugin
    )
  );

  return config;
}
