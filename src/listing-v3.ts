import { ItemVoted as ItemVotedEvent } from "../generated/ListingV3/ListingV3";
import { Item, User, Vote } from "../generated/schema";
import { BIG_INT_ONE, BIG_INT_ZERO } from "./utils/constants";

export function handleItemVoted(event: ItemVotedEvent): void {
  const id = event.params.id;
  const voter = event.params.user;

  const item = Item.load(id.toString());

  if (!item) return;

  let user = User.load(voter);

  if (!user) {
    user = new User(voter);
    user.itemsCount = BIG_INT_ZERO;
    user.votesCount = BIG_INT_ZERO;
  }

  user.votesCount = user.votesCount.plus(BIG_INT_ONE);

  user.save();

  const voteId = voter
    .toHexString()
    .concat("-")
    .concat(id.toString());

  const vote = new Vote(voteId);
  vote.item = item.id;
  vote.user = voter;
  vote.blockNumber = event.block.number;
  vote.blockTimestamp = event.block.timestamp;
  vote.transactionHash = event.transaction.hash;
  vote.save();

  item.votesCount = item.votesCount.plus(BIG_INT_ONE);

  item.save();
}
