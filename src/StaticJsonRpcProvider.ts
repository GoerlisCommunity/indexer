import { ethers, Network } from "ethers";

export class StaticJsonRpcProvider extends ethers.JsonRpcProvider {
  async _detectNetwork(): Promise<Network> {
    // @ts-ignore
    let network = this["#network"];
    if (network == null) {
      // @ts-ignore
      this["#network"] = await super._detectNetwork();
    }
    // @ts-ignore
    return this["#network"];
  }
}
