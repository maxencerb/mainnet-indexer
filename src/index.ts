import { ponder } from "@/generated";
import type { Address } from "viem";
import { fromEidToChainId } from "./utils";

ponder.on("SafeContract:SafeSetup", async ({ context, event }) => {
  const { SyncSafeChainInstance } = context.db;
  const chain = context.network.chainId;

  // const address = getSafeAddress(initBytecodeHash, keccak256(event.args.initializer), event.args., chaindId, factory)
  await SyncSafeChainInstance.create({
    id: `${event.log.address}-${context.network.chainId}`,
    data: {
      chainId: context.network.chainId,
      address: event.log.address,
      deployedAt: event.block.timestamp,
      localOwners: event.args.owners as Address[],
      localThreshold: event.args.threshold,
      creationTxHash: event.transaction.hash,
    },
  });
});

ponder.on("SafeContract:AddedOwner", async ({ context, event }) => {
  const { SyncSafeChainInstance } = context.db;
  await SyncSafeChainInstance.update({
    id: `${event.log.address}-${context.network.chainId}`,
    data: ({ current }) => ({
      localOwners: [...current.localOwners, event.args.owner],
    }),
  });
});

ponder.on("SafeContract:RemovedOwner", async ({ context, event }) => {
  const { SyncSafeChainInstance } = context.db;
  await SyncSafeChainInstance.update({
    id: `${event.log.address}-${context.network.chainId}`,
    data: ({ current }) => ({
      localOwners: current.localOwners.filter(
        (owner) => owner !== event.args.owner,
      ),
    }),
  });
});

ponder.on("SafeContract:ChangedThreshold", async ({ context, event }) => {
  const { SyncSafeChainInstance } = context.db;
  await SyncSafeChainInstance.update({
    id: `${event.log.address}-${context.network.chainId}`,
    data: {
      localThreshold: event.args.threshold,
    },
  });
});

ponder.on("SyncSafeModule:SyncSafeCreated", async ({ context, event }) => {
  const { SyncSafe, SyncSafeChainInstance } = context.db;

  const address = await context.client.readContract({
    address: context.contracts.SyncSafeModule.address,
    abi: context.contracts.SyncSafeModule.abi,
    functionName: "getAddressOnEid",
    args: [event.args.params.creationParams, 0],
  });

  const instance = await SyncSafeChainInstance.update({
    id: `${event.args.proxyAddress}-${context.network.chainId}`,
    data: {
      syncSafeId: address,
    },
  });

  await SyncSafe.upsert({
    id: address,
    update: {},
    create: {
      threshold: instance.localThreshold,
      owners: instance.localOwners,
      originChain: context.network.chainId,
      chains: [
        ...event.args.params.chaindIds.map((eid) => fromEidToChainId(eid)),
        context.network.chainId,
      ],
      creationTxHash: event.transaction.hash,
    },
  });
});

ponder.on("SyncSafeModule:EmitNewState", async ({ context, event }) => {
  const { SyncSafe } = context.db;
  // try {
  await SyncSafe.update({
    id: event.args.topLevel,
    data: {
      threshold: event.args.threshold,
      owners: event.args.owners as Address[],
    },
  });
  // } catch (e) {
  //   console.log(event);
  //   console.log(e);
  // }
});
