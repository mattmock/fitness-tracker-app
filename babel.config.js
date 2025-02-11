module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ["module:react-native-dotenv", {
        "moduleName": "@env",
        "path": process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development',
        "safe": false,
        "allowUndefined": true,
        "verbose": false
      }],
      'react-native-reanimated/plugin'
    ]
  };
}; 