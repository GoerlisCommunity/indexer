export interface ChainConfig {
    name: string
    chainId: number
    startBlock: number,
    confirmation: number,
    subprotocol: {
        [key: string]: {
            opcode: { [key: string]: number }
        }
    }
    contentType: { [key: string]: number }
    defaultContentType: string
}

export const goerliConfig: ChainConfig = {
    name: "Goerli",
    chainId: 5,
    startBlock: 10246387,
    confirmation: 5,
    defaultContentType: "application/json",
    subprotocol: {
        "grc-20": {
            opcode: {
                "bridge-send": 10246387
            }
        }
    },
    contentType: {
        "application/json": 10246387
    }
}

export const mainnetConfig: ChainConfig = {
    name: "Mainnet",
    chainId: 1,
    startBlock: 18832512,
    confirmation: 5,
    defaultContentType: "application/json",
    subprotocol: {
        "grc-20": {
            opcode: {
                "bridge-recv": 18832512
            }
        }
    },
    contentType: {
        "application/json": 18832512
    }
}
