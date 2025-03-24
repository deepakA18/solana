const { createNft, fetchDigitalAsset, mplTokenMetadata } = require("@metaplex-foundation/mpl-token-metadata");
const { airdropIfRequired, getExplorerLink, getKeypairFromFile } = require("@solana-developers/helpers");
const { createUmi } = require("@metaplex-foundation/umi-bundle-defaults");
const { Connection, LAMPORTS_PER_SOL, clusterApiUrl } = require("@solana/web3.js");
const { generateSigner, keypairIdentity, percentAmount, publicKey } = require("@metaplex-foundation/umi");

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

    const collectionAddress = publicKey("xWizogTV7yPSxVqps4vdGbVbP7RNvQ4adfKKwc2ipfk");

    console.log("Creating NFT...");

    const mint = generateSigner(umi);

    const transaction = await createNft(umi,
        {
            mint,
            name: "W NFT1",
            uri: "https://raw.githubusercontent.com/deepakA18/solana/main/new-nft/nft.json",
            sellerFeeBasisPoints: percentAmount(0),
            collection: {
                key: collectionAddress,
                verified: false
            }
        });

    await transaction.sendAndConfirm(umi);

    const createdNft = await fetchDigitalAsset(umi, mint.publicKey);

    console.log(`Created NFT! Address is ${getExplorerLink("address", createdNft.mint.publicKey, "devnet")}`);
})();