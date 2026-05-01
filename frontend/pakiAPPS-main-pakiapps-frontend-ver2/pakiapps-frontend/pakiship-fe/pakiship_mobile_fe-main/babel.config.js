module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'nativewind/babel',
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './pakiShip_Signup-main/src',
            '@app': '../../pakipark-fe/pakipark-fe/src/bootstrap',
            '@config': '../../pakipark-fe/pakipark-fe/src/config',
            '@features': '../../pakipark-fe/pakipark-fe/src/features',
            '@navigation': '../../pakipark-fe/pakipark-fe/src/navigation',
            '@theme': '../../pakipark-fe/pakipark-fe/src/theme',
            '@utils': '../../pakipark-fe/pakipark-fe/src/utils',
          },
        },
      ],
    ],
  };
};
