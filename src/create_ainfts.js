import {getAINFTTokenContract, getLaunchpadContract} from "./web3_obj.js";
import {deployFileToNFTStorage} from "./nftstorage.js";
import fs1 from "fs";
import fs from "fs/promises";
import fs_promises from "fs/promises";
import path from "path";
import ethers from "ethers";

/**
 * Mint AINFT
 * @param tokenURI
 * @returns {Promise<*|null>}
 */
export async function mintAINFT(tokenURI) {
    console.log("\nMinting AINFT...")
    let ainftContract = await getAINFTTokenContract(process.env.AINFT_CONTRACT_ADDRESS)
    let rawTxn = await ainftContract.safeMint(process.env.ACCOUNT_ADDRESS, tokenURI)
    let receipt = await rawTxn.wait()

    if (receipt) {
        const event = receipt.events.find(event => event.event === 'Transfer');
        console.log("Transaction successful!!!" + '\n' + "Transaction Hash:", (await rawTxn).hash + '\n' + "Block Number: " + (
            await receipt
        ).blockNumber + '\n' + "TokenId: " + event.args.tokenId.toNumber())
        return event
    } else {
        console.log("Error submitting transaction!")
        return null
    }
}

/**
 * Deploy and mint a single AINFT
 * @param fileName
 * @param dirPath
 * @returns {Promise<{dataCid: string, fileName: *, format: string, metadataCid: string}>}
 */
export async function createAINFT(fileName, dirPath) {
    let single_metadata = await deployFileToNFTStorage(fileName, dirPath)
    const tokenURI = "https://" + single_metadata.metadataCid + ".ipfs.nftstorage.link";
    let minting_event = await mintAINFT(tokenURI)
    single_metadata.tokenId = minting_event.args.tokenId.toNumber();
    return single_metadata;
}

/**
 * Create multiple AINFTs
 * @param projectId
 * @param projectName
 * @returns {Promise<boolean>}
 */
export async function createAINFTs(projectId, projectName) {
    let projectDir = path.join(process.env.PROJECTS_DIR, projectName + "_" + projectId)
    let final_shards = path.join(projectDir, "final_shards")
    const metadata_file = path.join(projectDir, projectName + "_metadata.json")

    let tokenList = [];

    let fileNames = await fs_promises.readdir(final_shards);

    for (let fileName in fileNames) {
        let single_metadata = await createAINFT(fileName, final_shards)
        tokenList.push(single_metadata.tokenId)
        saveMetadataToFile(single_metadata, metadata_file)
    }

    await linkAINFTToProject(projectId, tokenList)

    console.log("\nAll files processed!")
    console.log("Final metadata file: ", metadata_file)
    return true;
}

/**
 * Link AINFT to project
 * @param projectId
 * @param tokenList
 * @returns {Promise<void>}
 */
export async function linkAINFTToProject(projectId, tokenList) {
    // Link to Project
    try {
        let launchpadContract = await getLaunchpadContract(process.env.AIGEN_LAUNCHPAD_CONTRACT_ADDRESS);
        let nftLink = await launchpadContract.createAINFT(projectId, process.env.AINFT_CONTRACT_ADDRESS,
            tokenList, {value: ethers.utils.parseEther("0.0000001")});
        let receipt = await nftLink.wait()

        if (receipt) {
            const event = receipt.events.find(event => event.event === 'Transfer');
            console.log("Transaction successful!!!" + '\n' + "Transaction Hash:", (await nftLink).hash + '\n' + "Block Number: " + (
                await receipt
            ).blockNumber)
            return event
        } else {
            console.log("Error submitting transaction!")
            return null;
        }
    } catch (error) {
        console.error('Contract interaction error:', error);
        return null;
    }
}

/**
 * Save minting metadata to a json file
 * @param single_metadata
 * @param metadata_file
 */
function saveMetadataToFile(single_metadata, metadata_file) {
    // File writing task
    try {
        if (fs1.existsSync(metadata_file)) {
            fs.readFile(metadata_file).then(content => {
                let model_metadata = JSON.parse(content.toString())
                model_metadata.push(single_metadata)

                fs.writeFile(metadata_file, JSON.stringify(model_metadata), {flag: 'w'}).then(r => {
                })
            })
        } else {
            fs.writeFile(metadata_file, JSON.stringify([single_metadata]), {flag: 'w'}).then(r => {
            })
        }
    } catch (err) {
        console.error(err)
        fs.writeFile(metadata_file, JSON.stringify([single_metadata]), {flag: 'w'}).then(r => {
        })
    }
}

/**
 * Get AINFT for project id
 * @param projectId
 * @returns {Promise<*|null>}
 */
export async function getAINFTByProjectId(projectId) {
    // Link to Project
    try {
        let launchpadContract = await getLaunchpadContract(process.env.AIGEN_LAUNCHPAD_CONTRACT_ADDRESS);
        let ainfts = await launchpadContract.getAINFTByProject(projectId);
        console.log("ainfts:", ainfts)
        return ainfts
    } catch (error) {
        return null;
    }
}
