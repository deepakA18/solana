import { createEscrowAccount, createNft, fetchDigitalAsset, mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";
import { airdropIfRequired, getExplorerLink, getKeypairFromFile } from "@solana-developers/helpers";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";

import { Connection, LAMPORTS_PER_SOL, clusterApiUrl } from "@solana/web3.js";
import { generateSigner, keypairIdentity, percentAmount, publicKey} from "@metaplex-foundation/umi";


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

    const collectionAddress =  publicKey("xWizogTV7yPSxVqps4vdGbVbP7RNvQ4adfKKwc2ipfk");

    console.log("Creating NFT...");

    const mint = generateSigner(umi);

    const transaction = await createNft(umi,
        {
            mint,
            name: "W NFT1",
            uri: "",
            sellerFeeBasisPoints: percentAmount(0),
            collection: {
                key: collectionAddress,
                verified: false
            }
        });

        await transaction.sendAndConfirm(umi);

        const createdNft = await fetchDigitalAsset(umi, mint.publicKey);

        console.log(`Created NFT! Address is ${getExplorerLink("address", createdNft.mint.publicKey, "devnet")}`);
}
)();