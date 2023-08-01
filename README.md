<div align="center">
<img src="https://aigenprotocol.com/static/media/aigen-logo-light.fad5403b0fa280336867e8ea8400db40.svg" />
<h3>
Aigenjs
</h3>
Aigen's nodejs library containing scripts to upload/download files to/from NFT.Storage, mint AINFTs, download AINFTs, compile/deploy 
smart contracts, and other helper functions
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

### install node dependencies

```
npm install

or 

yarn
```

### compile & deploy smart contracts
The smart contracts can be found inside the contracts directory

1. AINFTToken.sol
2. AigenLaunchpad.sol

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
* You can also use Remix IDE to deploy the smart contract to the local Ganache or Goerli testnet.
* It is recommended that you test the smart contract before deploying it to the mainnet.

### create AI project

```
npm run ainft --action="createAIProject" --project_name="test" --project_description="test project" 
--project_logo_path="<project_logo_path>" --project_banner_path="<project_banner_path>"
```

### mint AINFTs

```
npm run ainft --action="createAINFT" --project_id="10" --project_name="test"
```
this step will deploy files to NFTStorage and mint AINFTs


### download AINFTs

```
npm run ainft --action=downloadAINFT --project_id="10" --project_name="test"
```
this will automatically download and decrypt the content of AINFTs


## License

<a href="LICENSE.rst"><img src="https://img.shields.io/github/license/aigenprotocol/aigenjs"></a>

This project is licensed under the MIT License - see the [LICENSE](LICENSE.rst) file for details
