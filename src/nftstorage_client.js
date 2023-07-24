import {NFTStorage} from "nft.storage";

export const client = new NFTStorage({ token: process.env.NFTSTORAGE_TOKEN })
