import {
  ItemAdded as ItemAddedEvent,
  ItemVoted as ItemVotedEvent,
} from "../generated/ListingV2/ListingV2";
import { Item, User, Vote } from "../generated/schema";
import { BIG_INT_ONE, BIG_INT_ZERO } from "./utils/constants";

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
  const id = event.params.id;
  const _user = event.address;

  const item = Item.load(id.toString());

  if (!item) return;

  let user = User.load(_user);

  if (!user) {
    user = new User(_user);
    user.itemsCount = BIG_INT_ZERO;
    user.votesCount = BIG_INT_ZERO;
  }

  user.votesCount = user.votesCount.plus(BIG_INT_ONE);

  user.save();

  const voteId = _user
    .toHexString()
    .concat("-")
    .concat(id.toString());

  const vote = new Vote(voteId);
  vote.item = item.id;
  vote.user = _user;
  vote.blockNumber = event.block.number;
  vote.blockTimestamp = event.block.timestamp;
  vote.transactionHash = event.transaction.hash;
  vote.save();

  item.votesCount = item.votesCount.plus(BIG_INT_ONE);

  item.save();
}
