require('chai')
    .use(require('chai-as-promised'))
    .should()

const Web3 = require('web3')
const usdcABI = require('./usdcABI.json')
const usdcAddr = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"

const Bridge = artifacts.require('./Bridge.sol')
var getRelayRequest = require('./lib/index.js');
const { Wallet } = require('@ethersproject/wallet');
require('dotenv').config();

contract('Bridge Contract', (accounts) => {
    let tx, bridge
    let srcXId, usdcAmount
    let relayReq

    const web3 = new Web3("http://localhost:8545")
    const usdcContract = new web3.eth.Contract(usdcABI, usdcAddr)
    
    let usdcHolder = "0xcffad3200574698b78f32232aa9d63eabd290703"
    let signers = [process.env.ADDR]
    // signers.sort((a, b) => (a.toLowerCase() > b.toLowerCase() ? 1 : -1));
    const powers = [10]

    before(async() => {
        bridge = await Bridge.deployed()
    })
    
    it("reset signers", async() => {
        await bridge.resetSigners(signers, powers)
    })

    it('send USDT from ETH to Polygon', async() => {
        usdcAmount = web3.utils.toWei("10", "mwei")

        let dstChainId = 1337
        let nonce = 100
        let maxSlippage = 10788

        await usdcContract.methods.approve(bridge.address, usdcAmount).send({from: usdcHolder})
        tx = await bridge.send(usdcHolder, usdcAddr, usdcAmount, dstChainId, nonce, maxSlippage, {from: usdcHolder})
        srcXId = tx.logs[0].args['transferId']
    })

    it("get relay request", async() => {
        const privateKeys = [process.env.PRIVATE]
        
        let signers1 = []

        for (let i = 0 ; i < privateKeys.length ; i++) {
            let temp = new Wallet(privateKeys[i])
            signers1.push(temp)
        }

        relayReq = await getRelayRequest(usdcHolder, usdcHolder, usdcAddr, usdcAmount, 1337, 1337, srcXId, signers1, bridge.address)
    })

    it("relay usdt on polygon", async() => {
        console.log(relayReq.relayBytes, relayReq.sigs, signers, powers)
        await bridge.relay(relayReq.relayBytes, relayReq.sigs, signers, powers)
    })
})