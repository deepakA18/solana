import {createEscrowAccount, createNft, fetchDigitalAsset, mplTokenMetadata} from "@metaplex-foundation/mpl-token-metadata";
import {airdropIfRequired, getExplorerLink, getKeypairFromFile} from "@solana-developers/helpers";
import {createUmi} from "@metaplex-foundation/umi-bundle-defaults";

import {Connection, LAMPORTS_PER_SOL, clusterApiUrl} from "@solana/web3.js";
import { generateSigner, keypairIdentity, percentAmount } from "@metaplex-foundation/umi";


const connection =  new Connection(clusterApiUrl("devnet"));

const user = await getKeypairFromFile();

await airdropIfRequired(connection, user.publicKey, 1 * LAMPORTS_PER_SOL, 0.5 * LAMPORTS_PER_SOL);


console.log("Loaded user", user.publicKey.toBase58())

const umi = createUmi(connection.rpcEndpoint);
umi.use(mplTokenMetadata());

const umiUser = umi.eddsa.createKeypairFromSecretKey(user.secretKey);
umi.use(keypairIdentity(umiUser))

console.log("Set up Umi instance for user!");

const collectionMint = generateSigner(umi);

const txn =  createNft(umi, {
mint: collectionMint,
name: "W Collection",
symbol: "WC",
uri: "",
sellerFeeBasisPoints: percentAmount(0),
isCollection: true
});

await txn.sendAndConfirm(umi);

const createdCollectionNFT = await fetchDigitalAsset(umi,collectionMint.publicKey);

console.log(`Created collection 📦! Address is ${getExplorerLink(
    "address",
    createdCollectionNFT.mint.publicKey,
    "devnet"
)}` );

