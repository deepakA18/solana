import bs58 from 'bs58';

const privateKey = Uint8Array.from([
    142,151,48,121,53,151,69,26,78,14,102,7,98,217,21,22,
    139,34,148,0,226,63,25,246,185,230,5,131,59,134,175,158,
    122,97,97,76,223,238,179,63,130,23,139,56,69,14,201,105,
    28,240,56,54,87,32,252,94,170,143,55,164,238,219,226,57
]);

console.log(bs58.encode(privateKey));
