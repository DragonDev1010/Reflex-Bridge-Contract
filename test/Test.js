require('chai')
    .use(require('chai-as-promised'))
    .should()

const {assert} = require('chai')

const Bridge = artifacts.require('./Bridge.sol')

contract('Bridge Contract', (accounts) => {
    let tx, bridge

    before(async() => {
        bridge = await Bridge.deployed()
    })

    it('send USDT from ETH to Polygon', async() => {
        // 0x2d3a053588cb3f87601287948c10874173064d1b - USDT Holder
        // 0xdac17f958d2ee523a2206206994597c13d831ec7 - USDT Token Address
        let usdtHolder = "0x2d3a053588cb3f87601287948c10874173064d1b"
        let receiver = accounts[0]
        let usdtAddr = "0xdac17f958d2ee523a2206206994597c13d831ec7"
        let usdtAmount = web3.utils.toWei("10", "ether")
        let dstChainId = 137
        let nonce = 100
        let maxSlippage 
        tx = await bridge.minimalMaxSlippage.call()
        tx = await bridge.send(receiver, usdtAddr, usdtAmount, dstChainId, nonce, maxSlippage, {from: usdtHolder})

        console.log(tx)
    })
})