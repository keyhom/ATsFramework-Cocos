import FrameworkComponent from "../Base/FrameworkComponent";
import Helper from "../Utility/Helper";
import NetworkChannelHelperBase from "./NetworkChannelHelperBase";
import EventComponent from "../Event/EventComponent";

type FrameworkModule = atsframework.FrameworkModule;
const FrameworkModule = atsframework.FrameworkModule;

type NetworkManager = atsframework.NetworkManager;
const NetworkManager = atsframework.NetworkManager;

type INetworkChannelHelper = atsframework.INetworkChannelHelper;

export let NetworkConnectedEventId = 'NetworkConnected';
export let NetworkClosedEventId = 'NetworkClosed';
export let NetworkMissHeartBeatEventId = 'NetworkMissHeartBeat';
export let NetworkErrorEventId = 'NetworkError';
export let NetworkCustomErrorEventId = 'NetworkCustomError';

export type NetworkConnectedEventArgs = {
	channel: atsframework.NetworkChannel,
	userData?: atsframework.UserData
};

export type NetworkClosedEventArgs = {
	channel: atsframework.NetworkChannel
};

export type NetworkMissHeartBeatEventArgs = {
	channel: atsframework.NetworkChannel,
	missCount: number
};

export type NetworkErrorEventArgs = {
	channel: atsframework.NetworkChannel,
	errorCode: atsframework.NetworkErrorCode,
	message?: string
};

export type NetworkCustomErrorEventArgs = {
	channel: atsframework.NetworkChannel,
	customErrorData?: any
};

const { ccclass, property, disallowMultiple, menu, inspector } = cc._decorator;

@ccclass
@disallowMultiple
@menu('ATsFramework Component/Network')
@inspector('packages://atsframework-cocos/inspector/default-inspector.js')
export default class NetworkComponent extends FrameworkComponent {

	@property({
		displayName: 'Network Channel Helper',
		tooltip: 'A Helper class actually driving network'
	})
	private m_sNetworkChannelHelperName: string = 'DefaultNetworkChannelHelper';

	private m_pNetworkManager!: NetworkManager;
	private m_pEventComponent!: EventComponent;

	onLoad(): void {
		super.onLoad();

		this.m_pNetworkManager = FrameworkModule.getOrAddModule(NetworkManager);
		if (!this.m_pNetworkManager) {
			throw new Error('NetworkManager is invalid.');
		}

		this.m_pNetworkManager.networkConnected.add(this.onNetworkConnected, this);
		this.m_pNetworkManager.networkClosed.add(this.onNetworkClosed, this);
		this.m_pNetworkManager.networkMissHeartBeat.add(this.onNetworkMissHeartBeat, this);
		this.m_pNetworkManager.networkError.add(this.onNetworkError, this);
		this.m_pNetworkManager.networkCustomError.add(this.onNetworkCustomError, this);
	}

	onDestroy(): void {
		if (this.m_pNetworkManager) {
			this.m_pNetworkManager.networkConnected.remove(this.onNetworkConnected, this);
			this.m_pNetworkManager.networkClosed.remove(this.onNetworkClosed, this);
			this.m_pNetworkManager.networkMissHeartBeat.remove(this.onNetworkMissHeartBeat, this);
			this.m_pNetworkManager.networkError.remove(this.onNetworkError, this);
			this.m_pNetworkManager.networkCustomError.remove(this.onNetworkCustomError, this);
		}
		this.m_pNetworkManager = null;
	}

	start(): void {
		this.m_pEventComponent = FrameworkComponent.getComponent(EventComponent);
		if (!this.m_pEventComponent) {
			throw new Error('Event component is invalid.');
		}
	}

	hasNetworkChannel(name: string): boolean {
		return this.m_pNetworkManager.hasNetworkChannel(name);
	}

	getNetworkChannel(name: string): atsframework.NetworkChannel {
		return this.m_pNetworkManager.getNetworkChannel(name);
	}

	getAllNetworkChannels(): atsframework.NetworkChannel[];
	getAllNetworkChannels(results: atsframework.NetworkChannel[]): atsframework.NetworkChannel[];
	getAllNetworkChannels(results?: atsframework.NetworkChannel[]): atsframework.NetworkChannel[] {
		return this.m_pNetworkManager.getAllNetworkChannels(results);
	}

	createNetworkChannel(name: string): atsframework.NetworkChannel;
	createNetworkChannel(name: string, networkChannelHelper: INetworkChannelHelper): atsframework.NetworkChannel;
	createNetworkChannel(name: string, networkChannelHelper?: INetworkChannelHelper): atsframework.NetworkChannel {
		networkChannelHelper = networkChannelHelper || this.createNetworkChannelHelper();
		return this.m_pNetworkManager.createNetworkChannel(name, networkChannelHelper);
	}

	destroyNetworkChannel(name: string): boolean {
		return this.m_pNetworkManager.destroyNetworkChannel(name);
	}

	private createNetworkChannelHelper(): INetworkChannelHelper {
		let v_pHelper: NetworkChannelHelperBase = Helper.createHelper(this.m_sNetworkChannelHelperName, null);
		if (!v_pHelper) {
			cc.error('Invalid network channel helper!');
			return null;
		}

		v_pHelper.node.name = `Network Channel Helper (${v_pHelper.id})`;
		v_pHelper.node.parent = this.node;
		v_pHelper.node.setScale(1);

		return v_pHelper;
	}

	private onNetworkConnected(networkChannel: atsframework.NetworkChannel, userData: atsframework.UserData): void {
		this.m_pEventComponent.emit(NetworkConnectedEventId, {
			channel: networkChannel,
			userData: userData
		} as NetworkConnectedEventArgs);
	}

	private onNetworkClosed(networkChannel: atsframework.NetworkChannel): void {
		this.m_pEventComponent.emit(NetworkClosedEventId, {
			channel: networkChannel
		} as NetworkClosedEventArgs);
	}

	private onNetworkMissHeartBeat(networkChannel: atsframework.NetworkChannel, missCount: number): void {
		this.m_pEventComponent.emit(NetworkMissHeartBeatEventId, {
			channel: networkChannel,
			missCount: missCount
		} as NetworkMissHeartBeatEventArgs);
	}

	private onNetworkError(networkChannel: atsframework.NetworkChannel, errorCode: atsframework.NetworkErrorCode, message: string): void {
		this.m_pEventComponent.emit(NetworkErrorEventId, {
			channel: networkChannel,
			errorCode: errorCode,
			message: message
		} as NetworkErrorEventArgs);
	}

	private onNetworkCustomError(networkChannel: atsframework.NetworkChannel, customErrorData: any): void {
		this.m_pEventComponent.emit(NetworkCustomErrorEventId, {
			channel: networkChannel,
			customErrorData: customErrorData
		} as NetworkCustomErrorEventArgs);
	}

} // class NetworkComponent

