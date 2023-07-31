import {Blob} from 'nft.storage'
import fs from "fs";
import fs_promises from "fs/promises";
import path from "path";
import https from "https";
import {client} from "./nftstorage_client.js";
import {encryptDataAES, encryptDataEth, generateInitVector, generateKey} from "./encryption.js";
import {PublicKey} from "./web3_obj.js";
import * as Name from 'w3name';
import fetch from 'node-fetch';

/**
 * Upload an encrypted file to NFT.Storage
 * @param fileName
 * @param dirPath
 * @returns {Promise<{dataCid: string, fileName, format: string, metadataCid: string}>}
 */
export async function deployFileToNFTStorage(fileName, dirPath) {
    console.log("\nProcessing:", fileName)

    console.log("Deploying file to NFTStorage")
    let content = await fs_promises.readFile(path.join(dirPath, fileName))

    // generate key for this file
    let contentPrivateKey = generateKey()
    let contentInitVector = generateInitVector()

    // encrypt content
    console.log("\nEncrypting content...")
    let encryptedContent = encryptDataAES(content.toString(), contentPrivateKey, contentInitVector)
    //console.log("Content encrypted using:", contentPrivateKey.toString('hex'))
    console.log("Content encrypted successfully!")

    let contentKeys = {
        key: contentPrivateKey.toString("hex"),
        iv: contentInitVector.toString("hex")
    }

    // encrypt keys
    console.log("\nEncrypting content keys...")
    let encryptedKeys = encryptDataEth(JSON.stringify(contentKeys), PublicKey)
    console.log("Content keys encrypted successfully!")

    console.log("\nUploading data to NFTStorage...")
    const result = await client.storeBlob(new Blob([encryptedContent]))
    console.log("Data uploaded successfully!")

    console.log("\nUploading metadata to NFTStorage...")
    let result1 = await client.storeBlob(new Blob([JSON.stringify({
        name: fileName, cid: result.toString(),
        keys: encryptedKeys
    })]))
    console.log("Metadata uploaded successfully!")

    return {
        fileName: fileName,
        dataCid: result.toString(),
        format: "json",
        metadataCid: result1.toString()
    }
}

/**
 * Upload encrypted files to NFT.Storage
 * @param dirPath
 * @returns {Promise<*[]>}
 */
export async function deployFilesToNFTStorage(dirPath) {
    let fileNames = await fs_promises.readdir(dirPath);
    let all_metadata = [];

    for (const fileName of fileNames) {
        let final_metadata = deployFileToNFTStorage(fileName, dirPath)
        all_metadata.push(final_metadata)
    }

    return all_metadata;
}

/**
 * Download file from NFT.Storage
 * @param url - NFTStorage file url
 * @param filePath - local file path
 * @returns {Promise<void>}
 */
export async function downloadFileFromNFTStorage(url, filePath) {
    const file = fs.createWriteStream(filePath);
    const request = https.get(url, function (response) {
        response.pipe(file);

        // after download completed close filestream
        file.on("finish", () => {
            file.close();
            console.log("Download Completed");
        });
    });
}

/**
 * Upload image to NFT.Storage
 * @param imageBuffer
 * @returns {Promise<string>}
 */
export async function uploadImageToNFTStorage(imageBuffer) {
    const response = await fetch('https://api.nft.storage/upload', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.NFTSTORAGE_TOKEN}`,
        },
        body: imageBuffer,
    });

    const data = await response.json();
    return `https://${data.value.cid}.ipfs.nftstorage.link/`;
}

/**
 * upload json data to NFT.Storage
 * @param jsonData
 * @returns {Promise<string>}
 */
export async function uploadJSONToNFTStorage(jsonData) {
    const response = await fetch('https://api.nft.storage/upload', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.NFTSTORAGE_TOKEN}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(jsonData)
    });

    const data = await response.json();
    let upload_link = `https://${data.value.cid}.ipfs.nftstorage.link/`
    console.log("File link:", upload_link)
    return upload_link;
}

/**
 * create a w3name url
 * @param url
 * @returns {Promise<string>}
 */
export async function createW3NameLink(url) {
    console.log("Url:", url)
    const w3name = await Name.create();

    const revision = await Name.v0(w3name, url);
    await Name.publish(revision, w3name.key);
    return w3name.toString();
}

/**
 * Save w3name signing keys for a project
 * @param w3name
 * @param projectId
 * @param projectName
 * @returns {Promise<null|string>}
 */
export async function saveSigningKeys(w3name, projectId, projectName) {
    let keys = JSON.stringify(w3name)

    let projectDir = path.join(process.env.PROJECTS_DIR, projectName + "_" + projectId)

    // save w3name signing keys
    let w3name_keys_filepath = path.join(projectDir, "w3name-keys.txt")
    try {
        await fs_promises.writeFile(w3name_keys_filepath, keys);
        return w3name_keys_filepath;
    } catch (error) {
        console.error(error);
        return null;
    }
}