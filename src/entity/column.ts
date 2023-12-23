import { ColumnOptions } from "typeorm";

export const evmByteColumn: ColumnOptions = {
    type: "bytea", transformer: {
        to: (t: string) => `\\x${t.slice(2)}`,
        from: (t) => t,
    }
}

export const evmNumberColumn: ColumnOptions = {
    type: "numeric", precision: 78, scale: 0,
    transformer: {
        to: (t: bigint) => String(t),
        from: (t) => t
    }
}
