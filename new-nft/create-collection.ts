const { createEscrowAccount, createNft, fetchDigitalAsset, mplTokenMetadata } = require("@metaplex-foundation/mpl-token-metadata");
const { airdropIfRequired, getExplorerLink, getKeypairFromFile } = require("@solana-developers/helpers");
const { createUmi } = require("@metaplex-foundation/umi-bundle-defaults");

const { Connection, LAMPORTS_PER_SOL, clusterApiUrl } = require("@solana/web3.js");
const { generateSigner, keypairIdentity, percentAmount } = require("@metaplex-foundation/umi");

(async () => {
    const connection = new Connection(clusterApiUrl("devnet"));

    const user = await getKeypairFromFile();

    await airdropIfRequired(connection, user.publicKey, 1 * LAMPORTS_PER_SOL, 0.5 * LAMPORTS_PER_SOL);

    console.log("Loaded user", user.publicKey.toBase58());

    const umi = createUmi(connection.rpcEndpoint);
    umi.use(mplTokenMetadata());

    const umiUser = umi.eddsa.createKeypairFromSecretKey(user.secretKey);
    umi.use(keypairIdentity(umiUser));

    console.log("Set up Umi instance for user!");

    const collectionMint = generateSigner(umi);

    const txn = createNft(umi, {
        mint: collectionMint,
        name: "W Collection",
        symbol: "WC",
        uri: "",
        sellerFeeBasisPoints: percentAmount(0),
        isCollection: true
    });

    await txn.sendAndConfirm(umi);

    const createdCollectionNFT = await fetchDigitalAsset(umi, collectionMint.publicKey);

    console.log(`Created collection 📦! Address is ${getExplorerLink(
        "address",
        createdCollectionNFT.mint.publicKey,
        "devnet"
    )}`);
})();

//Loaded user 9Eis2fKZpAcZyVSbDdnuBZJ2f74SkSjAC7dx1GsAhNwz
//Set up Umi instance for user!
//Created collection 📦! Address is https://explorer.solana.com/address/xWizogTV7yPSxVqps4vdGbVbP7RNvQ4adfKKwc2ipfk?cluster=devnet