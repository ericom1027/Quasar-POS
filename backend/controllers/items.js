const itemModel = require("../models/items");

exports.addItemController = (req, res) => {
  let newItemData = {
    itemName: req.body.itemName,
    price: req.body.price,
    category: req.body.category,
    image: req.file ? req.file.filename : null,
  };

  // if (req.body.category !== "rice" && req.body.category) {
  //   newItemData.size = req.body.size;
  // }

  let newItem = new itemModel(newItemData);

  itemModel
    .findOne({ itemName: req.body.itemName })
    .then((existingItem) => {
      if (existingItem) {
        return res.status(409).send({ error: "Item already exists" });
      }

      return newItem
        .save()
        .then((savedItem) => {
          res.status(201).send(savedItem);
        })
        .catch((saveErr) => {
          console.error("Error in saving item: ", saveErr);
          res.status(500).send({ error: "Failed to save the item" });
        });
    })
    .catch((findErr) => {
      console.error("Error in finding the item: ", findErr);
      return res.status(500).send({ error: "Error finding the item" });
    });
};

// Get Items
exports.getItems = (req, res) => {
  return itemModel
    .find({})
    .then((items) => {
      if (items.length > 0) {
        return res.status(200).send({ items });
      } else {
        return res.status(200).send({ message: "No items found." });
      }
    })
    .catch((err) => {
      console.error("Error in finding all items:", err);
      return res.status(500).send({ error: "Error finding items." });
    });
};

exports.EditItem = (req, res) => {
  const itemId = req.params.id;
  //   console.log(itemId);
  let editItem = {
    itemName: req.body.itemName,
    size: req.body.size,
    price: req.body.price,
    category: req.body.category,
    image: req.file ? req.file.filename : null,
  };

  itemModel
    .findByIdAndUpdate(itemId, editItem, { new: true })
    .then((updatedItem) => {
      if (!updatedItem) {
        return res.status(404).send({ error: "Item not found" });
      }
      return res.status(200).send({
        message: "Item updated successfully",
        updatedItem: updatedItem,
      });
    })
    .catch((err) => {
      console.error("Error in updating an item: ", err);
      return res.status(500).send({ error: "Error in updating an item." });
    });
};

// Delete ITEM
exports.DeleteItem = (req, res) => {
  const itemId = req.params.id;

  itemModel
    .findByIdAndDelete(itemId)
    .then((deletedItem) => {
      if (!deletedItem) {
        return res.status(404).send({ error: "Item not found" });
      }
      return res.status(200).send({
        message: "Item deleted successfully",
        deletedItem: deletedItem,
      });
    })
    .catch((err) => {
      console.error("Error in deleting an item: ", err);
      return res.status(500).send({ error: "Error in deleting an item." });
    });
};
