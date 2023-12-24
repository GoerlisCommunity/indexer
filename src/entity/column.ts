import { ColumnOptions } from "typeorm";

export const evmByteColumn: ColumnOptions = {
    type: "bytea", transformer: {
        to: (t: string) => `\\x${t.slice(2)}`,
        from: (t: Buffer) => t.toString(),
    }
}

export const evmAddressColumn: ColumnOptions = {
    type: "bytea", transformer: {
        to: (t: string) => `\\x${t.slice(2)}`,
        from: (t: Buffer) => `0x${t.toString("hex")}`,
    }
}

export const evmNumberColumn: ColumnOptions = {
    type: "numeric", precision: 78, scale: 0,
    transformer: {
        to: (t: bigint) => String(t),
        from: (t) => t
    }
}
