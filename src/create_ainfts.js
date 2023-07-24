import {getLaunchpadContract, getAINFTTokenContract} from "./web3_obj.js";
import {deployFilesToNFTStorage} from "./nftstorage.js";
import fs1 from "fs";
import fs from "fs/promises";
import path from "path";

export async function mintNFT(tokenURI) {
    console.log("\nMinting AINFT...")
    let ainftContract = await getAINFTTokenContract(process.env.AINFT_CONTRACT_ADDRESS)
    console.log(ainftContract, process.env.ACCOUNT_ADDRESS)
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

export async function createAINFT(projectId, projectName) {
    let projectDir = path.join(process.env.PROJECTS_DIR, projectName+"_"+projectId)
    let final_shards = path.join(projectDir, "final_shards")
    const metadata_file = path.join(projectDir, projectName + "_metadata.json")

    let final_metadata = await deployFilesToNFTStorage(final_shards);
    // let final_metadata = await fs.readFile(metadata_file);
    // final_metadata = JSON.parse(final_metadata.toString())
    let tokenList = [];

    for (let i = 0; i < final_metadata.length; i++) {
        let single_metadata = final_metadata[i];
        const tokenURI = "https://" + single_metadata.metadataCid + ".ipfs.nftstorage.link";
        let minting_event = await mintNFT(tokenURI)
        single_metadata.tokenId = minting_event.args.tokenId.toNumber();
        tokenList.push(minting_event.args.tokenId.toNumber())

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

    // Link to Project
    try {
        let launchpadContract = await getLaunchpadContract(process.env.AIGEN_LAUNCHPAD_CONTRACT_ADDRESS);
        let nftLink = await launchpadContract.createAINFT(projectId, process.env.AINFT_CONTRACT_ADDRESS, tokenList);

        nftLink.wait().then(async (receipt) => {
            console.log("AINFTs linked to the AI project", receipt)
        }).catch(error => {
            console.error('Transaction error:', error);
        });
    } catch (error) {
        console.error('Contract interaction error:', error);
    }

    console.log("\nAll files processed!")
    console.log("Final metadata file: ", metadata_file)
    return true;
}
