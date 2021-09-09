import { helper } from "../../Utility/Helper";
import NetworkChannelHelperBase from "../NetworkChannelHelperBase";
import IPacketHandler from "./IPacketHandler";
import IPacketHeader from "./IPacketHeader";
import Packet from "./Packet";

const { ccclass } = cc._decorator;

@helper
@ccclass
class DefaultNetworkChannelHelper extends NetworkChannelHelperBase {

    private m_pSocket: WebSocket | null = null;
    private m_pChannel: atsframework.NetworkChannel | null = null;
    private m_pHeartBeatState: HeartBeatState = null;
    private m_pPacketHandler: IPacketHandler | null = null;

    private m_pPacketHeader: IPacketHeader | null = null;

    private m_id: number = 0;
    private m_bActive: boolean = false;
    private m_bWritable: boolean = false;
    private m_bReadable: boolean = false;

    private m_bResetHeartBeatElapseSecondsWhenReceivePacket: boolean = false;

    private m_pPacketPool: Packet[] = [];

    get id(): number {
        return this.m_id;
    }

    get isOpen(): boolean {
        return this.m_pSocket && this.m_pSocket.readyState == WebSocket.OPEN;
    }

    get isActive(): boolean {
        return this.m_bActive;
    }

    get isWritable(): boolean {
        return this.m_bWritable;
    }

    get isReadable(): boolean {
        return this.m_bReadable;
    }

    get resetHeartBeatElapseSecondsWhenReceivePacket(): boolean {
        return this.m_bResetHeartBeatElapseSecondsWhenReceivePacket;
    }

    set resetHeartBeatElapseSecondsWhenReceivePacket(value) {
        this.m_bResetHeartBeatElapseSecondsWhenReceivePacket = value;
    }

    registerPacketHandler(handler: IPacketHandler | null): void {
        this.m_pPacketHandler = handler;
    }

    connect(host: string, port: number, timeout: number = 30) {
        if (this.m_pSocket) {
            this.disconnect();
            this.m_pSocket = null;
        }

        let v_sUrl: string = `ws://${host}:${port}`;
        this.m_pSocket = new WebSocket(v_sUrl/*, protocols*/);
        this.m_pSocket.binaryType = 'arraybuffer';

        this.m_pSocket.onopen = (ev: Event): void => {
            this.m_bActive = true;
            this.m_bReadable = true;
            this.m_bWritable = true;

            if (this.m_pChannel) {
                this.m_pChannel.networkChannelOpened.iter((fn: atsframework.NetworkConnectedEventHandler) => {
                    fn(this.m_pChannel, this.m_pChannel.userData);
                });
            }
        };

        this.m_pSocket.onerror = (ev: any): void  => {
            if (this.m_pChannel) {
                this.m_pChannel.networkChannelError.iter((fn: atsframework.NetworkErrorEventHandler) => {
                    fn(this.m_pChannel, atsframework.NetworkErrorCode.SocketError, ev);
                });
            }
        };

        this.m_pSocket.onclose = (ev: CloseEvent): void => {
            if (this.m_pChannel) {
                this.m_pChannel.networkChannelClosed.iter((fn: atsframework.NetworkClosedEventHandler) => {
                    fn(this.m_pChannel);
                });
            }
        };

        this.m_pSocket.onmessage = (ev: MessageEvent): void => {
            if (this.m_pChannel) {
                if (this.m_pPacketHeader) {
                    this.processPacket(ev.data);
                } else {
                    this.processPacketHeader(ev.data);
                }
            }
        };
    }

    disconnect(): void {
        this.close(WebSocket.CLOSING);
    }

    close(): void;
    close(code: number): void;
    close(code?: number): void {
        if (!this.m_pSocket)
            return;

        this.m_bActive = false;
        this.m_bReadable = false;
        this.m_bWritable = false;

        try {
            this.m_pSocket.close(code ? code : WebSocket.CLOSED);
        } catch {
            // XXX: Error caught when close the socket.
        } finally {

        }

        if (this.m_pHeartBeatState) {
            this.m_pHeartBeatState.reset(true);
        }
    }

