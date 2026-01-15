"use strict";const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

const userController = require("../controllers/userController.js");
const auth = require("../middlewares/authMiddleware.js");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/profiles");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "profile-" + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Apenas imagens são permitidas!"), false);
  }
});

router.post("/register", userController.register);
router.post("/login", userController.login);

router.get("/me", auth, userController.me);

router.put("/edit/:id", auth, userController.update);
router.delete("/delete/:id", auth, userController.deleteUser);

router.post(
  "/upload-profile/:id",
  auth,
  upload.single("foto"),
  userController.uploadFotoPerfil
);

module.exports = router;
