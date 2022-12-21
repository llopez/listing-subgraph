import {
  assert,
  describe,
  test,
  clearStore,
  afterEach,
  beforeEach,
} from "matchstick-as/assembly/index";
import { Address, BigInt } from "@graphprotocol/graph-ts";
import { handleItemAdded, handleItemVoted } from "../src/listing-v2";
import { createItemAddedEvent, createItemVotedEvent } from "./listing-v2-utils";
import { Item, User } from "../generated/schema";
import { BIG_INT_ONE, BIG_INT_ZERO } from "../src/utils/constants";

describe("ListingV2", () => {
  afterEach(() => {
    clearStore();
  });

  describe("handleItemVoted", () => {
    beforeEach(() => {
      const id = BigInt.fromI32(1);
      const author = Address.fromString(
        "0x0000000000000000000000000000000000000001"
      );
      const item = new Item(id.toString());
      item.title = "Item #1";
      item.votesCount = BIG_INT_ZERO;
      item.author = author;
      item.blockNumber = BigInt.fromI32(100);
      item.blockTimestamp = BigInt.fromI32(1001);
      item.transactionHash = Address.fromString(
        "0x0000000000000000000000000000000000001111"
      );
      item.save();
    });

    describe("When new user", () => {
      test("Item updated: [votesCount]", () => {
        const id = BigInt.fromI32(1);
        const event = createItemVotedEvent(id);
        handleItemVoted(event);
        assert.fieldEquals("Item", "1", "votesCount", "1");
      });
      test("User created and update [votesCount]", () => {
        const id = BigInt.fromI32(1);
        const event = createItemVotedEvent(id);
        event.address = Address.fromString(
          "0x0000000000000000000000000000000000000002"
        );
        handleItemVoted(event);
        assert.entityCount("User", 1);
        assert.fieldEquals(
          "User",
          event.address.toHexString(),
          "votesCount",
          "1"
        );
      });
      test("Vote created", () => {
        const id = BigInt.fromI32(1);
        const event = createItemVotedEvent(id);
        event.address = Address.fromString(
          "0x0000000000000000000000000000000000000002"
        );
        handleItemVoted(event);

        const voteId = event.address
          .toHexString()
          .concat("-")
          .concat(id.toString());

        assert.entityCount("Vote", 1);
        assert.fieldEquals("Vote", voteId, "item", id.toString());
        assert.fieldEquals("Vote", voteId, "user", event.address.toHexString());
        assert.fieldEquals(
          "Vote",
          voteId,
          "blockNumber",
          event.block.number.toString()
        );
        assert.fieldEquals(
          "Vote",
          voteId,
          "blockTimestamp",
          event.block.timestamp.toString()
        );
        assert.fieldEquals(
          "Vote",
          voteId,
          "transactionHash",
          event.transaction.hash.toHexString()
        );
      });
    });

    describe("When recurring user", () => {
      beforeEach(() => {
        const address = Address.fromString(
          "0x0000000000000000000000000000000000000002"
        );
        const user = new User(address);
        user.votesCount = BIG_INT_ONE;
        user.itemsCount = BIG_INT_ZERO;
        user.save();
      });

      test("Item updated: [votesCount]", () => {
        const id = BigInt.fromI32(1);
        const event = createItemVotedEvent(id);
        handleItemVoted(event);
        assert.fieldEquals("Item", "1", "votesCount", "1");
      });

      test("Vote created", () => {
        const id = BigInt.fromI32(1);
        const event = createItemVotedEvent(id);
        event.address = Address.fromString(
          "0x0000000000000000000000000000000000000002"
        );
        handleItemVoted(event);

        const voteId = event.address
          .toHexString()
          .concat("-")
          .concat(id.toString());

        assert.entityCount("Vote", 1);
        assert.fieldEquals("Vote", voteId, "item", id.toString());
        assert.fieldEquals("Vote", voteId, "user", event.address.toHexString());
        assert.fieldEquals(
          "Vote",
          voteId,
          "blockNumber",
          event.block.number.toString()
        );
        assert.fieldEquals(
          "Vote",
          voteId,
          "blockTimestamp",
          event.block.timestamp.toString()
        );
        assert.fieldEquals(
          "Vote",
          voteId,
          "transactionHash",
          event.transaction.hash.toHexString()
        );
      });

      test("User updates [votesCount]", () => {
        const id = BigInt.fromI32(1);
        const event = createItemVotedEvent(id);
        event.address = Address.fromString(
          "0x0000000000000000000000000000000000000002"
        );
        handleItemVoted(event);

        assert.entityCount("User", 1);
        assert.fieldEquals(
          "User",
          event.address.toHexString(),
          "votesCount",
          "2"
        );
      });
    });
  });

  describe("handleItemAdded", () => {
    describe("When new user", () => {
      test("Item created and stored", () => {
        const id = BigInt.fromI32(1);
        const title = "Item #1";
        const author = Address.fromString(
          "0x0000000000000000000000000000000000000001"
        );
        const event = createItemAddedEvent(id, title, author);

        handleItemAdded(event);

        assert.entityCount("Item", 1);

        assert.fieldEquals("Item", "1", "title", title);
        assert.fieldEquals("Item", "1", "votesCount", "0");
        assert.fieldEquals("Item", "1", "author", author.toHexString());
        assert.fieldEquals(
          "Item",
          "1",
          "blockNumber",
          event.block.number.toString()
        );
        assert.fieldEquals(
          "Item",
          "1",
          "blockTimestamp",
          event.block.timestamp.toString()
        );
        assert.fieldEquals(
          "Item",
          "1",
          "transactionHash",
          event.transaction.hash.toHexString()
        );
      });

      test("User created and stored", () => {
        const id = BigInt.fromI32(1);
        const title = "Item #1";
        const author = Address.fromString(
          "0x0000000000000000000000000000000000000001"
        );
        const event = createItemAddedEvent(id, title, author);

        handleItemAdded(event);

        assert.entityCount("User", 1);
        assert.fieldEquals("User", author.toHexString(), "itemsCount", "1");
        assert.fieldEquals("User", author.toHexString(), "votesCount", "0");
      });
    });

    describe("When recurring user", () => {
      beforeEach(() => {
        const author = Address.fromString(
          "0x0000000000000000000000000000000000000001"
        );
        const user = new User(author);
        user.itemsCount = BIG_INT_ONE;
        user.votesCount = BIG_INT_ZERO;
        user.save();
      });

      test("Item created and stored", () => {
        const id = BigInt.fromI32(1);
        const title = "Item #1";
        const author = Address.fromString(
          "0x0000000000000000000000000000000000000001"
        );
        const event = createItemAddedEvent(id, title, author);

        handleItemAdded(event);
        assert.entityCount("Item", 1);
        assert.fieldEquals("Item", "1", "title", title);
        assert.fieldEquals("Item", "1", "votesCount", "0");
        assert.fieldEquals("Item", "1", "author", author.toHexString());
        assert.fieldEquals(
          "Item",
          "1",
          "blockNumber",
          event.block.number.toString()
        );
        assert.fieldEquals(
          "Item",
          "1",
          "blockTimestamp",
          event.block.timestamp.toString()
        );
        assert.fieldEquals(
          "Item",
          "1",
          "transactionHash",
          event.transaction.hash.toHexString()
        );
      });

      test("User updated", () => {
        const id = BigInt.fromI32(1);
        const title = "Item #1";
        const author = Address.fromString(
          "0x0000000000000000000000000000000000000001"
        );
        const event = createItemAddedEvent(id, title, author);
        handleItemAdded(event);

        assert.entityCount("User", 1);
        assert.fieldEquals("User", author.toHexString(), "itemsCount", "2");
        assert.fieldEquals("User", author.toHexString(), "votesCount", "0");
      });
    });
  });
});
