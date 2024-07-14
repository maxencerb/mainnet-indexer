import {
  type Address,
  type Hex,
  encodePacked,
  getContractAddress,
  keccak256,
} from "viem";

export function getSafeAddress(
  initBytecodeHash: Hex,
  initializerHash: Hex,
  nonce: bigint,
  chaindId: number,
  factory: Address,
) {
  const salt = keccak256(
    encodePacked(
      ["bytes32", "bytes32"],
      [
        initializerHash,
        keccak256(encodePacked(["uint", "uint32"], [nonce, chaindId])),
      ],
    ),
  );
  return getContractAddress({
    opcode: "CREATE2",
    salt,
    bytecodeHash: initBytecodeHash,
    from: factory,
  });
}

export function fromEidToChainId(eid: number): number {
  switch (eid) {
    case 40161:
      return 11155111;
    case 40245:
      return 84532;
    case 40231:
      return 421614;
    case 30110:
      return 42161;
    case 30184:
      return 8453;
    default:
      return 0;
  }
}
