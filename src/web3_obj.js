import Web3 from "web3";
import {getPublicKeyFromPrivateKey} from "./encryption.js";
import {readFile} from 'fs/promises';
import {Contract, ethers} from "ethers";

export const provider = new ethers.providers.JsonRpcProvider(process.env.PROVIDER_URL)
//const signer = await provider.getSigner();
export const web3 = new Web3(process.env.PROVIDER_URL)

export const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

export let PublicKey = getPublicKeyFromPrivateKey(process.env.PRIVATE_KEY);

export async function getLaunchpadContract(contractAddress) {
    const Launchpad_abi = JSON.parse(
        await readFile(
            new URL('./contract_abis/aigen_launchpad.json', import.meta.url)
        )
    );
    return new Contract(contractAddress,
        Launchpad_abi, wallet);
}

export async function getAINFTTokenContract(contractAddress) {
    const ainft_abi = JSON.parse(
        await readFile(
            new URL('./contract_abis/ainft_token.json', import.meta.url)
        )
    );

    return new ethers.Contract(contractAddress, ainft_abi, wallet);
}

export async function getGasPrice() {
    return (await provider.getGasPrice()).toNumber()
}

export async function getNonce(signer) {
    return await provider.getTransactionCount(wallet.address)
}
