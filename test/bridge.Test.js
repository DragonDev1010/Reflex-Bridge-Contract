const Bridge = artifacts.require("./Bridge.sol")
const ReflexToken = artifacts.require("./ReflexToken.sol")

contract("bridge contract", (accounts) => {
    let bridge, reflexToken
    let amount = web3.utils.toWei("10", "ether")

    let signer, signerPrivateKey

    signer = accounts[9]
    signerPrivateKey = "0xbefca52d2b9467ac9e1f7d0410ad836009fe53673ea2db32340c6b6b2a669161"

    before(async() => {
        bridge = await Bridge.deployed()
        reflexToken =  await ReflexToken.deployed()
    })

    it("set signer", async() => {
        await bridge.setSigner(signer, {from: accounts[0]})
    })

    it('test lock method', async() => {
        await reflexToken.approve(bridge.address, amount, {from: accounts[0]})
        let tx = await bridge.lock(amount)
    })

    it('test unlock method', async() => {
        let msg
        let srcXId = 100
        let sender = accounts[0]
        msg = web3.eth.abi.encodeParameters(['uint256', 'uint256', 'address'],[srcXId, amount, sender])

        let signature = web3.eth.accounts.sign( msg, signerPrivateKey)

        await bridge.unlock(msg, signature.messageHash, Number(signature.v), signature.r, signature.s, {from: accounts[0]})
    })
})