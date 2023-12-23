import Hapi, { ResponseObject } from "@hapi/hapi";
import debug from "debug";
import { ethers } from "ethers";
import { Boom } from "@hapi/boom";

export function jsonEncode(obj: any): string {
    return JSON.stringify(obj, (k, v) => typeof v === "bigint" ? v.toString() : v)
}

export function verifySignature(address: string, ts: string, sig: string): boolean {
    address = ethers.getAddress(address)
    const text = `\nWelcome to Goerlis.\nYour address: ${address}\nNonce: ${ts}\n`
    return ethers.verifyMessage(text, sig) === address
}

export abstract class IndexerApi {
    log: debug.Debugger
    err: debug.Debugger

    constructor(public name: string) {
        this.log = debug(`indexer:api:${name}:log`)
        this.log.log = console.log
        this.err = debug(`indexer:api:${name}:err`)
    }

    abstract register(server: Hapi.Server<Hapi.ServerApplicationState>): void;
}

export const verifyRequestAddress = (addr: string | undefined, r: Hapi.Request): boolean => {
    return !(process.env.API_NEED_SIG === "true" && String(addr).toLowerCase() !== String(r.headers['goerlis-addr']).toLowerCase())
}

export const initServer = async () => {
    const server = Hapi.server({
        port: Number(process.env.API_PORT),
        host: "localhost",
        debug: {
            request: process.env.API_DEBUG === "true" ? ['error'] : false
        },
        routes: {
            cors: {
                origin: process.env.API_ALLOWED_ORIGIN!!.split(/,/g),
                additionalHeaders: ["Goerlis-Nonce", "Goerlis-Sig", "Goerlis-Addr"]
            }
        }
    })

    if (process.env.API_NEED_SIG === "true") {
        server.ext('onPreAuth', async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
            if (request.path == "/") {
                return h.continue;
            }
            const userSigTime = request.headers['Goerlis-Nonce'];
            const userSignature = request.headers['Goerlis-Sig'];
            const userAddress = request.headers['Goerlis-Addr'];

            if ((Number(userSigTime) + Number(process.env.API_SIG_EXPIRY)) < Date.now() / 1000) {
                return h.response({ status: false, msg: 'Bad Request' }).code(400).takeover();
            }

            let recover;
            try {
                recover = verifySignature(userAddress, userSigTime, userSignature)
            } catch (error) {
                return h.response({ status: false, msg: 'Bad Request' }).code(400).takeover();
            }

            if (recover === false) {
                return h.response({ status: false, msg: 'Bad Request' }).code(400).takeover();
            }

            return h.continue;
        })
    }

    server.ext('onPreResponse', async (request, h) => {
        const { response } = request;
        // @ts-ignore
        if (response instanceof Boom) {
            const boomResponse = response as Boom;
            boomResponse.output.headers['Content-Type'] = 'application/json';
            boomResponse.output.headers['X-Powered-By'] = 'GoerlisIndexer/1.0.0';
        } else {
            (response as ResponseObject).header("Content-Type", "application/json")
                .header("X-Powered-By", "GoerlisIndexer/1.0.0");
        }

        return h.continue;
    })

    server.route({
        method: "GET",
        path: "/",
        handler: (r, h) => {
            return "Goerlis Indexer version 1.0.0"
        }
    })

    return server
}
