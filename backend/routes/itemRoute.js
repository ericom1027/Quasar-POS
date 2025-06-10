const express = require("express");

const ItemsController = require("../controllers/items");
const upload = require("../middlewares/upload");

const auth = require("../middlewares/auth");
const router = express.Router();

router.post(
  "/add-item",
  auth.verify,
  auth.verifyAdmin,
  upload.single("image"),
  ItemsController.addItemController
);

router.get("/get", auth.verify, ItemsController.getItems);

router.put(
  "/items/:id",
  auth.verify,
  auth.verifyAdmin,
  upload.single("image"),
  ItemsController.EditItem
);

router.delete(
  "/:id",
  auth.verify,
  auth.verifyAdmin,
  ItemsController.DeleteItem
);

module.exports = router;
