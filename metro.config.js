const { getDefaultConfig } = require("expo/metro-config");
const { withNativewind } = require("nativewind/metro");
 
/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

const defaultBlockList = config.resolver.blockList?.source ?? "";
const coreJsWatchBlockList =
  /[\\/]node_modules[\\/]core-js[\\/](actual|es|features|full|stable)[\\/](array|async-iterator|math|string|typed-array)([\\/].*)?$/;

config.resolver.blockList = new RegExp(
  [defaultBlockList, coreJsWatchBlockList.source].filter(Boolean).join("|"),
);
 
module.exports = withNativewind(config);
