type INetworkChannelHelper = atsframework.INetworkChannelHelper

export default abstract class NetworkChannelHelperBase extends cc.Component implements INetworkChannelHelper {

    channelOpened: atsframework.NetworkConnectedEventHandler;
	channelClosed: atsframework.NetworkClosedEventHandler;
    channelError: atsframework.NetworkErrorEventHandler;

    abstract get id(): number;
    abstract get isOpen(): boolean;
    abstract get isActive(): boolean;
    abstract get isWritable(): boolean;
    abstract get isReadable(): boolean;

    abstract connect(host: string, port: number): void;
    abstract connect(host: string, port: number, timeout: number): void;

    abstract disconnect(): void;

    abstract close(): void;

    abstract read(): void;

    abstract write(msg: any): void;

    abstract flush(): void;

    abstract writeAndFlush(msg: any): void;

    abstract get packetHeaderLength(): number;

    abstract initialize(networkChannel: atsframework.NetworkChannel): void;

    abstract shutdown(): void;

    abstract sendHeartBeat(): boolean;

    abstract serialize<T>(packet: T): boolean;

} // class NetworkChannelHelperBase
