import Packet from "./Packet";

export default interface IPacketHandler {

    id: number;

    handle(packet: Packet): void;
    
} // interface IPacketHandler