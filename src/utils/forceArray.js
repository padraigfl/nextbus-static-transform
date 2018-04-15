'use strict';

module.exports = function (entry){
  if(!Array.isArray(entry)){
    entry = [entry];
  }
  return entry;
}
