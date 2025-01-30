// TODO: Improve type safety
/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  WalletClient as ViemWalletClient,
  createPublicClient,
  http,
  TransactionRequest,
} from "viem";
import { EvmWalletProvider } from "./evm_wallet_provider";
import { Network } from "./wallet_provider";

/**
 * A wallet provider that uses the Viem library.
 */
export class ViemWalletProvider extends EvmWalletProvider {
  #walletClient: ViemWalletClient;

  /**
   * Constructs a new ViemWalletProvider.
   *
   * @param walletClient - The wallet client.
   */
  constructor(walletClient: ViemWalletClient) {
    super();
    this.#walletClient = walletClient;
  }

  /**
   * Signs a message.
   *
   * @param message - The message to sign.
   * @returns The signed message.
   */
  async signMessage(message: string): Promise<`0x${string}`> {
    const account = this.#walletClient.account;
    if (!account) {
      throw new Error("Account not found");
    }

    return this.#walletClient.signMessage({ account, message });
  }

  /**
   * Signs a typed data object.
   *
   * @param typedData - The typed data object to sign.
   * @returns The signed typed data object.
   */
  async signTypedData(typedData: any): Promise<`0x${string}`> {
    return this.#walletClient.signTypedData({
      account: this.#walletClient.account!,
      domain: typedData.domain!,
      types: typedData.types!,
      primaryType: typedData.primaryType!,
      message: typedData.message!,
    });
  }

  /**
   * Signs a transaction.
   *
   * @param transaction - The transaction to sign.
   * @returns The signed transaction.
   */
  async signTransaction(transaction: TransactionRequest): Promise<`0x${string}`> {
    const txParams = {
      account: this.#walletClient.account!,
      to: transaction.to,
      value: transaction.value,
      data: transaction.data,
      chain: this.#walletClient.chain,
    };

    return this.#walletClient.signTransaction(txParams);
  }

  /**
   * Sends a transaction.
   *
   * @param transaction - The transaction to send.
   * @returns The hash of the transaction.
   */
  async sendTransaction(transaction: TransactionRequest): Promise<`0x${string}`> {
    const txParams = {
      account: this.#walletClient.account!,
      to: transaction.to,
      value: transaction.value,
      data: transaction.data,
      chain: this.#walletClient.chain,
    };

    return this.#walletClient.sendTransaction(txParams);
  }

  /**
   * Gets the address of the wallet.
   *
   * @returns The address of the wallet.
   */
  getAddress(): string {
    return this.#walletClient.account?.address ?? "";
  }

  /**
   * Gets the network of the wallet.
   *
   * @returns The network of the wallet.
   */
  getNetwork(): Network {
    return {
      protocolFamily: "evm" as const,
      chainId: this.#walletClient.chain!.id! as any as string,
    };
  }

  /**
   * Gets the name of the wallet provider.
   *
   * @returns The name of the wallet provider.
   */
  getName(): string {
    return "viem_wallet_provider";
  }

  /**
   * Waits for a transaction receipt.
   *
   * @param txHash - The hash of the transaction to wait for.
   * @returns The transaction receipt.
   */
  async waitForTransactionReceipt(txHash: `0x${string}`): Promise<any> {
    const publicClient = createPublicClient({
      chain: this.#walletClient.chain,
      transport: http(),
    });

    return await publicClient.waitForTransactionReceipt({ hash: txHash });
  }
}
