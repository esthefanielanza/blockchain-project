var Class = artifacts.require('./Class.sol');

module.exports = (deployer, className, teacherName) => {
  deployer.deploy(Class, className, teacherName);
};
