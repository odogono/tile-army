module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          alias: {
            '@components/*': './src/components/*',
            '@helpers/*': './src/helpers/*',
            '@hooks/*': './src/hooks/*',
            '@model/*': './src/model/*',
            '@net/*': './src/net/*',
            '@/*': './src/*',
          },
        },
      ],
    ],
  };
};
