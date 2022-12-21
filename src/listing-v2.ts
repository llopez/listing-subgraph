import { BigInt, store } from "@graphprotocol/graph-ts";
import {
  ItemAdded as ItemAddedEvent,
  ItemVoted as ItemVotedEvent,
  ItemRemoved as ItemRemovedEvent,
} from "../generated/ListingV2/ListingV2";
import { Item, User, Vote } from "../generated/schema";
import { BIG_INT_ONE, BIG_INT_ZERO } from "./utils/constants";

export function handleItemRemoved(event: ItemRemovedEvent): void {
  const id = event.params.id;

  store.remove("Item", id.toString());
}

export function handleItemAdded(event: ItemAddedEvent): void {
  const id = event.params.id;
  const title = event.params.title;
  const author = event.params.author;

  let user = User.load(author);

  if (user) {
    user.itemsCount = user.itemsCount.plus(BIG_INT_ONE);
  } else {
    user = new User(author);
    user.votesCount = BIG_INT_ZERO;
    user.itemsCount = BIG_INT_ONE;
  }
  user.save();

  const item = new Item(id.toString());
  item.author = author;
  item.title = title;
  item.votesCount = BIG_INT_ZERO;
  item.blockNumber = event.block.number;
  item.blockTimestamp = event.block.timestamp;
  item.transactionHash = event.transaction.hash;
  item.save();
}

export function handleItemVoted(event: ItemVotedEvent): void {
  // guard clause: ListingV2 endBlock
  if (event.block.number.ge(BigInt.fromI32(8176478))) return;

  const id = event.params.id;

  const item = Item.load(id.toString());

  if (!item) return;

  const voteId =
    event.transaction.hash.toHex() + "-" + event.logIndex.toString();

  const vote = new Vote(voteId);
  vote.item = item.id;
  vote.blockNumber = event.block.number;
  vote.blockTimestamp = event.block.timestamp;
  vote.transactionHash = event.transaction.hash;
  vote.save();

  item.votesCount = item.votesCount.plus(BIG_INT_ONE);

  item.save();
}
