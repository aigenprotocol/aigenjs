import {createW3NameLink, saveSigningKeys, uploadImageToNFTStorage, uploadJSONToNFTStorage} from "./nftstorage.js";
import fs from "fs";
import {getLaunchpadContract} from "./web3_obj.js";
import {ethers} from "ethers";
import path from "path";

/**
 * Create AI Project
 * @param projectName
 * @param projectDescription
 * @param logo_filepath
 * @param banner_filepath
 * @returns {Promise<void>}
 */
export async function createAIProject(projectName, projectDescription, logo_filepath, banner_filepath) {
    // Upload the images to NFT.Storage
    let logoBuffer = await fs.readFileSync(logo_filepath)
    const logoUrl = await uploadImageToNFTStorage(logoBuffer);
    console.log('Logo uploaded:', logoUrl);

    let bannerBuffer = await fs.readFileSync(banner_filepath)
    const bannerUrl = await uploadImageToNFTStorage(bannerBuffer);
    console.log('Banner uploaded:', bannerUrl);

    // Create the project metadata
    const projectMetadata = {
        name: projectName,
        description: projectDescription,
        logo_uri: logoUrl,
        banner_uri: bannerUrl,
        status: "Created",
        owner: process.env.ACCOUNT_ADDRESS,
        project_price: 0,
        no_of_ainfts: 0
    };

    let projectMetadataUrl = await uploadJSONToNFTStorage(projectMetadata);
    console.log("Project metadata uploaded:", projectMetadataUrl)

    // create w3name link
    let w3name = createW3NameLink(projectMetadataUrl);

    try {
        let launchpadContract = await getLaunchpadContract(process.env.AIGEN_LAUNCHPAD_CONTRACT_ADDRESS);

        let createProjectTxn = await launchpadContract.createProject(w3name,
            {value: ethers.utils.parseEther("0.0000001")});

        createProjectTxn.wait()
            .then(async (receipt) => {
                const projectId = receipt.events[0].args.project_id.toNumber();
                console.log('Created project with ID:', projectId);

                // create project folder
                if (!fs.existsSync(path.join(process.env.PROJECTS_DIR, projectName + "_" + projectId))) {
                    fs.mkdirSync(path.join(process.env.PROJECTS_DIR, projectName + "_" + projectId))
                }

                await saveSigningKeys(w3name, projectId, projectName)
            })
            .catch(error => {
                console.error('Transaction error:', error);
            });
    } catch (error) {
        console.error('Contract interaction error:', error);
    }
}