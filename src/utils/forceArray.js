'use strict';

module.exports = function (entry){
  if (!entry) {
    return [];
  }
  if(!Array.isArray(entry)){
    entry = [entry];
  }
  return entry;
};
