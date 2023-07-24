import fs from "fs/promises";
import fs1 from "fs";
import path from "path";
import {downloadFileFromNFTStorage} from "./nftstorage.js";

export async function downloadAINFTs(metadata_path, download_dir) {
    fs.readFile(metadata_path).then(content => {
        let finalMetadata = JSON.parse(content.toString())
        for (const metadata3 of finalMetadata) {
            console.log(metadata3)
            if (!fs1.existsSync(download_dir)) {
                fs1.mkdirSync(download_dir);
            }

            downloadFileFromNFTStorage("https://" + metadata3.data_cid + ".ipfs.nftstorage.link",
                path.join(download_dir, metadata3.fileName))
        }
    })
}