    read(): void {
        // NOOP.
    }

    write(msg: string | ArrayBuffer | Blob | ArrayBufferView): void {
        let v_pView: ArrayBufferView = null;
        throw new Error("Method not implemented.");
    }

    flush(): void {
        // NOOP.
    }

    writeAndFlush(msg: any): void {
        this.write(msg);
        this.flush();
    }

    private processPacketHeader(data: string | ArrayBuffer | ArrayBufferLike | Blob): boolean {
        const { header, customErrorData } = this.deserializePacketHeader(data);

        if (null != customErrorData && undefined != customErrorData) {
            if (this.m_pChannel && this.m_pChannel.networkChannelCustomError.isValid) {
                this.m_pChannel.networkChannelCustomError.iter((fn: atsframework.NetworkCustomErrorEventHander) => {
                    fn(this.m_pChannel, customErrorData);
                });
            }
        }

        if (!header) {
            let v_sErrorMessage: string = 'Packet header is invalid.';
            if (this.m_pChannel && this.m_pChannel.networkChannelError.isValid) {
                this.m_pChannel.networkChannelError.iter((fn: atsframework.NetworkErrorEventHandler) => {
                    fn(this.m_pChannel, atsframework.NetworkErrorCode.DeserializePacketHeadError, v_sErrorMessage);
                });
                return false;
            }

            throw new Error(v_sErrorMessage);
        }

        if (header.packetLength <= 0) {
            return this.processPacket(data);
        }

        return true;
    }

    private processPacket(data: string | ArrayBuffer | ArrayBufferLike | Blob): boolean {
        if (this.m_pHeartBeatState) {
            this.m_pHeartBeatState.reset(this.m_bResetHeartBeatElapseSecondsWhenReceivePacket);
        }

        const { packet, customErrorData } = this.deserializePacket(data);

        if (null != customErrorData && undefined != customErrorData) {
            if (this.m_pChannel && this.m_pChannel.networkChannelCustomError.isValid) {
                this.m_pChannel.networkChannelCustomError.iter((fn: atsframework.NetworkCustomErrorEventHander) => {
                    fn(this.m_pChannel, customErrorData);
                });
                return false;
            }
        }

        if (packet) {
            // fire packet events.
        }

        return true;
    }

    packetHeaderLength: number;

    initialize(networkChannel: atsframework.NetworkChannel): void {
        // TODO: initialize.
        this.m_pChannel = networkChannel;
    }

    shutdown(): void {
        this.close();
    }

    sendHeartBeat(): boolean {
        throw new Error("Method not implemented.");
    }

    serialize<T>(packet: T): boolean {
        throw new Error("Method not implemented.");
    }

    deserializePacketHeader(data: string | ArrayBuffer | ArrayBufferLike | Blob): { header: IPacketHeader, customErrorData: any } {
        if ('string' == typeof data) { // string data transfer no head needed.
            return {
                header: { packetLength: 0 },
                customErrorData: null
            };
        } else {
            // TODO:
        }
    }

    deserializePacket(data: string | ArrayBuffer | ArrayBufferLike | Blob): { packet: Packet, customErrorData: any } {
        if ('string' == typeof data) {
            return {
                packet: data,
                customErrorData: null
            };
        } else {
            return {
                packet: null,
                customErrorData: null
            };
        }
    }

} // class DefaultNetworkChannelHelper

class HeartBeatState {

    heartBeatElapseSeconds: number = 0;
    missHeartBeatCount: number = 0;

    reset(resetHeartBeatElapseSeconds: boolean): void {
        if (resetHeartBeatElapseSeconds)
            this.heartBeatElapseSeconds = 0;
        this.missHeartBeatCount = 0;
    }

} // class HeartBeatState