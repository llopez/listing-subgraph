import { ItemAdded as ItemAddedEvent } from "../generated/ListingV2/ListingV2";
import { Item, User } from "../generated/schema";
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
