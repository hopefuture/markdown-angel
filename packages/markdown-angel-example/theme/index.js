module.exports = {
  lazyLoad: true,
  pick: {
    posts(markdownData) {
      return {
        meta: markdownData.meta,
        description: markdownData.description,
      };
    },
  },
  plugins: [],
  routes: [],
};
