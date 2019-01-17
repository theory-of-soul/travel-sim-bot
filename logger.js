const showLog = (...args) => {
  console.log('-------------------------------------------------');
  console.log((new Date()).toLocaleString(), args);
};

module.exports = showLog;