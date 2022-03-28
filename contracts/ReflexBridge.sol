// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.9;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./libraries/PbBridge.sol";
import "./Pool.sol";

contract ReflexBridge is Pool {
    using SafeERC20 for IERC20;
    
    event Send(
        bytes32 transferId,
        address sender,
        address receiver,
        address token,
        uint256 amount,
        uint64 dstChainId,
        uint64 nonce,
        uint32 maxSlippage
    );

    mapping(bytes32 => bool) public transfers;
    mapping(address => uint256) public minSend; // send _amount must > minSend
    mapping(address => uint256) public maxSend;

    // min allowed max slippage uint32 value is slippage * 1M, eg. 0.5% -> 5000
    uint32 public minimalMaxSlippage;

    function send(
        address _receiver,
        address _token,
        uint256 _amount,
        uint64 _dstChainId,
        uint64 _nonce,
        uint32 _maxSlippage // slippage * 1M, eg. 0.5% -> 5000
    ) external nonReentrant whenNotPaused {
        bytes32 transferId = _send(_receiver, _token, _amount, _dstChainId, _nonce, _maxSlippage);
        IERC20(_token).safeTransferFrom(msg.sender, address(this), _amount);
        emit Send(transferId, msg.sender, _receiver, _token, _amount, _dstChainId, _nonce, _maxSlippage);
    }

    function _send(
        address _receiver,
        address _token,
        uint256 _amount,
        uint64 _dstChainId,
        uint64 _nonce,
        uint32 _maxSlippage
    ) private returns (bytes32) {
        require(_amount > minSend[_token], "amount too small");
        require(maxSend[_token] == 0 || _amount <= maxSend[_token], "amount too large");
        require(_maxSlippage > minimalMaxSlippage, "max slippage too small");
        bytes32 transferId = keccak256(
            // uint64(block.chainid) for consistency as entire system uses uint64 for chain id
            abi.encodePacked(msg.sender, _receiver, _token, _amount, _dstChainId, _nonce, uint64(block.chainid))
        );
        require(transfers[transferId] == false, "transfer exists");
        transfers[transferId] = true;
        return transferId;
    }
}