export default function tsConfig() {
  return {
    transpileOnly: true,
    compilerOptions: {
      target: 'es6',
      jsx: 'preserve',
      moduleResolution: 'node',
      declaration: false,
    },
  };
}
