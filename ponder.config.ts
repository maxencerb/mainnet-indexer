import { createConfig } from "@ponder/core";
import { http } from "viem";

import { arbitrum, base } from "viem/chains";
import { SafeABI } from "./abis/SafeABI";
import { SyncSafeABI } from "./abis/SyncSafeABI";
import { SafeProxyFactoryABI } from "./abis/SafeProxyFactory";

export default createConfig({
  networks: {
    arbitrum: {
      chainId: arbitrum.id,
      transport: http(process.env.ARBITRUM_RPC_URL),
    },
    base: {
      chainId: base.id,
      transport: http(process.env.BASE_RPC_URL),
    },
  },
  contracts: {
    SafeContract: {
      abi: SafeABI,
      factory: {
        address: "0xa6B71E26C5e0845f74c812102Ca7114b6a896AB2",
        event: SafeProxyFactoryABI[0],
        parameter: "proxy",
      },
      network: {
        arbitrum: {
          startBlock: 232027583,
        },
        base: {
          startBlock: 17074252,
        },
      },
    },
    SyncSafeModule: {
      abi: SyncSafeABI,
      address: "0x8991690990Ea0A47B41c67c7Fa82d717387eAcD9",
      network: {
        arbitrum: {
          startBlock: 232027583,
        },
        base: {
          startBlock: 17074252,
        },
      },
    },
  },
});
