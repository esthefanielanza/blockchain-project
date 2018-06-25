var Class = artifacts.require('./Class.sol');

module.exports = (deployer, className, teacherName) => {
    deployer.deploy(Class, 'Blockchain e criptomoedas', 'Jeroen Van de Graaf', 60);
};
