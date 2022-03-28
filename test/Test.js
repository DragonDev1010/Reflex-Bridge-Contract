require('chai')
    .use(require('chai-as-promised'))
    .should()

const Web3 = require('web3')
const usdtABI = require('./usdtABI.json')
const usdcABI = require('./usdcABI.json')
const usdtAddr = "0xdac17f958d2ee523a2206206994597c13d831ec7"
const usdcAddr = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"

const Bridge = artifacts.require('./Bridge.sol')
const ReflexBridge = artifacts.require('./ReflexBridge.sol')

contract('Bridge Contract', (accounts) => {
    let tx, bridge

    const web3 = new Web3("http://localhost:8545")
    const usdtContract = new web3.eth.Contract(usdtABI, usdtAddr)
    const usdcContract = new web3.eth.Contract(usdcABI, usdcAddr)

    before(async() => {
        bridge = await Bridge.deployed()
        // bridge = await ReflexBridge.deployed()
    })

    it('send USDT from ETH to Polygon', async() => {
        let usdtHolder = "0x2d3a053588cb3f87601287948c10874173064d1b"
        let usdtAmount = web3.utils.toWei("10", "mwei")

        let usdcHolder = "0xcffad3200574698b78f32232aa9d63eabd290703"
        let usdcAmount = web3.utils.toWei("10", "mwei")

        let dstChainId = 137
        let nonce = 100
        let maxSlippage = 10788

        await usdtContract.methods.approve(accounts[0], usdtAmount).send({from: usdtHolder})
        await usdtContract.methods.transferFrom(usdtHolder, accounts[1], usdtAmount).send({from: accounts[0]})
        tx = await usdtContract.methods.balanceOf(accounts[1]).call()
        console.log("Accounts 1 balance: ", tx.toString())

        await usdtContract.methods.approve(bridge.address, usdtAmount).send({from: usdtHolder})
        tx = await bridge.send(usdtHolder, usdtAddr, usdtAmount, dstChainId, nonce, maxSlippage, {from: usdtHolder, gasPrice: 10000000000,gas: 300000})
        let bridgeUsdtBal = await usdtContract.methods.balanceOf(bridge.address).call()
        console.log("Bridge USDT Balance: ", bridgeUsdtBal.toString())

        await usdcContract.methods.approve(bridge.address, usdcAmount).send({from: usdcHolder})
        tx = await bridge.send(usdcHolder, usdcAddr, usdcAmount, dstChainId, nonce, maxSlippage, {from: usdcHolder})
        let bridgeUsdcBal = await usdcContract.methods.balanceOf(bridge.address).call()
        console.log("Bridge USDC Balance: ", bridgeUsdcBal.toString())
    })
})