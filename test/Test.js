require('chai')
    .use(require('chai-as-promised'))
    .should()

const Web3 = require('web3')
const usdcABI = require('./usdcABI.json')
const usdcAddr = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"

const Bridge = artifacts.require('./Bridge.sol')
const ReflexBridge = artifacts.require('./ReflexBridge.sol')

contract('Bridge Contract', (accounts) => {
    let tx, bridge

    const web3 = new Web3("http://localhost:8545")
    const usdcContract = new web3.eth.Contract(usdcABI, usdcAddr)
    
    let usdcHolder = "0xcffad3200574698b78f32232aa9d63eabd290703"

    before(async() => {
        bridge = await Bridge.deployed()
    })

    it('send USDT from ETH to Polygon', async() => {
        let usdcAmount = web3.utils.toWei("10", "mwei")

        let dstChainId = 137
        let nonce = 100
        let maxSlippage = 10788

        await usdcContract.methods.approve(bridge.address, usdcAmount).send({from: usdcHolder})
        tx = await bridge.send(usdcHolder, usdcAddr, usdcAmount, dstChainId, nonce, maxSlippage, {from: usdcHolder})
        let bridgeUsdcBal = await usdcContract.methods.balanceOf(bridge.address).call()
        console.log("Bridge USDC Balance: ", bridgeUsdcBal.toString())
    })
})