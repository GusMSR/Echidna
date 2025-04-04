const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.server = {
  enhanceMiddleware: (middleware, server) => {
    return (req, res, next) => {
      if (req.url.startsWith("/public/")) {
        req.url = req.url.replace("/public", "");
      }
      return middleware(req, res, next);
    };
  },
};

module.exports = config;
