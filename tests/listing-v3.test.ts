import {
  assert,
  describe,
  test,
  clearStore,
  afterEach,
  beforeEach,
} from "matchstick-as/assembly/index";
import { Address, BigInt } from "@graphprotocol/graph-ts";
import { handleItemVoted } from "../src/listing-v3";
import { createItemAddedEvent, createItemVotedEvent } from "./listing-v3-utils";
import { Item, User } from "../generated/schema";
import { BIG_INT_ONE, BIG_INT_ZERO } from "../src/utils/constants";

const voter = Address.fromString("0x0000000000000000000000000000000000000002");

describe("ListingV3", () => {
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
        const event = createItemVotedEvent(id, voter);
        handleItemVoted(event);
        assert.fieldEquals("Item", "1", "votesCount", "1");
      });
      test("User created and update [votesCount]", () => {
        const id = BigInt.fromI32(1);
        const event = createItemVotedEvent(id, voter);
        handleItemVoted(event);
        assert.entityCount("User", 1);
        assert.fieldEquals("User", voter.toHexString(), "votesCount", "1");
      });
      test("Vote created", () => {
        const id = BigInt.fromI32(1);
        const event = createItemVotedEvent(id, voter);

        handleItemVoted(event);

        const voteId = voter
          .toHexString()
          .concat("-")
          .concat(id.toString());

        assert.entityCount("Vote", 1);
        assert.fieldEquals("Vote", voteId, "item", id.toString());
        assert.fieldEquals("Vote", voteId, "user", voter.toHexString());
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
        const user = new User(voter);
        user.votesCount = BIG_INT_ONE;
        user.itemsCount = BIG_INT_ZERO;
        user.save();
      });

      test("Item updated: [votesCount]", () => {
        const id = BigInt.fromI32(1);
        const event = createItemVotedEvent(id, voter);
        handleItemVoted(event);
        assert.fieldEquals("Item", "1", "votesCount", "1");
      });

      test("Vote created", () => {
        const id = BigInt.fromI32(1);
        const event = createItemVotedEvent(id, voter);

        handleItemVoted(event);

        const voteId = voter
          .toHexString()
          .concat("-")
          .concat(id.toString());

        assert.entityCount("Vote", 1);
        assert.fieldEquals("Vote", voteId, "item", id.toString());
        assert.fieldEquals("Vote", voteId, "user", voter.toHexString());
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
        const event = createItemVotedEvent(id, voter);

        handleItemVoted(event);

        assert.entityCount("User", 1);
        assert.fieldEquals("User", voter.toHexString(), "votesCount", "2");
      });
    });
  });
});
