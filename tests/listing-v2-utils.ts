import { newMockEvent } from "matchstick-as";
import { ethereum, Address, BigInt } from "@graphprotocol/graph-ts";
import {
  ItemAdded as ItemAddedEvent,
  ItemVoted as ItemVotedEvent,
} from "../generated/ListingV2/ListingV2";

export function createItemAddedEvent(
  id: BigInt,
  title: string,
  author: Address
): ItemAddedEvent {
  let event = changetype<ItemAddedEvent>(newMockEvent());

  event.parameters = new Array();

  event.parameters.push(
    new ethereum.EventParam("id", ethereum.Value.fromUnsignedBigInt(id))
  );
  event.parameters.push(
    new ethereum.EventParam("title", ethereum.Value.fromString(title))
  );
  event.parameters.push(
    new ethereum.EventParam("author", ethereum.Value.fromAddress(author))
  );

  return event;
}

export function createItemVotedEvent(id: BigInt): ItemVotedEvent {
  let event = changetype<ItemVotedEvent>(newMockEvent());

  event.parameters = new Array();

  event.parameters.push(
    new ethereum.EventParam("id", ethereum.Value.fromUnsignedBigInt(id))
  );

  return event;
}
