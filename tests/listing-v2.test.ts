import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll,
} from "matchstick-as/assembly/index";
import { Address, BigInt } from "@graphprotocol/graph-ts";
import { handleItemAdded } from "../src/listing-v2";
import { createItemAddedEvent } from "./listing-v2-utils";
import { User } from "../generated/schema";
import { BIG_INT_ONE, BIG_INT_ZERO } from "../src/utils/constants";

const id = BigInt.fromI32(1);
const title = "Item #1";
const author = Address.fromString("0x0000000000000000000000000000000000000001");
const event = createItemAddedEvent(id, title, author);

describe("ListingV2", () => {
  afterAll(() => {
    clearStore();
  });

  describe("When new user", () => {
    beforeAll(() => {
      handleItemAdded(event);
    });

    test("Item created and stored", () => {
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
      assert.entityCount("User", 1);
      assert.fieldEquals("User", author.toHexString(), "itemsCount", "1");
      assert.fieldEquals("User", author.toHexString(), "votesCount", "0");
    });
  });

  describe("When recurring user", () => {
    beforeAll(() => {
      const user = new User(author);
      user.itemsCount = BIG_INT_ONE;
      user.votesCount = BIG_INT_ZERO;
      user.save();

      handleItemAdded(event);
    });

    test("Item created and stored", () => {
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
      assert.entityCount("User", 1);
      assert.fieldEquals("User", author.toHexString(), "itemsCount", "2");
      assert.fieldEquals("User", author.toHexString(), "votesCount", "0");
    });
  });
});
