<div align="center">
<img src="https://aigenprotocol.com/static/media/aigen-logo-light.fad5403b0fa280336867e8ea8400db40.svg" />
<h3>
Aigenjs
</h3>
Nodejs library
</div>

### create environment variables

#### create a .env file and put these variables

```
PROJECTS_DIR=/Users/apple/aigen
ACCOUNT_ADDRESS=0x0000000000000000000000000000000000000000
PRIVATE_KEY=000000000000000000000000000000000000000000000000000000000000000
AINFT_CONTRACT_ADDRESS=0x000000000000000000000000000000000000
PROVIDER_URL=http://0.0.0.0:8545
NFTSTORAGE_TOKEN=<NFTStorage Token>
AIGEN_LAUNCHPAD_CONTRACT_ADDRESS=0x000000000000000000000000000000000
```

### compile & deploy AINFTToken.sol smart contract
The smart contract can be found at contracts->AINFTToken.sol

##### compile
```
npm run compileAINFTTokenContract
```

#### deploy
```
npm run deployAINFTTokenContract
```
this will automatically deploy the smart contract to 'PROVIDER_URL'

Note:
* Using Remix IDE, deploy the smart contract to the local Ganache or Goerli testnet.
* It is recommended that you test the smart contract before deploying it to the mainnet.
