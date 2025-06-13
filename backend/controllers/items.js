const itemModel = require("../models/items");

exports.addItemController = (req, res) => {
  let newItemData = {
    itemName: req.body.itemName,
    price: req.body.price,
    size: req.body.size || "",
    category: req.body.category,
    image: req.file ? req.file.filename : null,
    stock: req.body.stock || 0,
  };

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
  const LOW_STOCK_THRESHOLD = 5;

  return itemModel
    .find({})
    .sort({ itemName: 1 })
    .then((items) => {
      if (items.length > 0) {
        const updatedItems = items.map((item) => {
          return {
            ...item.toObject(),
            lowStock: item.stock <= LOW_STOCK_THRESHOLD,
          };
        });

        return res.status(200).send({ items: updatedItems });
      } else {
        return res.status(200).send({ message: "No items found." });
      }
    })
    .catch((err) => {
      console.error("Error in finding all items:", err);
      return res.status(500).send({ error: "Error finding items." });
    });
};

exports.EditItem = async (req, res) => {
  const itemId = req.params.id;

  try {
    const existingItem = await itemModel.findById(itemId);
    if (!existingItem) {
      return res.status(404).send({ error: "Item not found" });
    }

    const duplicateItem = await itemModel.findOne({
      itemName: req.body.itemName,
      _id: { $ne: itemId },
    });

    if (duplicateItem) {
      return res.status(409).send({ error: "Item already exists" });
    }

    let stockValue = req.body.stock;
    if (Array.isArray(stockValue)) {
      stockValue = stockValue[0];
    }

    let updatedData = {
      itemName: req.body.itemName,
      size: req.body.size || "",
      price: req.body.price,
      stock: Number(stockValue),
      category: req.body.category,
      image: req.file ? req.file.filename : existingItem.image,
    };

    const updatedItem = await itemModel.findByIdAndUpdate(itemId, updatedData, {
      new: true,
    });

    return res.status(200).send({
      message: "Item updated successfully",
      updatedItem: updatedItem,
    });
  } catch (err) {
    console.error("Error in updating an item: ", err);
    return res.status(500).send({ error: "Error in updating an item." });
  }
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
